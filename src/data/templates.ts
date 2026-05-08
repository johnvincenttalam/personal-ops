import { format } from 'date-fns'
import type { LucideIcon } from 'lucide-react'
import {
  FileText,
  Brain,
  Users,
  Sparkles,
  Code,
  PenTool,
  ListChecks,
  Target,
  Rocket,
} from 'lucide-react'

export interface NoteTemplate {
  id: string
  label: string
  description: string
  icon: LucideIcon
  build: () => { title: string; content: string }
}

export interface PromptTemplate {
  id: string
  label: string
  description: string
  icon: LucideIcon
  build: () => { title: string; content: string }
}

export interface ChecklistTemplate {
  id: string
  label: string
  description: string
  icon: LucideIcon
  build: () => { content: string; items: string[] }
}

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'daily-log',
    label: 'Daily Log',
    description: 'Track wins, blockers, and learnings.',
    icon: FileText,
    build: () => ({
      title: `Daily Log — ${format(new Date(), 'MMM d, yyyy')}`,
      content: `## What I worked on\n- \n\n## What I learned\n- \n\n## Blockers\n- \n\n## Tomorrow\n- `,
    }),
  },
  {
    id: 'brain-dump',
    label: 'Quick Brain Dump',
    description: 'Get thoughts out of your head, fast.',
    icon: Brain,
    build: () => ({
      title: 'Brain Dump',
      content: `Just write...\n\n`,
    }),
  },
  {
    id: 'meeting',
    label: 'Meeting Notes',
    description: 'Structured notes for any meeting.',
    icon: Users,
    build: () => ({
      title: `Meeting — ${format(new Date(), 'MMM d, yyyy')}`,
      content: `## Attendees\n- \n\n## Agenda\n- \n\n## Discussion\n\n## Action Items\n- [ ] `,
    }),
  },
]

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'system-prompt',
    label: 'System Prompt',
    description: 'Define an AI assistant role and behavior.',
    icon: Sparkles,
    build: () => ({
      title: 'System Prompt',
      content: `You are an expert at [TASK].\n\nYour role:\n- \n\nResponse format:\n- \n\nConstraints:\n- `,
    }),
  },
  {
    id: 'code-review',
    label: 'Code Review',
    description: 'Critique code for quality and bugs.',
    icon: Code,
    build: () => ({
      title: 'Code Review',
      content: `Review the following code for:\n- Correctness\n- Edge cases\n- Performance & readability\n- Security concerns\n\nReturn a prioritized list with file:line references.\n\n[CODE]`,
    }),
  },
  {
    id: 'writing-assistant',
    label: 'Writing Assistant',
    description: 'Edit, expand, or rewrite copy.',
    icon: PenTool,
    build: () => ({
      title: 'Writing Assistant',
      content: `Improve this text by:\n- Tightening sentences\n- Removing fluff\n- Keeping the original voice and tone\n\nReturn the rewrite only, no commentary.\n\n[TEXT]`,
    }),
  },
]

export const CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'today',
    label: "Today's Tasks",
    description: 'Plan your day in two minutes.',
    icon: ListChecks,
    build: () => ({
      content: `Today — ${format(new Date(), 'MMM d')}`,
      items: ['Top priority', 'Quick win', 'Email / admin'],
    }),
  },
  {
    id: 'weekly',
    label: 'Weekly Goals',
    description: 'Set 3 outcomes for the week.',
    icon: Target,
    build: () => ({
      content: 'This week',
      items: ['Outcome 1', 'Outcome 2', 'Outcome 3'],
    }),
  },
  {
    id: 'project-setup',
    label: 'Project Setup',
    description: 'Kick off a new project from zero.',
    icon: Rocket,
    build: () => ({
      content: 'Project Setup',
      items: [
        'Define scope',
        'List stakeholders',
        'Set milestones',
        'Create repo',
        'First commit',
      ],
    }),
  },
]
