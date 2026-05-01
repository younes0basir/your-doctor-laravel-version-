# Admin CRUD Operations & Permissions System

## Overview

The admin system now includes comprehensive CRUD (Create, Read, Update, Delete) operations with role-based permissions for managing users, doctors, appointments, and system settings.

---

## Backend API Endpoints

### 1. Dashboard & Statistics

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/admin/dashboard` | Get dashboard overview statistics | admin |
| GET | `/api/admin/statistics` | Get detailed statistics for charts | admin |
| GET | `/api/admin/permissions` | Get current admin permissions | admin |
| GET | `/api/admin/activity-logs` | Get recent system activity | admin |

### 2. User Management (Full CRUD)

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/admin/accounts` | List all users (paginated) | admin |
| POST | `/api/admin/accounts` | Create new user | admin |
| PUT | `/api/admin/accounts/{id}` | Update user details | admin |
| DELETE | `/api/admin/accounts/{id}` | Delete user | admin |
| POST | `/api/admin/accounts/bulk-action` | Bulk actions on multiple users | admin |

#### Create User Payload
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "patient",  // admin, patient, doctor, assistant
  "phone": "+1234567890",
  "status": "active"  // active, inactive, pending, approved, hidden
}
```

#### Update User Payload
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "status": "active",
  "password": "newpassword123"  // optional
}
```

#### Bulk Actions
```json
{
  "action": "activate",  // activate, deactivate, delete
  "user_ids": [1, 2, 3, 4]
}
```

### 3. Doctor Management

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| PUT | `/api/admin/doctors/{id}/approve` | Approve doctor account | admin |
| PUT | `/api/admin/doctors/{id}/hide` | Hide/reject doctor | admin |

### 4. Appointment Management

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/admin/appointments` | List all appointments | admin |
| PUT | `/api/admin/appointments/{id}/status` | Update appointment status | admin |
| DELETE | `/api/admin/appointments/{id}` | Delete appointment | admin |

#### Update Appointment Status
```json
{
  "status": "confirmed"  // pending, confirmed, in_progress, completed, canceled
}
```

---

## Frontend Components Enhanced

### AdminAccounts.jsx

**New Features:**
- ✅ Bulk selection with checkboxes
- ✅ Bulk actions (activate, deactivate, delete)
- ✅ Edit user modal
- ✅ Create user functionality
- ✅ Real-time filtering and search
- ✅ Status badges with color coding

**Usage:**
```javascript
// Select individual account
toggleSelectAccount(accountId)

// Select all accounts
toggleSelectAll()

// Perform bulk action
handleBulkAction('activate')  // or 'deactivate', 'delete'

// Edit user
handleEdit(user)

