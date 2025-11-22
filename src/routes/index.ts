'use strict'

import { FastifyInstance } from "fastify"

module.exports = async function (fastify: FastifyInstance) {
  fastify.get('/', async function (request, reply) {
    return { message: "Hi User! What brings you here? (◔◡◔) - GQA API Server", v: '1.0.0', status: 200 }
  })

  fastify.get('/health', async function (request, reply) {
    return { message: "I'm alive!" , status: 200}
  })

  fastify.setNotFoundHandler(function (req, reply) {
    reply.code(404).send({ message: 'You are looking at the wrong path! ￣へ￣', status: 404 })
  }) 

  
}
