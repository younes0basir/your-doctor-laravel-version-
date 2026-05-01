# Fix: Double /api/ in URL (404 Error)

## Problem

The error `:8000/api/api/admin/appointments:1 Failed to load resource: the server responded with a status of 404 (Not Found)` indicates that the URL has `/api/` duplicated.

**Root Cause:** Some admin components were using `axios` directly with hardcoded URLs that included `/api/`, while the API base URL already contains `/api`. This resulted in URLs like:
```
http://localhost:8000/api/api/admin/appointments  ❌ (Wrong - double /api/)
```

Instead of:
```
http://localhost:8000/api/admin/appointments  ✅ (Correct)
```

## Additional Issues Found

1. **Wrong Port**: Some components used `http://localhost:5000` instead of `http://localhost:8000`
2. **Manual Token Handling**: Components manually managed authentication tokens instead of using the centralized interceptor
3. **Inconsistent API Calls**: Mix of direct axios calls and the centralized api instance

## Solution

### Files Modified

1. ✅ `frontend/src/admin/AdminAppointments.jsx`
2. ✅ `frontend/src/admin/AdminAssistants.jsx`
3. ✅ `frontend/src/admin/AdminAccountCreate.jsx`

### Changes Made

#### 1. Replaced axios imports with centralized api instance

**Before:**
```javascript
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

await axios.get(`${API_URL}/api/admin/appointments`);
```

**After:**
```javascript
import api from '../../requests';

await api.get('/admin/appointments');
```

#### 2. Removed manual token handling

The centralized `api` instance in `requests.js` automatically attaches tokens via interceptors:

```javascript
// requests.js handles this automatically
const token = localStorage.getItem('adminToken') || 
              localStorage.getItem('patientToken') || 
              localStorage.getItem('doctorToken');
if (token) {
  config.headers['Authorization'] = `Bearer ${token}`;
}
```

#### 3. Fixed data extraction for paginated responses

**Before:**
```javascript
const response = await axios.get(`${API_URL}/api/admin/appointments`);
setAppointments(response.data);
```

**After:**
```javascript
const response = await api.get('/admin/appointments');
const appointmentsData = response.data?.data || response.data || [];
setAppointments(appointmentsData);
```

#### 4. Updated endpoint paths

All endpoints now use relative paths without `/api/` prefix:

| Before | After |
|--------|-------|
| `${API_URL}/api/admin/appointments` | `/admin/appointments` |
| `${API_URL}/api/admin/accounts` | `/admin/accounts` |
| `${API_URL}/api/doctors` | `/doctors` |
| `${API_URL}/api/users` | `/users` |

## Benefits

1. **Consistent API Base URL**: All requests go through the centralized configuration
2. **Automatic Authentication**: Tokens are attached automatically via interceptors
3. **Easier Maintenance**: Change API URL in one place (`requests.js`)
4. **Better Error Handling**: Centralized error handling in interceptors
5. **No More 404 Errors**: Correct URL construction prevents double `/api/` issues

## Testing

After these fixes, test each admin page:

1. **Admin Dashboard** (`/admin/dashboard`)
   - Should load statistics, accounts, and appointments
   - Check browser console for any errors

2. **Admin Appointments** (`/admin/appointments`)
   - Should fetch and display appointments
   - Edit, delete, and payment status updates should work

3. **Admin Accounts** (`/admin/accounts`)
   - Should list all users
   - Filtering and search should work

4. **Admin Assistants** (`/admin/assistants`)
   - Should load assistants list
   - Create, edit, delete operations should work

5. **Admin Account Create** (`/admin/accounts/new`)
   - Should load specialities for doctors
   - Should load doctors list for assistants
   - Form submission should work

## Verification

Open browser DevTools (F12) → Network tab and verify:
- ✅ All API requests go to `http://localhost:8000/api/...` (not `/api/api/...`)
- ✅ Requests include `Authorization: Bearer <token>` header
- ✅ No 404 errors for admin endpoints

## Related Files

- `frontend/requests.js` - Centralized API configuration
- `frontend/src/admin/AdminDashboard.jsx` - Already fixed in previous update
- `backend/routes/api.php` - Backend route definitions
- `backend/app/Http/Controllers/Api/AdminController.php` - Admin controller

## Notes

- The `AdminAssistants` component uses `/assistants` endpoints which may need to be created in the backend if they don't exist yet
- All admin components now properly handle paginated responses from Laravel
- Data transformation (snake_case to camelCase) is handled where needed
