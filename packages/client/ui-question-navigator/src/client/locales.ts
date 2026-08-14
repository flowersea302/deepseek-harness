export const zh = {
  label: '问题导航',
  item: '第 {index} 个问题：{question}',
} satisfies Record<string, string>

export type QuestionNavigatorKey = keyof typeof zh

export const en = {
  label: 'Question navigation',
  item: 'Question {index}: {question}',
} satisfies Record<QuestionNavigatorKey, string>
