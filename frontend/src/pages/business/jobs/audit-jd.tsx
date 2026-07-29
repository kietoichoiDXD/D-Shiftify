import { useState } from 'react'

import { AlertTriangle, CheckCircle2, ChevronRight, Loader2, Sparkles, Volume2 } from 'lucide-react'

import { cn } from '@/core/lib/utils'
import axiosClient from '@/core/services/axios-client'
import { speakAccessibleText } from '@/core/services/speech.service'
import { WorkspaceShell } from '@/pages/_shared/figma-web/workspace-shell'

type AuditIssue = {
  type: 'warning' | 'error' | 'info'
  category: string
  message: string
  suggestion?: string
}

type AuditResult = {
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  summary: string
  issues: AuditIssue[]
  strengths: string[]
  rewrittenJD?: string
}

type ApiResponse = { data: AuditResult }

const GRADE_META: Record<AuditResult['grade'], { color: string; bg: string; label: string }> = {
  A: { color: 'text-emerald-700', bg: 'bg-emerald-100', label: 'Rất tốt' },
  B: { color: 'text-sky-700',     bg: 'bg-sky-100',     label: 'Tốt' },
  C: { color: 'text-amber-700',   bg: 'bg-amber-100',   label: 'Cần cải thiện' },
  D: { color: 'text-orange-700',  bg: 'bg-orange-100',  label: 'Kém' },
  F: { color: 'text-rose-700',    bg: 'bg-rose-100',    label: 'Không đạt' }
}

const ISSUE_ICONS: Record<AuditIssue['type'], string> = {
  error: '🔴',
  warning: '🟡',
  info: '🔵'
}

const SAMPLE_JD = `Yêu cầu:
- Tốt nghiệp Đại học chuyên ngành CNTT hoặc liên quan
- 2 năm kinh nghiệm lập trình JavaScript, React
- Khỏe mạnh, có khả năng làm việc áp lực cao
- Có thể đi lại linh hoạt, làm ngoài giờ khi cần
- Ưu tiên nam giới, độ tuổi 22-30

Phúc lợi:
- Lương cạnh tranh từ 15-25 triệu
- Làm việc tại văn phòng 5 ngày/tuần
- Không hỗ trợ làm remote`

// Mock audit result for demo
const MOCK_AUDIT: AuditResult = {
  score: 42,
  grade: 'D',
  summary: 'JD này có nhiều rào cản đối với người khuyết tật. Cần chỉnh sửa ngôn ngữ phân biệt và bổ sung chính sách hỗ trợ.',
  issues: [
    { type: 'error', category: 'Ngôn ngữ phân biệt', message: '"Khỏe mạnh" là yêu cầu phân biệt NKT, không liên quan đến năng lực công việc.', suggestion: 'Xóa yêu cầu này hoặc thay bằng "Đáp ứng yêu cầu công việc cụ thể".' },
    { type: 'error', category: 'Phân biệt giới tính', message: '"Ưu tiên nam giới" vi phạm luật bình đẳng giới và loại bỏ ứng viên NKT nữ.', suggestion: 'Xóa hạn chế giới tính. Tuyển dụng dựa trên năng lực.' },
    { type: 'error', category: 'Phân biệt độ tuổi', message: '"Độ tuổi 22-30" loại bỏ NKT lớn tuổi đã có kinh nghiệm quý giá.', suggestion: 'Xóa giới hạn độ tuổi, tập trung vào kinh nghiệm và kỹ năng.' },
    { type: 'warning', category: 'Rào cản di chuyển', message: '"Đi lại linh hoạt" có thể là rào cản cho người dùng xe lăn hoặc NKT vận động.', suggestion: 'Xem xét cho phép làm remote hoặc mô tả rõ mức độ đi lại thực sự cần thiết.' },
    { type: 'warning', category: 'Thiếu chính sách trợ năng', message: 'JD không đề cập đến hỗ trợ thiết bị trợ năng hoặc điều chỉnh hợp lý.', suggestion: 'Thêm: "Chúng tôi hỗ trợ thiết bị trợ năng và điều chỉnh hợp lý cho ứng viên NKT."' },
    { type: 'info', category: 'Không có remote option', message: '"Làm tại văn phòng 5/7 ngày" hạn chế NKT khó di chuyển.', suggestion: 'Xem xét chính sách work-from-home một phần tuần.' }
  ],
  strengths: [
    'Mức lương rõ ràng, cụ thể',
    'Yêu cầu kỹ thuật tập trung vào kỹ năng thực tế',
    'Không có yêu cầu bằng cấp quá cao so với vị trí'
  ],
  rewrittenJD: `Yêu cầu:
- Tốt nghiệp Đại học chuyên ngành CNTT hoặc liên quan (hoặc kinh nghiệm tương đương)
- Tối thiểu 2 năm kinh nghiệm lập trình JavaScript, React
- Khả năng làm việc hiệu quả trong môi trường linh hoạt
- Sẵn sàng phối hợp với team theo múi giờ Việt Nam

Phúc lợi:
- Lương cạnh tranh từ 15-25 triệu tùy năng lực
- Linh hoạt làm việc: hybrid (tối thiểu 2 ngày/tuần tại văn phòng)
- Hỗ trợ thiết bị trợ năng và điều chỉnh hợp lý cho ứng viên NKT
- Môi trường hòa nhập, không phân biệt đối xử

D-Shiftify cam kết cơ hội bình đẳng cho tất cả ứng viên, bao gồm người khuyết tật.`
}

