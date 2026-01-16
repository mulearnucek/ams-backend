# User API Documentation

Base URL: `/user`

## Table of Contents
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Get User Profile](#get-user-profile)
  - [Create User](#create-user)
  - [Update User](#update-user)
  - [Admin: List Users](#admin-list-users)
  - [Admin: Get User by ID](#admin-get-user-by-id)
  - [Admin: Update User by ID](#admin-update-user-by-id)
  - [Admin: Delete User](#admin-delete-user)

---

## Authentication

Most endpoints require authentication via better-auth session cookies. Admin endpoints require the `admin` role.

**Middleware Used:**
- `authMiddleware` - Verifies user session
- `isAdmin` - Validates admin role (admin routes only)

---

## Endpoints

### Get User Profile

Retrieve the authenticated user's profile or a specific user's profile by ID.

**Endpoint:** `GET /user` or `GET /user/:id`

**Authentication:** Required

**Parameters:**
- `id` (optional, path parameter) - User ID to fetch. If omitted, returns the authenticated user's profile.

**Response Codes:**
- `200` - Success
- `404` - User not found
- `422` - User data not added (role-specific data missing)
- `401` - Unauthorized

**Response Examples:**

Student Profile:
```json
{
  "status_code": 200,
  "message": "User profile fetched successfully",
  "data": {
    "_id": "student_id",
    "user": {
      "name": "John Doe",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "student",
      "phone": 1234567890,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    },
    "gender": "male",
    "adm_number": "ADM2024001",
    "adm_year": 2024,
    "candidate_code": "CAND001",
    "department": "CSE",
    "date_of_birth": "2005-01-15T00:00:00.000Z"
  }
}
```

Teacher Profile:
```json
{
  "status_code": 200,
  "message": "User profile fetched successfully",
  "data": {
    "_id": "teacher_id",
    "user": {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "first_name": "Jane",
      "last_name": "Smith",
      "role": "teacher",
      "phone": 9876543210
    },
    "designation": "Assistant Professor",
    "department": "CSE",
    "date_of_joining": "2020-06-01T00:00:00.000Z"
  }
}
```

Parent Profile:
```json
{
  "status_code": 200,
  "message": "User profile fetched successfully",
  "data": {
    "_id": "parent_id",
    "user": {
      "name": "Robert Brown",
      "email": "robert@example.com",
      "role": "parent"
    },
    "child": {
      "adm_number": "ADM2024001",
      "adm_year": 2024,
      "user": {
        "name": "Child Name",
        "email": "child@example.com"
      }
    },
    "relation": "father"
  }
}
```

---

### Create User

Create a new user account with role-specific data.

**Endpoint:** `POST /user`

**Authentication:**  Required

**Request Body:**

**Common Fields (Required):**
```json
{
  "name": "string (min 3 chars)",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "gender": "male | female | other",
  "phone": "number"
}
```

**Optional Fields:**
- `image` - Profile image URL
- `role` - User role (defaults to "student")

**Role-Specific Required Objects:**

**For Students (`role: "student"`):**
```json
{
  "student": {
    "adm_number": "string",
    "adm_year": "number",
    "candidate_code": "string (optional)",
    "department": "CSE | ECE | IT",
    "date_of_birth": "YYYY-MM-DD"
  }
}
```

**For Teachers/Staff (`role: "teacher" | "principal" | "hod" | "staff" | "admin"`):**
```json
{
  "teacher": {
    "designation": "string",
    "department": "string",
    "date_of_joining": "YYYY-MM-DD"
  }
}
```

**For Parents (`role: "parent"`):**
```json
{
  "parent": {
    "relation": "mother | father | guardian",
    "childID": "string (student ID)"
  }
}
```

**Response:**
```json
{
  "status_code": 201,
  "message": "Student User created successfully",
  "data": ""
}
```

**Response Codes:**
- `201` - User created successfully
- `500` - Server error

---

### Update User

Update the authenticated user's profile.

**Endpoint:** `PUT /user`

**Authentication:** Required

**Request Body:**

All fields are optional. Only include fields you want to update.

```json
{
  "name": "string",
  "password": "string",
  "image": "string",
  "role": "string",
  "phone": "number",
  "first_name": "string",
  "last_name": "string",
  "gender": "male | female | other",
  "student": {
    "adm_number": "string",
    "adm_year": "number",
    "candidate_code": "string",
    "department": "CSE | ECE | IT",
    "date_of_birth": "YYYY-MM-DD"
  },
  "teacher": {
    "designation": "string",
    "department": "string",
    "date_of_joining": "YYYY-MM-DD"
  },
  "parent": {
    "relation": "mother | father | guardian",
    "childID": "string"
  }
}
```

**Example:**
```bash
curl -X PUT http://localhost:4000/user \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "name": "John Updated",
    "student": {
      "department": "ECE"
    }
  }'
```

**Response:**
```json
{
  "status_code": 200,
  "message": "User Record Updated Successfully",
  "data": ""
}
```

**Response Codes:**
- `200` - Updated successfully
- `404` - Record not found or nothing to update
- `401` - Unauthorized

---

### Admin: List Users

List all users of a specific role with pagination, search, and filtering capabilities (admin only).

**Endpoint:** `GET /user/list`

**Authentication:** Required (Admin role)

**Query Parameters:**
- `role` (required) - User role to filter by: `student`, `teacher`, `parent`, `principal`, `hod`, `staff`, or `admin`
- `page` (optional) - Page number for pagination (default: 1, minimum: 1)
- `limit` (optional) - Number of results per page (default: 10, minimum: 1, maximum: 100)
- `search` (optional) - Search query to filter by name, email, first_name, or last_name (case-insensitive)

**Example Requests:**
```bash
# List all students (first page, 10 per page)
GET /user/list?role=student

# List teachers with pagination
GET /user/list?role=teacher&page=2&limit=20

# Search for parents
GET /user/list?role=parent&search=john

# List admins with custom limit
GET /user/list?role=admin&limit=50
```

**Response Format:**

**For Students:**
```json
{
  "status_code": 200,
  "message": "Students fetched successfully",
  "data": {
    "users": [
      {
        "_id": "student_record_id",
        "user": {
          "_id": "user_id",
          "name": "John Doe",
          "email": "john@example.com",
          "emailVerified": true,
          "image": "profile.jpg",
          "first_name": "John",
          "last_name": "Doe",
          "role": "student",
          "gender": "male",
          "phone": 1234567890,
          "createdAt": "2025-01-01T00:00:00.000Z",
          "updatedAt": "2025-01-01T00:00:00.000Z"
        },
        "adm_number": "ADM2024001",
        "adm_year": 2024,
        "candidate_code": "CAND001",
        "department": "CSE",
        "date_of_birth": "2005-01-15T00:00:00.000Z",
        "batch": {
          "_id": "batch_id",
          "name": "Batch 2024",
          "year": 2024
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 50,
      "limit": 10,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

**For Teachers/Staff/Admin:**
```json
{
  "status_code": 200,
  "message": "Teachers fetched successfully",
  "data": {
    "users": [
      {
        "_id": "teacher_record_id",
        "user": {
          "_id": "user_id",
          "name": "Jane Smith",
          "email": "jane@example.com",
          "role": "teacher",
          "phone": 9876543210
        },
        "designation": "Assistant Professor",
        "department": "CSE",
        "date_of_joining": "2020-06-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalUsers": 25,
      "limit": 10,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

**For Parents:**
```json
{
  "status_code": 200,
  "message": "Parents fetched successfully",
  "data": {
    "users": [
      {
        "_id": "parent_record_id",
        "user": {
          "_id": "user_id",
          "name": "Robert Brown",
          "email": "robert@example.com",
          "role": "parent"
        },
        "relation": "father",
        "child": {
          "_id": "student_id",
          "adm_number": "ADM2024001",
          "candidate_code": "CAND001",
          "user": {
            "name": "Child Name",
            "first_name": "Child",
            "last_name": "Name"
          }
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalUsers": 15,
      "limit": 10,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

**Response Codes:**
- `200` - Success
- `400` - Invalid role specified
- `403` - Forbidden (not admin)
- `401` - Unauthorized
- `500` - Server error

**Features:**
1. **Role-Based Queries**: Fetches data from role-specific models (Student, Teacher, Parent) and populates user details
2. **Efficient Pagination**: Returns only the requested page of results with metadata
3. **Search**: Case-insensitive search across name, email, first_name, and last_name fields
4. **No Mixing**: Users with different roles are never intermixed - each request returns only one role type
5. **Complete Details**: Includes all role-specific data (admission info, designation, child details, etc.)

---

### Admin: Get User by ID

Retrieve a specific user's profile by ID (admin only).

**Endpoint:** `GET /user/:id`

**Authentication:** Required (Admin role)

**Parameters:**
- `id` (path parameter) - User ID to fetch

**Response:** Same format as [Get User Profile](#get-user-profile)

**Response Codes:**
- `200` - Success
- `403` - Forbidden (not admin)
- `404` - User not found
- `422` - User data not added (role-specific data missing)
- `401` - Unauthorized

---

### Admin: Update User by ID

Update any user's profile (admin only).

**Endpoint:** `PUT /user/:id`

**Authentication:** Required (Admin role)

**Parameters:**
- `id` (path parameter) - User ID to update

**Request Body:** Same as [Update User](#update-user)

**Example:**
```bash
curl -X PUT http://localhost:4000/user/user123 \
  -H "Content-Type: application/json" \
  -H "Cookie: admin-session-cookie" \
  -d '{
    "role": "teacher",
    "teacher": {
      "designation": "Professor"
    }
  }'
```

**Response:**
```json
{
  "status_code": 200,
  "message": "User Record Updated Successfully",
  "data": ""
}
```

**Response Codes:**
- `200` - Updated successfully
- `403` - Forbidden (not admin)
- `404` - User not found
- `401` - Unauthorized

---

### Admin: Delete User

Delete a user and all associated data (admin only).

**Endpoint:** `DELETE /user/:id`

**Authentication:** Required (Admin role)

**Parameters:**
- `id` (path parameter) - User ID to delete

**Behavior:**
- Removes user from better-auth
- Deletes user record from database
- Cascades deletion to role-specific data:
  - Student: Deletes student record and associated parent records
  - Teacher/Staff: Deletes teacher record
  - Parent: Deletes parent record

**Response:**
```json
{
  "status_code": 204,
  "message": "Successfully Deleted The User",
  "data": ""
}
```

**Response Codes:**
- `204` - Deleted successfully
- `403` - Forbidden (not admin)
- `404` - User not found or can't delete
- `401` - Unauthorized

---

## Data Models

### User Roles
- `student` - Student users
- `teacher` - Teaching staff
- `parent` - Parent/Guardian
- `principal` - School principal
- `hod` - Head of Department
- `staff` - Administrative staff
- `admin` - System administrator

### Departments
- `CSE` - Computer Science & Engineering
- `ECE` - Electronics & Communication Engineering
- `IT` - Information Technology

### Gender Options
- `male`
- `female`
- `other`

### Parent Relations
- `mother`
- `father`
- `guardian`

---

## Error Responses

**401 Unauthorized:**
```json
{
  "status": 401,
  "message": "Unauthorized - Invalid or expired session"
}
```

**403 Forbidden:**
```json
{
  "error": "This route requires one of the following roles: admin"
}
```

**404 Not Found:**
```json
{
  "status_code": 404,
  "message": "User not found",
  "data": ""
}
```

**422 Unprocessable Entity:**
```json
{
  "status_code": 422,
  "message": "Student data need to be added.",
  "data": ""
}
```

**500 Server Error:**
```json
{
  "status_code": 500,
  "message": "Error message",
  "error": "Error details"
}
```

---

## Notes

1. **Session Management**: Authentication is handled via better-auth session cookies. Include cookies in requests after login.

2. **Role-Based Data**: When creating or updating users, ensure the appropriate role-specific object (`student`, `teacher`, or `parent`) is included based on the user's role.

3. **Cascading Deletes**: Deleting a student will also remove any parent records associated with that student.

4. **Profile Completion**: After signup, users must have their role-specific data populated. The GET endpoint returns a 422 status if this data is missing.

5. **Admin Privileges**: Admin routes (`GET /user/list`, `GET /user/:id`, `PUT /user/:id`, and `DELETE /user/:id`) require admin role authentication.

6. **Default Role**: New users are automatically assigned the "student" role unless specified otherwise.

7. **List Users Endpoint**: The `/user/list` endpoint requires a `role` parameter to prevent mixing different user types. This ensures data consistency and efficient queries.

8. **Pagination Best Practices**: Use appropriate `limit` values (default: 10, max: 100) to balance performance and usability. Large result sets should be paginated.

9. **Search Performance**: The search functionality queries across multiple fields (name, email, first_name, last_name) and filters by role, ensuring accurate results without mixing user types.
