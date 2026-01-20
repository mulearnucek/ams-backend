import { RouteShorthandOptions } from "fastify";

export const sessionCreateSchema: RouteShorthandOptions["schema"] = {
  body: {
    type: "object",
    required: ["batch", "subject", "start_time", "end_time", "hours_taken", "session_type"],
    properties: {
      batch: { type: "string" },
      subject: { type: "string" },
      start_time: { type: "string", format: "date-time" },
      end_time: { type: "string", format: "date-time" },
      hours_taken: { type: "number", minimum: 0 },
      session_type: { 
        type: "string", 
        enum: ["regular", "extra", "practical"] 
      },
    },
  },
};

export const sessionUpdateSchema: RouteShorthandOptions["schema"] = {
  body: {
    type: "object",
    required: [],
    properties: {
      batch: { type: "string" },
      subject: { type: "string" },
      start_time: { type: "string", format: "date-time" },
      end_time: { type: "string", format: "date-time" },
      hours_taken: { type: "number", minimum: 0 },
      session_type: { 
        type: "string", 
        enum: ["regular", "extra", "practical"] 
      },
    },
  },
};

export const sessionListSchema: RouteShorthandOptions["schema"] = {
  querystring: {
    type: "object",
    required: [],
    properties: {
      page: { type: "number", minimum: 1, default: 1 },
      limit: { type: "number", minimum: 1, maximum: 100, default: 10 },
      batch: { type: "string" },
      subject: { type: "string" },
      session_type: { 
        type: "string", 
        enum: ["regular", "extra", "practical"] 
      },
      from_date: { type: "string", format: "date" },
      to_date: { type: "string", format: "date" },
    },
  },
};
