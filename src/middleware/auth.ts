import { FastifyRequest, FastifyReply } from "fastify";
import { auth } from "../plugins/auth/index.js";

declare module "fastify" {
	interface FastifyRequest {
		user?: any;
		session?: any;
	}
}

export default async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session || !session.session || !session.user) {
			return reply.status(401).send({
				status: 401,
				message: "Unauthorized - Invalid or expired session",
			});
		}

		// Attach user and session to request for use in route handlers
		request.user = session.user;
		request.session = session.session;
	} catch (error) {
		return reply.status(401).send({
			status: 401,
			message: "Unauthorized - Authentication failed",
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
}
