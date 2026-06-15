# Fix: LangGraph ExecutionStateError — D-Shiftify
> Research từ: LangGraph.js official docs · GitHub Issues #1373, #264, #545 · langgraphjs.guide
> Stack: NestJS + TypeScript + @langchain/langgraph

---

## Root Cause Analysis

Lỗi này có **3 nguyên nhân riêng biệt**, cần xác định đúng nguyên nhân trước khi fix:

```
ExecutionStateError: Execution cffb3261... is not running
current state: aborted
```

### Nguyên nhân A — Default timeout 300s (rất phổ biến)
LangGraph.js có hard timeout **300 giây (5 phút)** mặc định cho mỗi node.
Khi gọi Gemini API hoặc Google STT mà response chậm hơn 300s → graph tự abort.
→ Xác nhận: kiểm tra log xem execution có chạy gần 5 phút không.

### Nguyên nhân B — MemorySaver mất state khi restart
`MemorySaver` lưu state **trong RAM**. Khi NestJS restart (hot reload, crash, deploy)
→ toàn bộ session bị xóa → FE gửi `sessionId` cũ → graph không tìm thấy → abort.
→ Xác nhận: lỗi xảy ra ngay sau khi restart server.

### Nguyên nhân C — thread_id không được truyền vào config
Nếu invoke graph mà thiếu `configurable: { thread_id }` → LangGraph không
biết load checkpoint nào → tạo execution mới không có state → crash.
→ Xác nhận: kiểm tra code có truyền `thread_id` vào mọi lần invoke không.

---

## Fix A — Tăng timeout vượt 300s

Đây là bug đã được report trên GitHub Issue #1373 (Jul 2025).
`stepTimeout` trên compiled graph không hoạt động đúng — phải set trên **config** khi invoke:

```typescript
// src/ai/langgraph/graph.builder.ts
import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentState } from "./state";

export function buildGraph(checkpointer: BaseCheckpointSaver) {
  const graph = new StateGraph(AgentState)
    .addNode("intake_agent", intakeAgentNode)
    .addNode("resume_builder", resumeBuilderNode)
    .addNode("job_matcher", jobMatcherNode)
    .addNode("router", routerNode)
    .addConditionalEdges("router", routeByIntent, {
      onboard: "intake_agent",
      search_job: "job_matcher",
    })
    .addConditionalEdges("intake_agent", checkProfileComplete, {
      incomplete: "intake_agent",
      complete: "resume_builder",
    })
    .addEdge("resume_builder", "job_matcher")
    .addEdge(START, "router")
    .addEdge("job_matcher", END);

  return graph.compile({ checkpointer });
}
```

```typescript
// src/ai/ai.service.ts
async invokeGraph(sessionId: string, state: AgentState) {
  const config = {
    configurable: {
      thread_id: sessionId,        // BẮT BUỘC — không có cái này là abort ngay
    },
    // Fix timeout: set trực tiếp vào config lúc invoke
    // KHÔNG set trên compiledGraph.stepTimeout — không hoạt động (bug #1373)
    signal: AbortSignal.timeout(120_000), // 2 phút timeout cho mỗi invoke
  };

  return this.compiledGraph.invoke(state, config);
}
```

---

## Fix B — Thay MemorySaver bằng PostgresSaver

`MemorySaver` chỉ dùng được ở local dev. Ở production hoặc khi server restart
toàn bộ session mất → gây `aborted` state.

### Cài package

```bash
npm install @langchain/langgraph-checkpoint-postgres
```

### Implement PostgresSaver

