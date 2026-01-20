# GitHub Copilot Instructions for AMS Backend

This document provides context and guidelines for GitHub Copilot when working on the AMS (Attendance Management System) Backend project.

## Project Overview

This is an Attendance Management System backend built with:
- **Runtime**: Bun
- **Framework**: Fastify (TypeScript)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Better-Auth
- **Architecture**: REST API with route-based organization

## Project Structure

```
ams-backend/
├── src/
│   ├── index.ts                    # Main application entry point
│   ├── lib/                        # Utility libraries
│   ├── middleware/
│   │   ├── auth.ts                 # Authentication middleware
│   │   └── roles.ts                # Role-based access control
│   ├── plugins/
│   │   ├── auth/
│   │   │   └── index.ts           # Better-auth configuration
│   │   └── db/
│   │       ├── index.ts           # Database connection
│   │       └── models/            # Mongoose models
│   │           ├── academics.model.ts
│   │           ├── attendence.model.ts
│   │           ├── auth.model.ts
│   │           ├── grade.models.ts
│   │           └── notifications.models.ts
│   └── routes/                     # API routes (auto-loaded)
│       ├── index.ts
│       ├── academics/
│       │   └── attendance/
│       │       └── session/
│       │           ├── index.ts   # Route definitions
│       │           ├── schema.ts  # Validation schemas
│       │           └── service.ts # Business logic
│       ├── dev/
│       ├── notifications/
│       └── user/
├── docs/                           # API documentation
└── package.json
```

## Key Conventions

### 1. Route Organization

Routes follow a three-file pattern:
- **index.ts**: Route registration with Fastify, middleware, and handlers
- **schema.ts**: Request/response validation schemas using Fastify schema format
- **service.ts**: Business logic and database operations

Example structure:
```typescript
// index.ts - Route registration
export default async function (fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);
  fastify.get("/", { schema: listSchema, preHandler: [isAnyStaff] }, listHandler);
  fastify.post("/", { schema: createSchema, preHandler: [isAnyStaff] }, createHandler);
}

// schema.ts - Validation
export const createSchema: RouteShorthandOptions["schema"] = {
  body: {
    type: "object",
    required: ["field1", "field2"],
    properties: { /* ... */ }
  }
};

// service.ts - Business logic
export const createHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  // Implementation
};
```

### 2. Authentication & Authorization

**Authentication Middleware**:
```typescript
import authMiddleware from "@/middleware/auth";

// Adds request.user and request.session to FastifyRequest
fastify.addHook("preHandler", authMiddleware);
```

**Role-based Access Control**:
```typescript
import { isAdmin, isTeacher, isStudent, isAnyStaff } from "@/middleware/roles";

// Available roles: admin, teacher, student, parent, principal, hod, staff
// Combined: isAnyStaff = teacher | hod | principal | staff | admin
```

### 3. Response Format

All API responses follow this structure:
```typescript
{
  status_code: number,
  message: string,
  data: any
}
```

**Success responses**:
- 200: Success
- 201: Created

**Error responses**:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Unprocessable Entity (validation/data issues)
- 500: Server Error

### 4. Database Models

**Key Models**:
- `User`: Base user authentication (email, password, role)
- `Student`: Student profile (references User)
- `Teacher`: Teacher profile (references User)
- `Parent`: Parent profile (references User and Student)
- `Batch`: Class/batch information
- `Subject`: Course/subject data
- `AttendanceSession`: Class session records
- `AttendanceRecord`: Individual student attendance
- `Notification`: System notifications

**Model relationships**:
- Use `mongoose.Schema.Types.ObjectId` for references
- Always populate related data in GET responses
- Select specific fields when populating to avoid over-fetching

### 5. Imports

Use TypeScript path aliases:
```typescript
import { User } from "@/plugins/db/models/auth.model";
import authMiddleware from "@/middleware/auth";
import { auth } from "@/plugins/auth";
```

### 6. Error Handling

Always wrap async operations in try-catch:
```typescript
export const handler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Operations
    return reply.send({ status_code: 200, message: "Success", data });
  } catch (error) {
    return reply.status(500).send({
      status_code: 500,
      message: "Operation failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
```

### 7. Pagination

For list endpoints, implement pagination:
```typescript
const { page = 1, limit = 10 } = request.query;
const skip = (page - 1) * limit;

const items = await Model.find(filter)
  .skip(skip)
  .limit(limit);

const total = await Model.countDocuments(filter);

return {
  status_code: 200,
  message: "Success",
  data: {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  },
};
```

### 8. Date Handling

