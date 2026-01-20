# AMS Backend API Documentation

Welcome to the AMS (Academic Management System) Backend API documentation. This documentation provides detailed information about all available API endpoints, their usage, and best practices.

## Table of Contents

### Authentication & User Management
- [User API](user.md) - User profile management, creation, updates, and role-based operations

### Notifications
- [Notification API](notification.md) - Create, read, update, and delete notifications for different user groups

### Attendance Management
- [Attendance Session API](attendance-session.md) - Manage class sessions for attendance tracking
- [Attendance Record API](attendance-record.md) - Mark and manage individual student attendance records

## Overview

All APIs follow consistent patterns:
- **Authentication**: Session-based authentication via Better-Auth
- **Authorization**: Role-based access control (admin, teacher, student, parent, principal, hod, staff)
- **Response Format**: Standardized JSON responses with `status_code`, `message`, and `data` fields
- **Error Handling**: Consistent error codes (400, 401, 403, 404, 422, 500)

## Quick Links

### Common Operations

**User Management**
- Get current user profile: `GET /user`
- List users by role: `GET /user/list?role={role}`
- Update user profile: `PUT /user`

**Attendance Sessions**
- List sessions: `GET /academics/attendance/session`
- Create session: `POST /academics/attendance/session`
- Get session details: `GET /academics/attendance/session/:id`

**Attendance Records**
- Mark single attendance: `POST /academics/attendance/record`
- Bulk mark attendance: `POST /academics/attendance/record/bulk`
- View attendance records: `GET /academics/attendance/record?session={id}`

**Notifications**
- Get user notifications: `GET /notifications`
- Create notification: `POST /notifications`

## Getting Started

1. **Authentication**: All endpoints (except auth routes) require a valid session cookie
2. **Base URL**: The API runs on `http://localhost:4000` (or configured port)
3. **Content Type**: All requests must use `Content-Type: application/json`
4. **CORS**: Configure allowed origins in the `.env` file

## API Conventions

### Response Format

**Success Response:**
```json
{
  "status_code": 200,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "status_code": 400,
  "message": "Error description",
  "error": "Detailed error message (optional)"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Unprocessable Entity (validation/data issues)
- `500` - Internal Server Error

### Pagination

List endpoints support pagination with query parameters:
- `page` - Page number (default: 1, minimum: 1)
- `limit` - Items per page (default: 10, minimum: 1, maximum: 100)

Response includes pagination metadata:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

## User Roles

The system supports the following roles:
- **student** - Student users
- **teacher** - Teaching staff
- **parent** - Parent/guardian users
- **admin** - System administrators
- **principal** - College principal
- **hod** - Head of Department
- **staff** - Administrative staff

### Role Permissions

- **Students**: Can view their own profile and attendance
- **Teachers**: Can create sessions, mark attendance, manage their records
- **Staff** (teacher, hod, principal, staff, admin): Full access to attendance management
- **Admin/Principal/HOD**: Can modify/delete any records
- **Parents**: Can view their child's information

## Need Help?

For detailed information about specific endpoints, refer to the individual API documentation files listed above.

---

**Last Updated**: January 21, 2026  
**API Version**: 1.0  
**Base URL**: `https://api.ams.mulearn.uck.ac.in`
