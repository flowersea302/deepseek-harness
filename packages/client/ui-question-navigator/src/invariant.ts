/** Package invariant companion for the transcript question navigator. */
import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@deepseek-ai/dsh-client-ui-question-navigator'

export const name = 'client-ui-question-navigator-invariant'
export const inject = ['invariants']

/** No runtime invariant: the plugin owns one disposable UI slot registration. */
const install: InvariantInstaller = () => {}

export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
