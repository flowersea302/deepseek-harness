// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { bindSnapshotSelector } from '@deepseek-ai/dsh-client-web-react'
import { EMPTY_CONVERSATION_VIEWS, createSnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import type { ConversationSnapshot, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import { makeTranslate } from '@deepseek-ai/dsh-client-test-runtime'
import { zh as commonZh } from '@deepseek-ai/dsh-client-locale/src/locales/zh.ts'
import { QuestionNavigator } from '../src/client/QuestionNavigator.tsx'
import { zh } from '../src/client/locales.ts'

const SID = 's1' as SessionId
const t = makeTranslate(zh, commonZh)

afterEach(cleanup)

function snapshot(questionCount = 2): ConversationSnapshot {
  const user = (key: string, text: string, seq: number) => ({
    key, id: key, kind: 'user' as const, target: 'chat' as const, anchorSeq: seq,
    location: { kind: 'unresolved' as const }, visibility: 'visible' as const,
    data: { kind: 'user' as const, seq, time: seq, content: [{ type: 'text' as const, text }], source: { kind: 'user' as const } },
  })
  const nodes = new Map(Array.from({ length: questionCount }, (_, index) => {
    const seq = index + 1
    const text = seq === 1 ? 'First question\nignored detail' : `Question ${seq}`
    return [`u${seq}`, user(`u${seq}`, text, seq)]
  }))
  return {
    sessionId: SID, views: EMPTY_CONVERSATION_VIEWS,
    chat: { order: Array.from(nodes.keys()), nodes, timeline: { turns: new Map() } },
    nodes: [], turnTimings: new Map(), turnEnds: new Map(), partial: null, runningCalls: [], pending: [], queue: [],
    running: false, composerPhase: 'active', removed: false, openState: 'open', openError: null, hasMore: false,
    loadingOlder: false, promptError: null, blank: false, subagent: null, lastAgentError: null,
  } as unknown as ConversationSnapshot
}

describe('QuestionNavigator', () => {
  it('renders every marker in a hover-scrollable rail with a first-line summary and jump callback', () => {
    const jumpToQuestion = vi.fn()
    const source = createSnapshotStore(snapshot(12))
    const view = render(
      <QuestionNavigator
        sessionId={SID}
        useSession={bindSnapshotSelector(source)}
        useSessions={(() => { throw new Error('unused') })}
        useWorkspaces={(() => { throw new Error('unused') })}
        useProjection={(() => undefined)}
        useInput={(() => { throw new Error('unused') })}
        inputActions={{ setDraft: () => {}, addImages: () => true, removeImage: () => {}, pruneImages: () => {}, submit: () => {} }}
        activeQuestionKey="u10"
        hasMoreQuestions={false}
        loadingMoreQuestions={false}
        loadMoreQuestions={vi.fn()}
        jumpToQuestion={jumpToQuestion}
        t={t}
      />,
    )
    const markers = view.getAllByRole('button')
    expect(markers).toHaveLength(12)
    expect(markers[0]?.getAttribute('data-question-summary')).toBe('First question')
    expect(markers[9]?.getAttribute('data-question-summary')).toBe('Question 10')
    expect(markers[9]?.getAttribute('aria-current')).toBe('location')
    expect(view.getByText('Question 10')).toBeTruthy()
    fireEvent.mouseEnter(markers[0]!)
    expect(view.getAllByText('First question', { exact: false }).length).toBeGreaterThan(1)
    fireEvent.mouseLeave(markers[0]!)
    expect(view.queryByText('ignored detail', { exact: false })).toBeNull()
    fireEvent.click(markers[11]!)
    expect(jumpToQuestion).toHaveBeenCalledWith('u12')
  })

  it('requests every older history page on mount until history is exhausted', async () => {
    const loadMoreQuestions = vi.fn()
    const source = createSnapshotStore(snapshot(2))
    const view = render(
      <QuestionNavigator
        sessionId={SID}
        useSession={bindSnapshotSelector(source)}
        useSessions={(() => { throw new Error('unused') })}
        useWorkspaces={(() => { throw new Error('unused') })}
        useProjection={(() => undefined)}
        useInput={(() => { throw new Error('unused') })}
        inputActions={{ setDraft: () => {}, addImages: () => true, removeImage: () => {}, pruneImages: () => {}, submit: () => {} }}
        activeQuestionKey="u1"
        hasMoreQuestions
        loadingMoreQuestions={false}
        loadMoreQuestions={loadMoreQuestions}
        jumpToQuestion={vi.fn()}
        t={t}
      />,
    )
    await waitFor(() => { expect(loadMoreQuestions).toHaveBeenCalledTimes(1) })
    fireEvent.mouseEnter(view.getByRole('navigation'))
    expect(loadMoreQuestions).toHaveBeenCalledTimes(2)
  })
})
