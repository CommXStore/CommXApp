import pino from 'pino'

const isTestEnv =
  process.env.NODE_ENV === 'test' ||
  process.env.VITEST === 'true' ||
  process.env.PLAYWRIGHT === 'true'

export const logger = pino({
  name: 'commx-app',
  level: isTestEnv ? 'fatal' : process.env.LOG_LEVEL ?? 'info',
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'req.headers.x-api-key'],
    remove: true,
  },
})