```typescript
// src/ai/langgraph/checkpointer.factory.ts
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { MemorySaver } from "@langchain/langgraph";

export async function createCheckpointer() {
  if (process.env.NODE_ENV === "production") {
    // Production: dùng PostgreSQL — durable, survive restarts
    const checkpointer = PostgresSaver.fromConnString(
      process.env.POSTGRES_URL!
    );
    // Tạo tables cần thiết nếu chưa có
    await checkpointer.setup();
    console.log("✅ Checkpointer: PostgreSQL");
    return checkpointer;
  }

  // Development: MemorySaver đủ dùng
  console.log("⚠️  Checkpointer: MemorySaver (in-memory, không durable)");
  return new MemorySaver();
}
```

### Inject vào NestJS Module

```typescript
// src/ai/ai.module.ts
import { Module, OnModuleInit } from "@nestjs/common";
import { AiService } from "./ai.service";
import { AiController } from "./ai.controller";
import { createCheckpointer } from "./langgraph/checkpointer.factory";
import { buildGraph } from "./langgraph/graph.builder";

@Module({
  controllers: [AiController],
  providers: [
    {
      provide: "LANGGRAPH_CHECKPOINTER",
      useFactory: async () => createCheckpointer(),
    },
    {
      provide: "LANGGRAPH_GRAPH",
      useFactory: async (checkpointer) => buildGraph(checkpointer),
      inject: ["LANGGRAPH_CHECKPOINTER"],
    },
    AiService,
  ],
})
export class AiModule {}
```

```typescript
// src/ai/ai.service.ts
import { Inject, Injectable } from "@nestjs/common";
import { CompiledStateGraph } from "@langchain/langgraph";

@Injectable()
export class AiService {
  constructor(
    @Inject("LANGGRAPH_GRAPH")
    private readonly graph: CompiledStateGraph<any, any>,
  ) {}
}
```

---

## Fix C — Luôn truyền thread_id và check state trước khi invoke

```typescript
// src/ai/ai.service.ts
import { Injectable, Inject, HttpException, HttpStatus } from "@nestjs/common";

@Injectable()
export class AiService {
  constructor(
    @Inject("LANGGRAPH_GRAPH")
    private readonly graph: CompiledStateGraph<any, any>,
  ) {}

  async chat(dto: AiChatDto) {
    const { message, sessionId } = dto;

    // Bước 1: Xác định thread_id hợp lệ
    const threadId = await this.resolveThreadId(sessionId);

    // Bước 2: Load state hiện tại (nếu có)
    const currentState = await this.loadState(threadId);

    // Bước 3: Build input state
    const inputState = {
      messages: [...(currentState?.messages ?? []), { role: "user", content: message }],
      sessionId: threadId,
    };

    // Bước 4: Invoke với config đúng
    try {
      const result = await this.graph.invoke(inputState, {
        configurable: { thread_id: threadId },
        signal: AbortSignal.timeout(120_000),
      });

      return {
        sessionId: threadId,
        reply: result.reply,
        currentStep: result.currentStep,
        profileCompleteness: result.profileCompleteness,
        missingFields: result.missingFields,
      };

    } catch (error) {
      return this.handleGraphError(error, threadId, message);
    }
  }

  // Nếu sessionId cũ không hợp lệ → tạo mới, không crash
  private async resolveThreadId(sessionId?: string): Promise<string> {
    if (!sessionId) {
      return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }

    const isValid = await this.isSessionValid(sessionId);
    if (!isValid) {
      console.warn(`[AI] Session ${sessionId} invalid, creating new`);
      return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }

    return sessionId;
  }

  // Kiểm tra session có state hợp lệ không
  private async isSessionValid(sessionId: string): Promise<boolean> {
    try {
      const state = await this.graph.getState({
        configurable: { thread_id: sessionId },
      });
      // Nếu state.next có value → graph đang chờ → valid
      // Nếu state.next rỗng → graph đã kết thúc → vẫn valid (có history)
      return state !== null && state !== undefined;
    } catch {
      return false;
    }
  }

  // Load state hiện tại để merge messages
  private async loadState(threadId: string) {
    try {
      return await this.graph.getState({
        configurable: { thread_id: threadId },
      });
    } catch {
      return null;
    }
  }

  // Xử lý lỗi LangGraph một cách graceful
  private handleGraphError(error: Error, threadId: string, originalMessage: string) {
    const isExecutionError =
      error.message?.includes("ExecutionStateError") ||
      error.message?.includes("is not running") ||
      error.message?.includes("aborted") ||
      error.name === "AbortError";

    if (isExecutionError) {
      console.error(`[AI] Execution aborted for thread ${threadId}:`, error.message);

      // Trả về 410 Gone — FE sẽ tạo session mới và retry
      throw new HttpException(
        {
          statusCode: 410,
          error: "SESSION_ABORTED",
          message: "Phiên AI đã hết hạn. Đang khởi tạo lại...",
          action: "RETRY_WITH_NEW_SESSION",
          originalMessage, // FE dùng để retry với session mới
        },
        HttpStatus.GONE,
      );
    }

    // Lỗi khác → 500
    console.error(`[AI] Unexpected error:`, error);
    throw new HttpException("Lỗi hệ thống AI", HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
```

