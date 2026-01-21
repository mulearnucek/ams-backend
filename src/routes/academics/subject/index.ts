import { FastifyInstance } from "fastify";
import authMiddleware from "@/middleware/auth";
import { isAdmin, isAnyStaff } from "@/middleware/roles";
import { 
  listSubjectsHandler, 
  getSubjectByIdHandler, 
  createSubjectHandler, 
  updateSubjectHandler, 
  deleteSubjectHandler 
} from "./service";
import { 
  listSubjectsSchema, 
  getSubjectByIdSchema, 
  createSubjectSchema, 
  updateSubjectSchema, 
  deleteSubjectSchema 
} from "./schema";

export default async function (fastify: FastifyInstance) {
  // Apply authentication to all routes
  fastify.addHook("preHandler", authMiddleware);

  // List all subjects - accessible by any staff
  fastify.get("/", { schema: listSubjectsSchema, preHandler: [isAnyStaff] }, listSubjectsHandler);

  // Get single subject - accessible by any staff
  fastify.get("/:id", { schema: getSubjectByIdSchema, preHandler: [isAnyStaff] }, getSubjectByIdHandler);

  // Create subject - admin only
  fastify.post("/", { schema: createSubjectSchema, preHandler: [isAdmin] }, createSubjectHandler);

  // Update subject - admin only
  fastify.put("/:id", { schema: updateSubjectSchema, preHandler: [isAdmin] }, updateSubjectHandler);

  // Delete subject - admin only
  fastify.delete("/:id", { schema: deleteSubjectSchema, preHandler: [isAdmin] }, deleteSubjectHandler);
}
