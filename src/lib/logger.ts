import pino from 'pino'

export const logger = pino({
  name: 'commx-app',
  level: process.env.LOG_LEVEL ?? 'info',
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'req.headers.x-api-key'],
    remove: true,
  },
})