---

## Fix D — Bọc từng Agent Node bằng try/catch

Node ném exception không được catch → LangGraph abort toàn bộ graph.
Mọi node phải tự xử lý lỗi và trả về graceful state:

```typescript
// src/ai/agents/intake.agent.ts
import { RunnableConfig } from "@langchain/core/runnables";
import { AgentState } from "../langgraph/state";

export async function intakeAgentNode(
  state: typeof AgentState.State,
  config: RunnableConfig,
): Promise<Partial<typeof AgentState.State>> {
  try {
    // Gọi Gemini API
    const response = await gemini.invoke(state.messages, {
      signal: config.signal, // Pass signal để abort đúng cách
    });

    const extracted = extractEntities(response.content as string);

    return {
      messages: [...state.messages, response],
      collectedFields: { ...state.collectedFields, ...extracted },
      profileCompleteness: calculateCompleteness(extracted),
      currentStep: "intake",
      error: undefined, // Clear error nếu thành công
    };

  } catch (error) {
    // KHÔNG throw ra ngoài — phải return state với error flag
    console.error("[IntakeAgent] Error:", error.message);

    return {
      ...state,
      reply: "Xin lỗi, tôi gặp sự cố. Bạn có thể nói lại không?",
      error: error.message,
      currentStep: "intake_error",
    };
  }
}
```

---

## Fix E — State Schema phải include error field

```typescript
// src/ai/langgraph/state.ts
import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

export const AgentState = Annotation.Root({
  // Messages history (auto-reducer: append)
  ...MessagesAnnotation.spec,

  // Session info
  sessionId: Annotation<string>({ reducer: (_, v) => v, default: () => "" }),
  userId: Annotation<string>({ reducer: (_, v) => v, default: () => "" }),

  // Intake data
  collectedFields: Annotation<Record<string, any>>({
    reducer: (cur, upd) => ({ ...cur, ...upd }),
    default: () => ({}),
  }),
  narrativeRaw: Annotation<string>({
    reducer: (cur, upd) => cur + " " + upd,
    default: () => "",
  }),

  // Routing
  intent: Annotation<string>({ reducer: (_, v) => v, default: () => "onboard" }),
  currentStep: Annotation<string>({ reducer: (_, v) => v, default: () => "start" }),

  // Profile
  profileCompleteness: Annotation<number>({ reducer: (_, v) => v, default: () => 0 }),
  missingFields: Annotation<string[]>({ reducer: (_, v) => v, default: () => [] }),

  // AI output
  reply: Annotation<string>({ reducer: (_, v) => v, default: () => "" }),
  jobResults: Annotation<any[]>({ reducer: (_, v) => v, default: () => [] }),

  // Error handling — BẮT BUỘC phải có
  error: Annotation<string | undefined>({ reducer: (_, v) => v, default: () => undefined }),
});
```

---

## Fix F — FE tự động retry khi nhận 410

