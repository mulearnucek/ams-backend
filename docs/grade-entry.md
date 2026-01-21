# Grade Entry API Documentation

## Overview
The Grade Entry API manages individual student grade records for specific grade fields. It tracks marks, absence status, and remarks for each student's performance in various assessments.

All endpoints require authentication. List and retrieve operations are accessible to any staff member. Create and update operations are also accessible to any staff, while delete operations require admin privileges.

## Base URL
```
/grade-entry
```

## Authentication
All endpoints require a valid authentication token.

## Endpoints

### 1. List Grade Entries
Retrieve a paginated list of all grade entries with optional filtering.

**Endpoint:** `GET /academics/grade-entry`

**Access:** Any staff (teacher, hod, principal, staff, admin)

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number for pagination |
| limit | number | No | 10 | Number of items per page (max: 100) |
| user | string | No | - | Filter by user ObjectId |
| grade_field | string | No | - | Filter by grade field ObjectId |
| is_absent | boolean | No | - | Filter by absence status |

**Response Example:**
```json
{
  "status_code": 200,
  "message": "Grade entries retrieved successfully",
  "data": {
    "gradeEntries": [
      {
        "_id": "64entry001",
        "user": {
          "_id": "64user001",
          "first_name": "John",
          "last_name": "Doe",
          "email": "john.doe@example.com",
          "role": "student"
        },
        "grade_field": {
          "_id": "64field001",
          "name": "Mid-Semester Exam",
          "type": "exam",
          "total_mark": 50,
          "weightage": 30,
          "batch": {
            "name": "CSE 2024 Batch A",
            "adm_year": 2024
          },
          "subject": {
            "_id": "CS101",
            "subject_code": "CS101"
          }
        },
        "mark": 42,
        "is_absent": false,
        "remarks": "Good performance",
        "updated_at": "2026-01-21T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPages": 15
    }
  }
}
```

---

### 2. Get Grade Entry by ID
Retrieve details of a specific grade entry.

**Endpoint:** `GET /academics/grade-entry/:id`

**Access:** Any staff

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Grade Entry ObjectId |