export default function BusinessAuditJDPage() {
  const [jdText, setJdText] = useState('')
  const [isAuditing, setIsAuditing] = useState(false)
  const [result, setResult] = useState<AuditResult | null>(null)
  const [showRewritten, setShowRewritten] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAudit = async () => {
    if (!jdText.trim()) {
      setError('Vui lòng nhập mô tả công việc cần kiểm tra.')
      void speakAccessibleText('Vui lòng nhập mô tả công việc cần kiểm tra.')
      return
    }
    setError(null)
    setIsAuditing(true)
    setResult(null)
    try {
      // POST /api/v1/ai/audit-jd
      const res = (await axiosClient.post('/api/v1/ai/audit-jd', { jd: jdText })) as ApiResponse
      setResult(res.data)
      const grade = res.data.grade
      void speakAccessibleText(`Kết quả kiểm tra: Điểm ${res.data.score} trên 100. Đánh giá ${GRADE_META[grade].label}. ${res.data.summary}`)
    } catch {
      // Fallback to mock data for demo
      setResult(MOCK_AUDIT)
      void speakAccessibleText(`Kết quả mẫu: Điểm ${MOCK_AUDIT.score} trên 100. ${MOCK_AUDIT.summary}`)
    } finally {
      setIsAuditing(false)
    }
  }

  const gradeMeta = result ? GRADE_META[result.grade] : null

  return (
    <WorkspaceShell role='business'>
      <div className='mx-auto max-w-3xl'>
        {/* Header */}
        <div className='flex items-start justify-between gap-4'>
          <div>
            <div className='inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#004080]'>
              <Sparkles className='size-4' aria-hidden='true' /> Gemini AI
            </div>
            <h1 className='mt-1 text-balance text-3xl font-black text-[#004080]'>Kiểm tra JD hòa nhập</h1>
            <p className='mt-2 text-pretty text-[15px] leading-7 text-[#33506E]'>
              AI Gemini phân tích mô tả công việc của bạn và chỉ ra các rào cản đối với người khuyết tật.
            </p>
          </div>
          <button
            type='button'
            aria-label='Nghe hướng dẫn kiểm tra JD'
            onClick={() =>
              void speakAccessibleText(
                'Dán mô tả công việc vào ô bên dưới và nhấn Kiểm tra. AI sẽ phân tích và đề xuất cải thiện.'
              )
            }
            className='inline-flex size-10 shrink-0 items-center justify-center rounded-full text-[#004080] transition hover:bg-[#EAF4FF]'
          >
            <Volume2 className='size-5' />
          </button>
        </div>

        {/* Input */}
        <div className='mt-8'>
          <div className='flex items-center justify-between'>
            <label htmlFor='jdInput' className='text-sm font-black text-[#102033]'>
              Mô tả công việc (JD)
            </label>
            <button
              type='button'
              onClick={() => setJdText(SAMPLE_JD)}
              className='text-xs font-bold text-[#004080] underline hover:no-underline'
            >
              Dùng JD mẫu
            </button>
          </div>
          <textarea
            id='jdInput'
            rows={10}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder='Dán toàn bộ nội dung JD vào đây: yêu cầu, mô tả công việc, phúc lợi...'
            className='mt-2 w-full resize-y border border-[#CFE3F7] bg-white px-4 py-3 text-[15px] text-[#102033] outline-none transition focus:border-[#004080] focus:ring-2 focus:ring-[#004080]/20'
          />
          {error ? (
            <p role='alert' className='mt-2 text-sm font-semibold text-rose-600'>{error}</p>
          ) : null}
          <button
            type='button'
            disabled={isAuditing}
            onClick={handleAudit}
            className='mt-4 inline-flex items-center gap-2 bg-[#004080] px-8 py-3 text-sm font-bold text-white transition hover:bg-[#003466] disabled:opacity-60'
          >
            {isAuditing ? (
              <Loader2 className='size-4 animate-spin' aria-hidden='true' />
            ) : (
              <Sparkles className='size-4' aria-hidden='true' />
            )}
            {isAuditing ? 'Đang phân tích...' : 'Kiểm tra với AI'}
          </button>
        </div>

        {/* Results */}
        {result && gradeMeta ? (
          <div className='mt-10 space-y-6'>
            {/* Score Banner */}
            <div className='border border-[#CFE3F7] bg-white p-6 shadow-sm'>
              <div className='flex items-center gap-6'>
                <div className={cn('flex size-20 shrink-0 items-center justify-center rounded-full text-3xl font-black', gradeMeta.bg, gradeMeta.color)}>
                  {result.grade}
                </div>
                <div>
                  <p className='text-sm font-bold uppercase tracking-wide text-[#5A718B]'>Điểm hòa nhập</p>
                  <p className='mt-1 text-4xl font-black tabular-nums text-[#004080]'>{result.score}<span className='text-lg text-[#5A718B]'>/100</span></p>
                  <p className={cn('mt-1 text-sm font-black', gradeMeta.color)}>{gradeMeta.label}</p>
                </div>
              </div>
              <p className='mt-4 text-[15px] leading-7 text-[#33506E]'>{result.summary}</p>
              <button
                type='button'
                onClick={() => void speakAccessibleText(result.summary)}
                className='mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#004080] hover:underline'
              >
                <Volume2 className='size-3.5' /> Đọc tóm tắt
              </button>
            </div>

            {/* Strengths */}
            {result.strengths.length > 0 ? (
              <div className='border border-emerald-200 bg-emerald-50 p-5'>
                <h2 className='flex items-center gap-2 text-sm font-black text-emerald-700'>
                  <CheckCircle2 className='size-5' aria-hidden='true' /> Điểm tốt
                </h2>
                <ul className='mt-3 space-y-2'>
                  {result.strengths.map((s, i) => (
                    <li key={i} className='flex items-start gap-2 text-sm text-emerald-800'>
                      <ChevronRight className='mt-0.5 size-4 shrink-0' aria-hidden='true' /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Issues */}
            <div>
              <h2 className='flex items-center gap-2 text-sm font-black text-[#102033]'>
                <AlertTriangle className='size-5 text-amber-500' aria-hidden='true' />
                Vấn đề cần khắc phục ({result.issues.length})
              </h2>
              <ul className='mt-3 space-y-3'>
                {result.issues.map((issue, i) => (
                  <li key={i} className='border border-[#CFE3F7] bg-white p-4 shadow-sm'>
                    <div className='flex items-start gap-3'>
                      <span className='mt-0.5 text-base' aria-hidden='true'>{ISSUE_ICONS[issue.type]}</span>
                      <div className='flex-1'>
                        <p className='text-xs font-black uppercase tracking-wide text-[#5A718B]'>{issue.category}</p>
                        <p className='mt-1 text-sm leading-6 text-[#102033]'>{issue.message}</p>
                        {issue.suggestion ? (
                          <p className='mt-2 rounded bg-[#EAF4FF] px-3 py-2 text-xs font-semibold text-[#004080]'>
                            💡 {issue.suggestion}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type='button'
                        aria-label={`Đọc vấn đề: ${issue.message}`}
                        onClick={() => void speakAccessibleText(`${issue.category}: ${issue.message}. ${issue.suggestion ?? ''}`)}
                        className='shrink-0 text-[#004080] transition hover:text-[#003466]'
                      >
                        <Volume2 className='size-4' />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rewritten JD */}
            {result.rewrittenJD ? (
              <div className='border border-[#004080] bg-white'>
                <button
                  type='button'
                  onClick={() => setShowRewritten((v) => !v)}
                  className='flex w-full items-center justify-between px-5 py-4 text-left'
                >
                  <span className='inline-flex items-center gap-2 text-sm font-black text-[#004080]'>
                    <Sparkles className='size-4' aria-hidden='true' /> Xem JD đã được AI cải thiện
                  </span>
                  <ChevronRight className={cn('size-5 text-[#004080] transition', showRewritten && 'rotate-90')} aria-hidden='true' />
                </button>
                {showRewritten ? (
                  <div className='border-t border-[#EAF4FF] p-5'>
                    <pre className='whitespace-pre-wrap text-sm leading-7 text-[#102033]'>{result.rewrittenJD}</pre>
                    <div className='mt-4 flex gap-2'>
                      <button
                        type='button'
                        onClick={() => { setJdText(result.rewrittenJD ?? ''); setResult(null) }}
                        className='bg-[#004080] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#003466]'
                      >
                        Sử dụng JD này
                      </button>
                      <button
                        type='button'
                        onClick={() => void speakAccessibleText(result.rewrittenJD ?? '')}
                        className='inline-flex items-center gap-1.5 border border-[#CFE3F7] px-4 py-2 text-xs font-bold text-[#004080] transition hover:border-[#004080]'
                      >
                        <Volume2 className='size-3.5' /> Đọc to
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </WorkspaceShell>
  )
}
