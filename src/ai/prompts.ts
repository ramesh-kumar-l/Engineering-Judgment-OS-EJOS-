import type { Problem, Decision, SystemMap, Experiment } from '@/domain/types';
import type { ChatMessage } from './types';

export type CoachKind = 'problem' | 'decision' | 'systemMap' | 'experiment';

export type CoachTarget =
  | { kind: 'problem'; data: Problem }
  | { kind: 'decision'; data: Decision }
  | { kind: 'systemMap'; data: SystemMap }
  | { kind: 'experiment'; data: Experiment };

// The coaching philosophy. EJOS coaches judgment — it never grades or scores.
const COACH_SYSTEM = `You are an engineering judgment coach inside EJOS, a tool that helps engineers think better.

Your job is to sharpen the engineer's OWN thinking — never to do it for them, never to grade or score it.

Rules:
- Do NOT give a rating, grade, or numeric score. Never say things like "7/10".
- Surface blind spots: unstated assumptions, missing stakeholders, weak links in reasoning, second-order effects, failure modes they haven't considered.
- Ask 1-3 sharp questions that would most improve the thinking.
- Be concrete and specific to what they wrote — no generic advice.
- Be concise. Use short bullets. Explain the "why" behind each point.
- Respectful peer tone, like a thoughtful staff engineer, not a cheerleader.`;

const list = (label: string, items: string[]) =>
  items.length ? `${label}:\n${items.map((i) => `- ${i}`).join('\n')}` : `${label}: (none listed)`;

function problemUser(p: Problem): string {
  return [
    `Coach me on how I've FRAMED this problem.`,
    `Title: ${p.title || '(untitled)'}`,
    `Statement: ${p.statement || '(empty)'}`,
    list('Assumptions', p.assumptions),
    list('Stakeholders', p.stakeholders),
    `Root-cause notes: ${p.rootCauseNotes || '(empty)'}`,
  ].join('\n\n');
}

function decisionUser(d: Decision): string {
  return [
    `Coach me on this DECISION and my reasoning.`,
    `Title: ${d.title || '(untitled)'}`,
    `Context: ${d.context || '(empty)'}`,
    list('Options considered', d.options),
    `Chosen option: ${d.chosenOption || '(none)'}`,
    `Reasoning: ${d.reasoning || '(empty)'}`,
    `Stated confidence: ${d.confidence}`,
    `Expected outcome: ${d.expectedOutcome || '(empty)'}`,
  ].join('\n\n');
}

function systemMapUser(m: SystemMap): string {
  const label = (id: string) => m.nodes.find((n) => n.id === id)?.label ?? '(removed)';
  const links = m.connections.map(
    (c) => `- ${label(c.fromId)} ${c.polarity} ${label(c.toId)}${c.note ? ` (${c.note})` : ''}`,
  );
  return [
    `Coach me on this SYSTEM MAP. Look for missing connections, loops, and leverage I've overlooked.`,
    `Title: ${m.title || '(untitled)'}`,
    `Description: ${m.description || '(empty)'}`,
    list('Parts', m.nodes.map((n) => n.label)),
    links.length ? `Connections:\n${links.join('\n')}` : 'Connections: (none)',
    list('Feedback loops I noticed', m.feedbackLoops),
    list('Leverage points I noticed', m.leveragePoints),
    `My reflection: ${m.reflection || '(empty)'}`,
  ].join('\n\n');
}

function experimentUser(e: Experiment): string {
  const lens = {
    assumptions: 'challenging assumptions',
    'first-principles': 'first-principles reasoning',
    redesign: 'a constraint-dropping redesign',
  }[e.technique];
  const pairs = e.assumptionChallenges.map(
    (a) => `- Assumption: ${a.assumption || '(blank)'} → Challenge: ${a.challenge || '(blank)'}`,
  );
  return [
    `Coach me on this INNOVATION experiment. My primary lens is ${lens}. Push my thinking further — where am I still anchored to the status quo, and what bolder move am I avoiding?`,
    `Title: ${e.title || '(untitled)'}`,
    `Subject I'm reimagining: ${e.subject || '(empty)'}`,
    pairs.length ? `Assumption challenges:\n${pairs.join('\n')}` : 'Assumption challenges: (none)',
    list('Fundamental truths', e.fundamentals),
    `Reconstruction from fundamentals: ${e.reconstruction || '(empty)'}`,
    list('Constraints I might drop', e.constraintsToDrop),
    `Reimagined alternative: ${e.reimagined || '(empty)'}`,
    `My insight so far: ${e.insight || '(empty)'}`,
  ].join('\n\n');
}

export function buildCoachingMessages(target: CoachTarget): ChatMessage[] {
  const user =
    target.kind === 'problem'
      ? problemUser(target.data)
      : target.kind === 'decision'
        ? decisionUser(target.data)
        : target.kind === 'systemMap'
          ? systemMapUser(target.data)
          : experimentUser(target.data);
  return [
    { role: 'system', content: COACH_SYSTEM },
    { role: 'user', content: user },
  ];
}
