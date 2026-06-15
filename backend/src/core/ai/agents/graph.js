import { StateGraph, END, START, MemorySaver } from '@langchain/langgraph';
import { AgentState } from './state.js';
import { intakeNode } from './intake.agent.js';
import { resumeNode } from './resume.agent.js';
import { matchNode } from './match.agent.js';
import { xaiNode } from './xai.agent.js';
import { hrNode } from './hr.agent.js';

// Nodes return nextStep as a plain string. Map all terminal values to END.
const route = (state) => {
  const s = state.nextStep;
  if (s === 'intake') return 'intake';
  if (s === 'resume') return 'resume';
  if (s === 'match')  return 'match';
  if (s === 'xai')    return 'xai';
  if (s === 'hr')     return 'hr';
  // 'end', undefined, null → terminate graph
  return END;
};

// MemorySaver is in-process; replace with SqliteSaver / PostgresSaver for prod.
const checkpointer = new MemorySaver();

const graph = new StateGraph(AgentState)
  .addNode('intake', intakeNode)
  .addNode('resume', resumeNode)
  .addNode('match',  matchNode)
  .addNode('xai',    xaiNode)
  .addNode('hr',     hrNode)
  // START → decide first node based on intent
  .addConditionalEdges(START, (s) => (s.nextStep === 'hr' ? 'hr' : 'intake'))
  // Each node loops or advances; all unknown nextStep values exit the graph
  .addConditionalEdges('intake', route, { intake: 'intake', resume: 'resume', [END]: END })
  .addConditionalEdges('resume', route, { match: 'match',   [END]: END })
  .addConditionalEdges('match',  route, { xai: 'xai',       [END]: END })
  .addConditionalEdges('xai',    route, { [END]: END })
  .addConditionalEdges('hr',     route, { [END]: END });

export const aiGraph = graph.compile({ checkpointer });