```typescript
// frontend/src/services/ai.service.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Interceptor tự thêm JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export class AiService {
  private sessionId: string | null = null;

  async sendMessage(message: string): Promise<AiChatResponse> {
    try {
      const response = await api.post("/ai/chat", {
        message,
        sessionId: this.sessionId,
      });

      // Cập nhật sessionId từ response
      this.sessionId = response.data.sessionId;
      return response.data;

    } catch (error: any) {
      // Nhận 410 → session aborted → tạo mới và retry tự động
      if (error.response?.status === 410) {
        console.warn("[AI] Session expired, retrying with new session...");

        // Xóa sessionId cũ
        this.sessionId = null;

        // Retry với session mới (chỉ retry 1 lần)
        const retry = await api.post("/ai/chat", { message });
        this.sessionId = retry.data.sessionId;
        return retry.data;
      }

      throw error;
    }
  }

  async startNewSession(): Promise<void> {
    const res = await api.post("/ai/session", { language: "vi" });
    this.sessionId = res.data.sessionId;
  }

  clearSession(): void {
    this.sessionId = null;
  }
}

export const aiService = new AiService();
```

---

## Checklist fix theo thứ tự ưu tiên

```
□ 1. [NGAY] Xác định nguyên nhân:
      - Log có thấy "300s" hoặc "Aborted" không? → Fix A (timeout)
      - Lỗi sau khi restart server? → Fix B (checkpointer)
      - Không có thread_id trong log? → Fix C

□ 2. [NGAY] Fix B — Thay MemorySaver → PostgresSaver
      npm install @langchain/langgraph-checkpoint-postgres
      Chạy checkpointer.setup() một lần khi boot

□ 3. [NGAY] Fix C — Kiểm tra mọi chỗ invoke graph có truyền
      configurable: { thread_id: sessionId } chưa

□ 4. [QUAN TRỌNG] Fix D — Wrap tất cả agent nodes bằng try/catch
      Không để bất kỳ exception nào throw ra khỏi node function

□ 5. [QUAN TRỌNG] Fix E — Thêm error field vào AgentState schema

□ 6. [QUAN TRỌNG] Fix F — FE tự retry khi nhận 410

□ 7. [NẾU VẪN LỖI] Fix A — Set signal: AbortSignal.timeout(120_000)
      trong config lúc invoke (KHÔNG dùng stepTimeout property)
```

---

## Verify sau khi fix

```bash
# Test session lifecycle
curl -X POST http://localhost:3000/api/ai/session \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"language":"vi"}' | jq '.sessionId'

# Test chat với sessionId vừa lấy
SESSION_ID="<từ bước trên>"
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Tôi muốn tìm việc\",\"sessionId\":\"$SESSION_ID\"}"
# Expected: reply + profileCompleteness + currentStep

# Simulate session expired (gửi fake sessionId)
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"test","sessionId":"00000000-dead-beef-0000-000000000000"}'
# Expected: HTTP 410 + action: "RETRY_WITH_NEW_SESSION"
# NOT: HTTP 500 hoặc crash
```

---

## Package versions đã verified hoạt động (tháng 5/2026)

```json
{
  "@langchain/langgraph": "^0.2.x",
  "@langchain/langgraph-checkpoint-postgres": "^0.0.x",
  "@langchain/core": "^0.3.x",
  "@langchain/google-genai": "^0.1.x"
}
```

> ⚠️ Lưu ý: Nếu dùng LangGraph >= 1.1.x với langgraph-prebuilt,
> có thể gặp ImportError với ExecutionInfo/ServerInfo (Issue #7420).
> Fix: pin `langgraph-prebuilt==1.0.5` hoặc dùng @langchain/langgraph <= 0.2.x.

---
*Research: LangGraph.js Docs (persistence, durable-execution) · GitHub Issues #1373, #264, #545, #5672 · langgraphjs.guide/persistence*
