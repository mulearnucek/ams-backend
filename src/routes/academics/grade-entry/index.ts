import { FastifyInstance } from "fastify";
import authMiddleware from "@/middleware/auth";
import { isAdmin, isAnyStaff } from "@/middleware/roles";
import { 
  listGradeEntriesHandler, 
  getGradeEntryByIdHandler, 
  createGradeEntryHandler, 
  bulkCreateGradeEntriesHandler,
  updateGradeEntryHandler, 
  deleteGradeEntryHandler 
} from "./service";
import { 
  listGradeEntriesSchema, 
  getGradeEntryByIdSchema, 
  createGradeEntrySchema,
  bulkCreateGradeEntriesSchema,
  updateGradeEntrySchema, 
  deleteGradeEntrySchema 
} from "./schema";

export default async function (fastify: FastifyInstance) {
  // Apply authentication to all routes
  fastify.addHook("preHandler", authMiddleware);

  // List all grade entries - accessible by any staff
  fastify.get("/", { schema: listGradeEntriesSchema, preHandler: [isAnyStaff] }, listGradeEntriesHandler);

  // Get single grade entry - accessible by any staff
  fastify.get("/:id", { schema: getGradeEntryByIdSchema, preHandler: [isAnyStaff] }, getGradeEntryByIdHandler);

  // Create grade entry - any staff can create
  fastify.post("/", { schema: createGradeEntrySchema, preHandler: [isAnyStaff] }, createGradeEntryHandler);

  // Bulk create grade entries - any staff can create
  fastify.post("/bulk", { schema: bulkCreateGradeEntriesSchema, preHandler: [isAnyStaff] }, bulkCreateGradeEntriesHandler);

  // Update grade entry - any staff can update
  fastify.put("/:id", { schema: updateGradeEntrySchema, preHandler: [isAnyStaff] }, updateGradeEntryHandler);

  // Delete grade entry - admin only
  fastify.delete("/:id", { schema: deleteGradeEntrySchema, preHandler: [isAdmin] }, deleteGradeEntryHandler);
}
