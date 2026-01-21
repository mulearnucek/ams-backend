# Subject API Documentation

## Overview
The Subject API allows management of course subjects in the AMS system. Subjects contain information about courses including semester, subject code, type (Theory/Practical), marks distribution, and assigned faculty members.

All endpoints require authentication. List and retrieve operations are accessible to any staff member, while create, update, and delete operations require admin privileges.

## Base URL
```
/subject
```

## Authentication
All endpoints require a valid authentication token. Include the token in your request headers or cookies as configured in the Better-Auth system.

## Endpoints

### 1. List Subjects
Retrieve a paginated list of all subjects with optional filtering.

**Endpoint:** `GET /subject`

**Access:** Any staff (teacher, hod, principal, staff, admin)

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number for pagination |
| limit | number | No | 10 | Number of items per page (max: 100) |
| sem | string | No | - | Filter by semester |
| type | string | No | - | Filter by type (Theory, Practical) |

**Response Example:**
```json
{
  "status_code": 200,
  "message": "Subjects retrieved successfully",
  "data": {
    "subjects": [
      {
        "_id": "CS101",
        "sem": "1",
        "subject_code": "CS101",
        "type": "Theory",
        "total_marks": 100,
        "pass_mark": 40,
        "faculty_in_charge": ["Dr. John Doe", "Prof. Jane Smith"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  }
}
```

---

### 2. Get Subject by ID
Retrieve details of a specific subject.

**Endpoint:** `GET /subject/:id`

**Access:** Any staff (teacher, hod, principal, staff, admin)

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Subject ID |

**Response Example:**
```json
{
  "status_code": 200,
  "message": "Subject retrieved successfully",
  "data": {
    "_id": "CS101",
    "sem": "1",
    "subject_code": "CS101",
    "type": "Theory",
    "total_marks": 100,
    "pass_mark": 40,
    "faculty_in_charge": ["Dr. John Doe", "Prof. Jane Smith"]
  }
}
```

**Error Responses:**
- `404`: Subject not found

---

### 3. Create Subject
Create a new subject.

**Endpoint:** `POST /subject`

**Access:** Admin only

**Request Body:**
```json
{
  "_id": "CS101",
  "sem": "1",
  "subject_code": "CS101",
  "type": "Theory",
  "total_marks": 100,
  "pass_mark": 40,
  "faculty_in_charge": ["Dr. John Doe", "Prof. Jane Smith"]
}
```

**Body Parameters:**
| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| _id | string | Yes | Min length: 1 | Subject unique identifier |
| sem | string | Yes | Min length: 1 | Semester (e.g., "1", "2", "3") |
| subject_code | string | Yes | Min length: 1 | Subject code (e.g., "CS101") |
| type | string | Yes | Enum: Theory, Practical | Subject type |
| total_marks | number | Yes | Minimum: 0 | Maximum marks for the subject |
| pass_mark | number | Yes | Minimum: 0 | Passing marks threshold |
| faculty_in_charge | string[] | Yes | Min items: 1 | Array of faculty names |

**Response Example:**
```json
{
  "status_code": 201,
  "message": "Subject created successfully",
  "data": {
    "_id": "CS101",
    "sem": "1",
    "subject_code": "CS101",
    "type": "Theory",
    "total_marks": 100,
    "pass_mark": 40,
    "faculty_in_charge": ["Dr. John Doe", "Prof. Jane Smith"]
  }
}
```

**Error Responses:**
- `422`: Subject with this ID already exists
- `422`: Pass mark cannot be greater than total marks

---

### 4. Update Subject
Update an existing subject.

**Endpoint:** `PUT /subject/:id`

**Access:** Admin only

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Subject ID |

**Request Body:**
```json
{
  "sem": "2",
  "total_marks": 150,
  "pass_mark": 60,
  "faculty_in_charge": ["Dr. John Doe", "Prof. Jane Smith", "Dr. Alice Brown"]
}
```

**Body Parameters:**
All parameters are optional. Only provide fields you want to update.

| Parameter | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| sem | string | Min length: 1 | Semester |
| subject_code | string | Min length: 1 | Subject code |
| type | string | Enum: Theory, Practical | Subject type |
| total_marks | number | Minimum: 0 | Maximum marks |
| pass_mark | number | Minimum: 0 | Passing marks |
| faculty_in_charge | string[] | Min items: 1 | Array of faculty names |

**Response Example:**
```json
{
  "status_code": 200,
  "message": "Subject updated successfully",
  "data": {
    "_id": "CS101",
    "sem": "2",
    "subject_code": "CS101",
    "type": "Theory",
    "total_marks": 150,
    "pass_mark": 60,
    "faculty_in_charge": ["Dr. John Doe", "Prof. Jane Smith", "Dr. Alice Brown"]
  }
}
```

**Error Responses:**
- `404`: Subject not found
- `422`: Pass mark cannot be greater than total marks

---

### 5. Delete Subject
Delete a subject.

**Endpoint:** `DELETE /subject/:id`

**Access:** Admin only

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Subject ID |

**Response Example:**
```json
{
  "status_code": 200,
  "message": "Subject deleted successfully",
  "data": {
    "_id": "CS101",
    "sem": "1",
    "subject_code": "CS101",
    "type": "Theory",
    "total_marks": 100,
    "pass_mark": 40,
    "faculty_in_charge": ["Dr. John Doe", "Prof. Jane Smith"]
  }
}
```

**Error Responses:**
- `404`: Subject not found

---

## Data Models

### Subject
```typescript
{
  _id: string, // Custom ID (e.g., "CS101")
  sem: string,
  subject_code: string,
  type: "Theory" | "Practical",
  total_marks: number,
  pass_mark: number,
  faculty_in_charge: string[], // Array of teacher names
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 422 | Unprocessable Entity - Validation error or duplicate data |
| 500 | Server Error - Internal server error |

---

## Notes

1. **Custom ID**: Unlike other models, Subject uses a custom string ID (_id field) instead of auto-generated ObjectId. This allows for more readable IDs like "CS101".

2. **Faculty In Charge**: Currently stores faculty names as strings in an array. This is a simplified approach and might be changed to ObjectId references in future versions.

3. **Marks Validation**: The system ensures that pass_mark cannot exceed total_marks during both creation and updates.

4. **Subject Types**: Only two types are supported: Theory and Practical.

5. **Unique Constraint**: The _id field must be unique. Attempting to create a subject with an existing _id will result in a 422 error.

6. **Soft Relations**: Deleting a subject does not automatically cascade to attendance sessions or grade records. Ensure proper cleanup logic in your application if needed.

7. **Pagination**: Default pagination is 10 items per page with a maximum of 100 items per page.

8. **Sorting**: Subjects are sorted by semester and subject_code (both ascending) by default.

9. **Semester Format**: The semester field is stored as a string to support flexible formats like "1", "S1", "Fall 2024", etc.

---

## Best Practices

1. **Naming Convention**: Use consistent subject codes (e.g., CS101, CS102) for easier identification and sorting.

2. **Faculty Management**: When updating faculty_in_charge, provide the complete array as it replaces the existing array entirely.

3. **Marks Configuration**: Ensure total_marks and pass_mark values align with your institution's grading policy.

4. **Type Selection**: Choose "Theory" for classroom-based courses and "Practical" for lab-based courses.

5. **Batch Cleanup**: Before deleting a subject, ensure no active attendance sessions or grade records reference it.

---

**Last Updated:** January 21, 2026