// Create user (via modal/form)
handleCreateUser(userData)
```

### AdminDashboard.jsx

**Features:**
- ✅ Real-time statistics
- ✅ Interactive charts (appointments trend, revenue, user growth)
- ✅ Recent activity feed
- ✅ Quick metrics cards

### AdminAppointments.jsx

**Features:**
- ✅ View all appointments
- ✅ Filter by status, date, doctor
- ✅ Update appointment status
- ✅ Delete appointments
- ✅ Payment status management

---

## Permissions System

### Permission Structure

```javascript
{
  "users": {
    "view": true,
    "create": true,
    "edit": true,
    "delete": true
  },
  "doctors": {
    "view": true,
    "approve": true,
    "reject": true,
    "edit": true
  },
  "appointments": {
    "view": true,
    "edit": true,
    "delete": true,
    "cancel": true
  },
  "assistants": {
    "view": true,
    "create": true,
    "edit": true,
    "delete": true
  },
  "statistics": {
    "view": true,
    "export": true
  },
  "settings": {
    "view": true,
    "edit": true
  }
}
```

### Checking Permissions

Get current admin permissions:
```javascript
const response = await api.get('/admin/permissions');
console.log(response.data.permissions);
```

---

## Security Features

### 1. Authentication
- All admin routes protected by `auth:sanctum` middleware
- Additional `admin` middleware checks user role
- Token-based authentication via Laravel Sanctum

### 2. Authorization
- Admin-only access to management endpoints
- Cannot delete own account
- Validation on all input data
- SQL injection prevention via Eloquent ORM

### 3. Data Integrity
- Cascade deletes for related records
- Transaction support for bulk operations
- Soft delete capability (can be added)

---

## Usage Examples

### Example 1: Create a New Patient

```javascript
// Frontend
const createPatient = async () => {
  try {
    const response = await api.post('/admin/accounts', {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      password: 'SecurePass123',
      role: 'patient',
      phone: '+1234567890',
      status: 'active'
    });
    
    toast.success('Patient created successfully');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Creation failed');
  }
};
```

### Example 2: Approve a Doctor

```javascript
const approveDoctor = async (doctorId) => {
  try {
    await api.put(`/admin/doctors/${doctorId}/approve`);
    toast.success('Doctor approved');
  } catch (error) {
    toast.error('Approval failed');
  }
};
```

### Example 3: Bulk Deactivate Users

```javascript
const bulkDeactivate = async (userIds) => {
  try {
    await api.post('/admin/accounts/bulk-action', {
      action: 'deactivate',
      user_ids: userIds
    });
    toast.success('Users deactivated');
  } catch (error) {
    toast.error('Bulk action failed');
  }
};
```

### Example 4: Update Appointment Status

```javascript
const updateAppointment = async (appointmentId, newStatus) => {
  try {
    await api.put(`/admin/appointments/${appointmentId}/status`, {
      status: newStatus
    });
    toast.success('Status updated');
  } catch (error) {
    toast.error('Update failed');
  }
};
```

---

## Error Handling

All endpoints return standardized error responses:

### Validation Error (422)
```json
{
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

### Not Found (404)
```json
{
  "message": "User not found"
}
```

### Forbidden (403)
```json
{
  "message": "Unauthorized. Admin access required."
}
```

### Success Response (200/201)
```json
{
  "message": "Operation successful",
  "user": { ... }  // or relevant data
}
```

---

## Testing

### Test with cURL

```bash
# Login as admin
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Get accounts (replace TOKEN with actual token)
curl -X GET http://localhost:8000/api/admin/accounts \
  -H "Authorization: Bearer TOKEN" \
  -H "Accept: application/json"

# Create user
curl -X POST http://localhost:8000/api/admin/accounts \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name":"Test",
    "last_name":"User",
    "email":"test@example.com",
    "password":"password123",
    "role":"patient"
  }'

# Bulk action
curl -X POST http://localhost:8000/api/admin/accounts/bulk-action \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action":"activate",
    "user_ids":[1,2,3]
  }'
```

---

## Future Enhancements

Potential additions:
- [ ] Role-based access control (RBAC) with multiple admin levels
- [ ] Activity logging/audit trail
- [ ] Export data to CSV/Excel
- [ ] Advanced filtering and search
- [ ] Notification system
- [ ] Two-factor authentication for admins
- [ ] IP whitelisting for admin access
- [ ] Rate limiting for admin endpoints
- [ ] Soft deletes with restore functionality
- [ ] User impersonation feature

---

## Files Modified

### Backend
- ✅ `backend/app/Http/Controllers/Api/AdminController.php` - Added CRUD methods
- ✅ `backend/routes/api.php` - Added admin routes

### Frontend
- ✅ `frontend/src/admin/AdminAccounts.jsx` - Added bulk actions, edit, create
- ✅ `frontend/requests.js` - Centralized API instance with auth

---

## Support

For issues or questions:
1. Check browser console for frontend errors
2. Check `storage/logs/laravel.log` for backend errors
3. Verify admin authentication token is valid
4. Ensure database migrations are up to date

Run these commands if needed:
```bash
php artisan migrate
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```
