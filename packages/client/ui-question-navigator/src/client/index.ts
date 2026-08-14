import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { QuestionNavigator } from './QuestionNavigator.tsx'
import { en, zh } from './locales.ts'

const NS = 'questionNavigator'

export const inject = ['slots', 'locale']

/** Register the optional transcript rail after ChatView declares its slot. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-question-navigator: dictionaries')
  ctx.slots.inject('conversation.chat.navigator', () => ctx.slots.register({
    name: 'conversation.chat.navigator',
    locale: NS,
  }, QuestionNavigator))
}
