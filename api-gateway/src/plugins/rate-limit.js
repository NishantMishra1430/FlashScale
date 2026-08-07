// src/plugins/rate-limit.js
import fastifyRateLimit from '@fastify/rate-limit';
import { env } from '../config/env.js';

export default async function rateLimitPlugin(fastify) {
  await fastify.register(fastifyRateLimit, {
    max: parseInt(env.RATE_LIMIT_MAX, 10), 
    timeWindow: env.RATE_LIMIT_TIME_WINDOW, 
    // TODO: For distributed rate limiting in production, uncomment and configure Redis:
    // redis: new Redis(process.env.REDIS_URL),
    errorResponseBuilder: (request, context) => {
      fastify.log.warn(`Rate limit triggered for IP: ${request.ip}`);
      return {
        statusCode: 429,
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${context.after}`,
        date: Date.now(),
      };
    },
  });
}