**Response Example:**
```json
{
  "status_code": 200,
  "message": "Grade entry retrieved successfully",
  "data": {
    "_id": "64entry001",
    "user": {
      "_id": "64user001",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "role": "student"
    },
    "grade_field": {
      "_id": "64field001",
      "name": "Mid-Semester Exam",
      "type": "exam",
      "total_mark": 50,
      "batch": { ... },
      "subject": { ... }
    },
    "mark": 42,
    "is_absent": false,
    "remarks": "Good performance",
    "updated_at": "2026-01-21T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `404`: Grade entry not found

---

### 3. Create Grade Entry
Create a new grade entry for a student.

**Endpoint:** `POST /academics/grade-entry`

**Access:** Any staff

**Request Body:**
```json
{
  "user": "64user001",
  "grade_field": "64field001",
  "mark": 42,
  "is_absent": false,
  "remarks": "Good performance"
}
```

**Body Parameters:**
| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| _id | string | No | - | Custom ID (optional) |
| user | string | Yes | Valid User ObjectId | Student reference |
| grade_field | string | Yes | Valid GradeField ObjectId | Grade field reference |
| mark | number | Yes | Minimum: 0 | Marks obtained |
| is_absent | boolean | Yes | - | Absence status |
| remarks | string | No | - | Additional comments |

**Response Example:**
```json
{
  "status_code": 201,
  "message": "Grade entry created successfully",
  "data": {
    "_id": "64entry001",
    "user": { ... },
    "grade_field": { ... },
    "mark": 42,
    "is_absent": false,
    "remarks": "Good performance",
    "updated_at": "2026-01-21T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `404`: User not found
- `404`: Grade field not found
- `422`: Mark cannot exceed total mark
- `422`: Grade entry already exists for this user and grade field

**Notes:**
- If `is_absent` is true, mark is automatically set to 0
- Duplicate entries for the same user and grade field are not allowed

---

### 4. Bulk Create Grade Entries
Create multiple grade entries in a single request.

**Endpoint:** `POST /academics/grade-entry/bulk`

**Access:** Any staff

**Request Body:**
```json
{
  "entries": [
    {
      "user": "64user001",
      "grade_field": "64field001",
      "mark": 42,
      "is_absent": false,
      "remarks": "Good"
    },
    {
      "user": "64user002",
      "grade_field": "64field001",
      "mark": 0,
      "is_absent": true,
      "remarks": "Absent"
    }
  ]
}
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| entries | array | Yes | Array of grade entry objects (min: 1) |

Each entry object has the same structure as the single create request.

**Response Example:**
```json
{
  "status_code": 201,
  "message": "Bulk create completed. 8 successful, 2 failed",
  "data": {
    "successful": [
      { "_id": "64entry001", "user": "64user001", ... },
      { "_id": "64entry002", "user": "64user002", ... }
    ],
    "failed": [
      {
        "data": { "user": "64user003", ... },
        "reason": "User not found"
      },
      {
        "data": { "user": "64user004", ... },
        "reason": "Mark cannot exceed total mark of 50"
      }
    ]
  }
}
```

**Status Codes:**
- `201`: All entries created successfully
- `207`: Partial success (some entries failed)
- `422`: All entries failed

**Notes:**
- The operation processes each entry independently
- Failures don't stop processing of remaining entries
- Returns detailed results for both successful and failed entries

---

### 5. Update Grade Entry
Update an existing grade entry.

**Endpoint:** `PUT /academics/grade-entry/:id`

**Access:** Any staff

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Grade Entry ObjectId |

**Request Body:**
```json
{
  "mark": 45,
  "remarks": "Improved performance"
}
```

**Body Parameters:**
All parameters are optional. Only provide fields you want to update.

| Parameter | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| user | string | Valid User ObjectId | Student reference |
| grade_field | string | Valid GradeField ObjectId | Grade field reference |
| mark | number | Minimum: 0 | Marks obtained |
| is_absent | boolean | - | Absence status |
| remarks | string | - | Comments |

**Response Example:**
```json
{
  "status_code": 200,
  "message": "Grade entry updated successfully",
  "data": {
    "_id": "64entry001",
    "user": { ... },
    "grade_field": { ... },
    "mark": 45,
    "is_absent": false,
    "remarks": "Improved performance",
    "updated_at": "2026-01-21T11:00:00.000Z"
  }
}
```

**Error Responses:**
- `404`: Grade entry not found
- `404`: User not found (if updating user)
- `404`: Grade field not found (if updating grade_field)
- `422`: Mark cannot exceed total mark
- `422`: Grade entry already exists for this user and grade field

**Notes:**
- Setting `is_absent` to true automatically sets mark to 0
- `updated_at` timestamp is automatically updated

---

### 6. Delete Grade Entry
Delete a grade entry.

**Endpoint:** `DELETE /academics/grade-entry/:id`

**Access:** Admin only

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Grade Entry ObjectId |

**Response Example:**
```json
{
  "status_code": 200,
  "message": "Grade entry deleted successfully",
  "data": {
    "_id": "64entry001",
    "user": "64user001",
    "grade_field": "64field001",
    "mark": 42,
    "is_absent": false
  }
}
```

**Error Responses:**
- `404`: Grade entry not found

---

## Data Models

### Grade Entry
```typescript
{
  _id: ObjectId | string,
  user: ObjectId, // Reference to User
  grade_field: ObjectId, // Reference to GradeField
  mark: number,
  is_absent: boolean,
  remarks?: string,
  updated_at: Date,
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 207 | Multi-Status (bulk operations with partial success) |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 422 | Unprocessable Entity - Validation error |
| 500 | Server Error - Internal server error |

---

## Notes

1. **Absence Handling:** When `is_absent` is true, the mark is automatically set to 0, regardless of the provided mark value.

2. **Duplicate Prevention:** The system prevents duplicate grade entries for the same user and grade field combination.

3. **Mark Validation:** Marks cannot exceed the `total_mark` defined in the associated grade field.

4. **Bulk Operations:** The bulk create endpoint is designed for efficiency when entering grades for multiple students. It provides detailed feedback for partial failures.

5. **Timestamps:** The `updated_at` field is automatically managed and updated on every modification.

6. **Populated Data:** GET requests automatically populate user and grade field references with nested batch and subject details.

7. **Student View:** Students can view their own grade entries through appropriate student-specific endpoints (to be implemented separately).

8. **Grade Calculation:** To calculate final grades:
   - Fetch all grade entries for a student and subject
   - Apply weightages from grade fields
   - Sum up: (mark / total_mark) * weightage for each field
   - Example: (42/50) * 30 + (38/40) * 20 = 25.2 + 19 = 44.2%

---

## Best Practices

1. **Bulk Entry:** Use the bulk create endpoint when entering grades for an entire class to reduce network overhead.

2. **Remarks:** Provide meaningful remarks for exceptional cases (very high/low scores, improvement, concerns).

3. **Verification:** After bulk operations, review the failed entries and resolve issues before retrying.

4. **Absence Marking:** Always set `is_absent` to true for absent students rather than manually entering 0.

5. **Error Handling:** In bulk operations, the response includes both successful and failed entries. Process them separately in your application.

6. **Audit Trail:** The `updated_at` field helps track when grades were last modified.

---

**Last Updated:** January 21, 2026
