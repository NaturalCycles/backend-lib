import fastifyLib from 'fastify'
import * as http from 'http'

export async function createServerFastify(): Promise<http.Server> {
  const fastify = fastifyLib()

  // This doesn't make it faster
  // fastify.route({
  //   method: 'GET',
  //   url: '/',
  //   schema: {
  //     response: {
  //       200: {
  //         type: 'object',
  //         properties: {
  //           hello: {
  //             type: 'string',
  //           }
  //         }
  //       }
  //     }
  //   },
  //   handler: async () => {
  //     return { hello: 'world' }
  //   }
  // })

  // fastify.get('/', (_req, res) => {
  //   res.send({ hello: 'world' })
  // })

  fastify.get('/', async () => {
    return { hello: 'world' }
  })

  await fastify.ready()
  return fastify.server
}
