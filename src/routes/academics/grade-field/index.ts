import { FastifyInstance } from "fastify";
import authMiddleware from "@/middleware/auth";
import { isAdmin, isAnyStaff } from "@/middleware/roles";
import { 
  listGradeFieldsHandler, 
  getGradeFieldByIdHandler, 
  createGradeFieldHandler, 
  updateGradeFieldHandler, 
  deleteGradeFieldHandler 
} from "./service";
import { 
  listGradeFieldsSchema, 
  getGradeFieldByIdSchema, 
  createGradeFieldSchema, 
  updateGradeFieldSchema, 
  deleteGradeFieldSchema 
} from "./schema";

export default async function (fastify: FastifyInstance) {
  // Apply authentication to all routes
  fastify.addHook("preHandler", authMiddleware);

  // List all grade fields - accessible by any staff
  fastify.get("/", { schema: listGradeFieldsSchema, preHandler: [isAnyStaff] }, listGradeFieldsHandler);

  // Get single grade field - accessible by any staff
  fastify.get("/:id", { schema: getGradeFieldByIdSchema, preHandler: [isAnyStaff] }, getGradeFieldByIdHandler);

  // Create grade field - any staff can create
  fastify.post("/", { schema: createGradeFieldSchema, preHandler: [isAnyStaff] }, createGradeFieldHandler);

  // Update grade field - any staff can update
  fastify.put("/:id", { schema: updateGradeFieldSchema, preHandler: [isAnyStaff] }, updateGradeFieldHandler);

  // Delete grade field - admin only
  fastify.delete("/:id", { schema: deleteGradeFieldSchema, preHandler: [isAdmin] }, deleteGradeFieldHandler);
}
