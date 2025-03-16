import * as sentry from '@sentry/node'
import { test } from 'vitest'
import { SentrySharedService } from './sentry.shared.service'

test('import sentry', async () => {
  const _sentryService = new SentrySharedService({ sentry })
})