- Store dates as JavaScript `Date` objects in MongoDB
- Accept ISO 8601 strings in API requests
- Convert string dates to Date objects before saving:
  ```typescript
  session_date: new Date(request.body.session_date)
  ```

### 9. Validation Schemas

Use Fastify's JSON Schema format:
```typescript
export const schema: RouteShorthandOptions["schema"] = {
  body: {
    type: "object",
    required: ["field1"],
    properties: {
      field1: { type: "string", minLength: 3 },
      field2: { type: "number", minimum: 0 },
      enum_field: { type: "string", enum: ["option1", "option2"] },
      date_field: { type: "string", format: "date" },
      datetime_field: { type: "string", format: "date-time" },
    },
  },
  querystring: {
    type: "object",
    properties: {
      page: { type: "number", minimum: 1, default: 1 },
      limit: { type: "number", minimum: 1, maximum: 100, default: 10 },
    },
  },
};
```

## Common Patterns

### Creating a New CRUD Endpoint

1. **Create route folder** under appropriate parent (e.g., `routes/grades/`)
2. **Create three files**: `index.ts`, `schema.ts`, `service.ts`
3. **Define schemas** for create, update, list operations
4. **Implement services** with proper error handling
5. **Register routes** with appropriate middleware
6. **Document** in `docs/` folder

### Accessing Authenticated User

```typescript
// Available on all authenticated routes
const userId = request.user.id;
const userRole = request.user.role; // admin, teacher, student, etc.
```

### Finding Related Data

```typescript
// Find user's role-specific profile
const teacher = await Teacher.findOne({ user: userId });
const student = await Student.findOne({ user: userId });

// Populate references
const session = await AttendanceSession.findById(id)
  .populate("batch", "name code year")
  .populate("subject", "name code")
  .populate({
    path: "created_by",
    populate: {
      path: "user",
      select: "name email first_name last_name",
    },
  });
```

### Authorization Checks

```typescript
// Check if user is creator or has admin privileges
if (
  resource.created_by.toString() !== teacher._id.toString() &&
  !["admin", "principal", "hod"].includes(request.user.role)
) {
  return reply.status(403).send({
    status_code: 403,
    message: "You are not authorized to perform this action",
    data: "",
  });
}
```

## Documentation

When creating new endpoints:
1. **Update or create** documentation in `docs/` folder
2. **Follow** existing documentation format (see `docs/attendance-session.md`)
3. **Include**:
   - Endpoint descriptions
   - Authentication requirements
   - Request/response examples
   - Error codes
   - Data models
   - Notes and best practices

## Testing Approach

When implementing features:
1. Validate input data using schemas
2. Check authentication and authorization
3. Verify related records exist (e.g., teacher profile)
4. Handle edge cases (not found, already exists, etc.)
5. Return consistent response formats
6. Log errors appropriately

## Do's and Don'ts

### Do:
✅ Use TypeScript types for all function parameters and returns  
✅ Validate all incoming data with schemas  
✅ Populate references in GET responses  
✅ Use role-based middleware for access control  
✅ Return consistent response formats  
✅ Handle errors gracefully with try-catch  
✅ Document all endpoints in `docs/`  
✅ Use path aliases (@/...) for imports  
✅ Follow existing project structure  

### Don't:
❌ Skip authentication checks  
❌ Return raw error stack traces to clients  
❌ Use `any` type extensively  
❌ Hardcode values that should be configurable  
❌ Skip input validation  
❌ Forget to populate references  
❌ Use different response formats across endpoints  
❌ Create routes without proper middleware  
❌ Modify files outside `src/` without good reason  

## Environment Variables

Check `.env` for configuration:
- `PORT`: Server port (default: 4000)
- `MONGODB_URI`: MongoDB connection string
- `CORS_ORIGIN`: Allowed CORS origin(s)
- Authentication keys for Better-Auth

## Auto-loading

Routes are automatically loaded by `@fastify/autoload`. The URL path matches the folder structure:
- `routes/user/index.ts` → `/user`
- `routes/attendance/session/index.ts` → `/attendance/session`
- `routes/notifications/index.ts` → `/notifications`

## Additional Notes

- This project uses **Bun** as the runtime, but npm commands work too
- **Nodemon** watches for file changes in development
- The server runs on port **4000** by default
- **Better-Auth** handles all authentication via `/api/auth/*` routes
- MongoDB models use **timestamps: true** (automatic `createdAt`/`updatedAt`)
- File naming: Use lowercase with hyphens for multi-word files (e.g., `attendance-session.md`)

---

**When in doubt**, follow the patterns established in existing routes like `/user`, `/notifications`, and `/attendance/session`.
