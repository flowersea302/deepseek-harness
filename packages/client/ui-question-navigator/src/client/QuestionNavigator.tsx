import { useEffect, useMemo, useRef, useState } from 'react'
import type { UserMessageNode } from '@deepseek-ai/dsh-client-runtime/client'
import type { PropsRuntime, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import css from './QuestionNavigator.module.css'
import type { QuestionNavigatorKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    questionNavigator: QuestionNavigatorKey
  }
}

export type QuestionNavigatorProps = PropsRuntime<'conversation.chat.navigator'> & PropsLocale<'questionNavigator'>

function questionText(content: readonly unknown[]): { label: string; full: string } {
  const full = content
    .filter((block): block is { type: 'text'; text: string } => typeof block === 'object' && block !== null
      && (block as { type?: unknown }).type === 'text' && typeof (block as { text?: unknown }).text === 'string')
    .map(block => block.text)
    .join('')
    .trim()
  if (full === '') return { label: '…', full: '…' }
  return { label: full.split(/\r?\n/, 1)[0]?.trim() || '…', full }
}

/** Low-contrast rail that maps ordinary user questions to transcript anchors. */
export function QuestionNavigator({
  useSession, activeQuestionKey, hasMoreQuestions, loadingMoreQuestions, loadMoreQuestions, jumpToQuestion, t,
}: QuestionNavigatorProps) {
  const [hoveredQuestion, setHoveredQuestion] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const order = useSession(snapshot => snapshot.chat.order)
  const nodes = useSession(snapshot => snapshot.chat.nodes)
  const questions = useMemo(() => order.flatMap((nodeKey) => {
    const node = nodes.get(nodeKey)
    if (node?.kind !== 'user') return []
    return [{ nodeKey, ...questionText((node.data as UserMessageNode).content) }]
  }), [nodes, order])

  useEffect(() => {
    if (hasMoreQuestions && !loadingMoreQuestions) loadMoreQuestions()
  }, [hasMoreQuestions, loadMoreQuestions, loadingMoreQuestions])

  useEffect(() => {
    if (activeQuestionKey === null) return
    const list = listRef.current
    const active = list?.querySelector<HTMLElement>('[aria-current="location"]')
    if (active === undefined || active === null || typeof active.scrollIntoView !== 'function') return
    active.scrollIntoView({ block: 'center' })
  }, [activeQuestionKey, questions.length])

  if (questions.length === 0 && !hasMoreQuestions) return null
  return (
    <nav
      className={css.rail}
      aria-label={t('label')}
      onMouseEnter={() => {
        if (hasMoreQuestions && !loadingMoreQuestions) loadMoreQuestions()
      }}
    >
      <div ref={listRef} className={css.list}>
        {questions.map((question, index) => (
          <button
            key={question.nodeKey}
            type="button"
            className={`${css.mark} ${question.nodeKey === activeQuestionKey ? css.active : ''}`}
            aria-current={question.nodeKey === activeQuestionKey ? 'location' : undefined}
            aria-label={t('item', { index: index + 1, question: question.label })}
            data-question-summary={question.label}
            onMouseEnter={() => { setHoveredQuestion(question.full) }}
            onMouseLeave={() => { setHoveredQuestion(null) }}
            onFocus={() => { setHoveredQuestion(question.full) }}
            onBlur={() => { setHoveredQuestion(null) }}
            onClick={() => { jumpToQuestion(question.nodeKey) }}
          >
            <span className={css.title}>{question.label}</span>
          </button>
        ))}
      </div>
      {hoveredQuestion !== null && <div className={css.fullQuestion}>{hoveredQuestion}</div>}
    </nav>
  )
}
