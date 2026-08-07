// src/routes/proxy.js
import httpProxy from '@fastify/http-proxy';
import { env } from '../config/env.js';

export default async function proxyRoutes(fastify) {
  // Dynamic routing matrix for FlashScale microservices
  const services = [
    {
      prefix: '/api/users',
      upstream: env.USER_SERVICE_URL,
      protect: false // Authentication delegated to User Service (login/registration)
    },
    {
      prefix: '/api/products',
      upstream: env.PRODUCT_SERVICE_URL,
      protect: false // Products must be publicly indexable/viewable
    },
    {
      prefix: '/api/inventory',
      upstream: env.INVENTORY_SERVICE_URL,
      protect: true // Internal tracking; requires JWT
    },
    {
      prefix: '/api/orders',
      upstream: env.ORDER_SERVICE_URL,
      protect: true // Placing/viewing orders requires JWT
    }
  ];

  for (const service of services) {
    fastify.register(httpProxy, {
      upstream: service.upstream,
      prefix: service.prefix,
      // If the route is protected, inject the JWT authentication middleware
      preHandler: service.protect ? [fastify.authenticate] : [],
      replyOptions: {
        onError: (reply, error) => {
          fastify.log.error(`Proxy failure [${service.prefix}]: ${error.message}`);
          reply.code(502).send({
            statusCode: 502,
            error: 'Bad Gateway',
            message: 'Downstream microservice is temporarily unavailable.'
          });
        }
      }
    });
  }
}
