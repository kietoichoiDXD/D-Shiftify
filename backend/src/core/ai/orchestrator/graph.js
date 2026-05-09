import { StateGraph, END, START } from '@langchain/langgraph';
import { AgentState } from '../agents/shared/state.js';
import { intakeNode } from '../agents/intake/intake.agent.js';
import { resumeNode } from '../agents/resume/resume.agent.js';
import { matchNode } from '../agents/match/match.agent.js';
import { xaiNode } from '../agents/xai/xai.agent.js';
import { hrNode } from '../agents/hr/hr.agent.js';

const route = (state) => {
  const s = state.nextStep;
  if (s === 'intake') return 'intake';
  if (s === 'resume') return 'resume';
  if (s === 'match') return 'match';
  if (s === 'xai') return 'xai';
  if (s === 'hr') return 'hr';
  return END;
};

const graph = new StateGraph(AgentState)
  .addNode('intake', intakeNode)
  .addNode('resume', resumeNode)
  .addNode('match', matchNode)
  .addNode('xai', xaiNode)
  .addNode('hr', hrNode)

  // Entry: route to intake (job seeker) or hr (employer)
  .addConditionalEdges(START, (s) => (s.nextStep === 'hr' ? 'hr' : 'intake'))

  // intake loops until complete, then → resume
  .addConditionalEdges('intake', route, { intake: 'intake', resume: 'resume', [END]: END })

  // resume → match
  .addConditionalEdges('resume', route, { match: 'match', [END]: END })

  // match → xai
  .addConditionalEdges('match', route, { xai: 'xai', [END]: END })

  // xai → end
  .addConditionalEdges('xai', route, { [END]: END })

  // hr → end
  .addConditionalEdges('hr', route, { [END]: END });

export const aiGraph = graph.compile();
