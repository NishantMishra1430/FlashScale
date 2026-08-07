// src/plugins/jwt.js
import fastifyJwt from '@fastify/jwt';
import { env } from '../config/env.js';

export default async function jwtPlugin(fastify) {
  // Uses the JWT_SECRET from our validated environment variables
  await fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  });

  // Attach middleware hook to the fastify instance
  fastify.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
      // request.user is now populated with the validated JWT claims
    } catch (err) {
      reply.code(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid or missing JWT token'
      });
    }
  });
} 
