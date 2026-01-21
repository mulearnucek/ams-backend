# Grade Field API Documentation

## Overview
The Grade Field API manages grade evaluation criteria for subjects. Grade fields define components of assessment such as exams, assignments, practicals, attendance, and moderation marks with their respective weightages.

All endpoints require authentication. List and retrieve operations are accessible to any staff member. Create and update operations are also accessible to any staff, while delete operations require admin privileges.

## Base URL
```
/grade-field
```

## Authentication
All endpoints require a valid authentication token.

## Endpoints

### 1. List Grade Fields
Retrieve a paginated list of all grade fields with optional filtering.

**Endpoint:** `GET /academics/grade-field`

**Access:** Any staff (teacher, hod, principal, staff, admin)

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number for pagination |
| limit | number | No | 10 | Number of items per page (max: 100) |
| batch | string | No | - | Filter by batch ObjectId |
| subject | string | No | - | Filter by subject ID |
| type | string | No | - | Filter by type (exam, assignment, practical, attendance, moderation) |

**Response Example:**
```json
{
  "status_code": 200,
  "message": "Grade fields retrieved successfully",
  "data": {
    "gradeFields": [
      {
        "_id": "64abc123def456",
        "batch": {
          "_id": "64batch001",
          "name": "CSE 2024 Batch A",
          "adm_year": 2024,
          "department": "CSE"
        },
        "subject": {
          "_id": "CS101",
          "sem": "1",
          "subject_code": "CS101",
          "type": "Theory"
        },
        "type": "exam",
        "name": "Mid-Semester Exam",
        "total_mark": 50,
        "weightage": 30,
        "value": null,
        "assignment_id": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

---

### 2. Get Grade Field by ID
Retrieve details of a specific grade field.

**Endpoint:** `GET /academics/grade-field/:id`

**Access:** Any staff

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Grade Field ObjectId |

**Response Example:**
```json
{
  "status_code": 200,
  "message": "Grade field retrieved successfully",
  "data": {
    "_id": "64abc123def456",
    "batch": {
      "_id": "64batch001",
      "name": "CSE 2024 Batch A",
      "adm_year": 2024,
      "department": "CSE"
    },
    "subject": {
      "_id": "CS101",
      "sem": "1",
      "subject_code": "CS101",
      "type": "Theory"
    },
    "type": "exam",
    "name": "Mid-Semester Exam",
    "total_mark": 50,
    "weightage": 30
  }
}
```

**Error Responses:**
- `404`: Grade field not found

---

### 3. Create Grade Field
Create a new grade field.

**Endpoint:** `POST /academics/grade-field`

**Access:** Any staff

**Request Body:**
```json
{
  "batch": "64batch001",
  "subject": "CS101",
  "type": "exam",
  "name": "Mid-Semester Exam",
  "total_mark": 50,
  "weightage": 30
}
```

**Body Parameters:**
| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| _id | string | No | - | Custom ID (optional) |
| batch | string | Yes | Valid Batch ObjectId | Batch reference |
| subject | string | Yes | Valid Subject ID | Subject reference |
| type | string | Yes | Enum: exam, assignment, practical, attendance, moderation | Assessment type |
| name | string | Yes | Min length: 1 | Name of the assessment |
| total_mark | number | Yes | Minimum: 0 | Maximum marks |
| weightage | number | Yes | 0-100 | Percentage weightage in final grade |
| value | string | Conditional | - | Required if type = "moderation" |
| assignment_id | string | Conditional | Valid Assignment ObjectId | Required if type = "assignment" |

**Response Example:**
```json
{
  "status_code": 201,
  "message": "Grade field created successfully",
  "data": {
    "_id": "64abc123def456",
    "batch": { ... },
    "subject": { ... },
    "type": "exam",
    "name": "Mid-Semester Exam",
    "total_mark": 50,
    "weightage": 30
  }
}
```

**Error Responses:**
- `404`: Batch not found
- `404`: Subject not found
- `422`: Value is required for moderation type
- `422`: Assignment ID is required for assignment type
- `422`: Total weightage would exceed 100%

---

### 4. Update Grade Field
Update an existing grade field.

**Endpoint:** `PUT /academics/grade-field/:id`

**Access:** Any staff

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Grade Field ObjectId |

**Request Body:**
```json
{
  "name": "Mid-Term Examination",
  "total_mark": 60,
  "weightage": 35
}
```

**Body Parameters:**
All parameters are optional. Only provide fields you want to update.

| Parameter | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| batch | string | Valid Batch ObjectId | Batch reference |
| subject | string | Valid Subject ID | Subject reference |
| type | string | Enum: exam, assignment, practical, attendance, moderation | Assessment type |
| name | string | Min length: 1 | Assessment name |
| total_mark | number | Minimum: 0 | Maximum marks |
| weightage | number | 0-100 | Percentage weightage |
| value | string | - | Moderation value |
| assignment_id | string | Valid Assignment ObjectId | Assignment reference |

**Response Example:**
```json
{
  "status_code": 200,
  "message": "Grade field updated successfully",
  "data": {
    "_id": "64abc123def456",
    "batch": { ... },
    "subject": { ... },
    "type": "exam",
    "name": "Mid-Term Examination",
    "total_mark": 60,
    "weightage": 35
  }
}
```

**Error Responses:**
- `404`: Grade field not found
- `404`: Batch not found (if updating batch)
- `404`: Subject not found (if updating subject)
- `422`: Value is required for moderation type
- `422`: Assignment ID is required for assignment type
- `422`: Total weightage would exceed 100%

---

### 5. Delete Grade Field
Delete a grade field.

**Endpoint:** `DELETE /academics/grade-field/:id`

**Access:** Admin only

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Grade Field ObjectId |

**Response Example:**
```json
{
  "status_code": 200,
  "message": "Grade field deleted successfully",
  "data": {
    "_id": "64abc123def456",
    "batch": "64batch001",
    "subject": "CS101",
    "type": "exam",
    "name": "Mid-Semester Exam",
    "total_mark": 50,
    "weightage": 30
  }
}
```

**Error Responses:**
- `404`: Grade field not found

---

## Data Models

### Grade Field
```typescript
{
  _id: ObjectId | string,
  batch: ObjectId, // Reference to Batch
  subject: string, // Reference to Subject
  type: "exam" | "assignment" | "practical" | "attendance" | "moderation",
  name: string,
  total_mark: number,
  weightage: number, // 0-100
  value?: string, // Required for moderation type
  assignment_id?: ObjectId, // Required for assignment type
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

1. **Grade Field Types:**
   - `exam`: For written examinations
   - `assignment`: For homework/project assignments (requires assignment_id)
   - `practical`: For lab/practical evaluations
   - `attendance`: For attendance-based marks
   - `moderation`: For grade adjustments (requires value field)

2. **Weightage Validation:** The total weightage for all grade fields within the same batch and subject cannot exceed 100%. The system validates this on create and update operations.

3. **Conditional Fields:**
   - `value`: Must be provided when type = "moderation"
   - `assignment_id`: Must be provided when type = "assignment"
   - These fields are automatically cleared for other types

4. **Pre-save Hook:** The model has a pre-save hook that:
   - Clears `value` for non-moderation types
   - Clears `assignment_id` for non-assignment types
   - Validates required conditional fields

5. **Populated Data:** GET requests automatically populate batch and subject references with key details.

6. **Cascading Considerations:** Deleting a grade field does not automatically delete related grade entries. Consider cleanup logic before deletion.

7. **Weightage Distribution:** Plan your assessment structure carefully. Common distributions:
   - Mid-semester: 30%, End-semester: 50%, Assignments: 15%, Attendance: 5%
   - Practical: 40%, Theory exam: 50%, Viva: 10%

---

**Last Updated:** January 21, 2026
