import auth from "../../middleware/auth"
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

export default async function (fastify : FastifyInstance) {
  fastify.addHook("preHandler", auth);

  fastify.get("/user", async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user;

    return reply.send({
      id: user.id,
      email: user.email,    
    });
  });


}