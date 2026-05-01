# Batch Replace Axios with Centralized API Instance

## Files That Need Updating

### Doctor Components (High Priority)
- [x] `components/doctor/DoctorDashboard.jsx` - Import replaced, need to replace axios calls
- [ ] `components/doctor/DoctorAppointments.jsx`
- [ ] `components/doctor/DoctorPatients.jsx`
- [ ] `components/doctor/DoctorSettings.jsx`
- [ ] `components/doctor/DoctorLogin.jsx`
- [ ] `components/doctor/DoctorRegister.jsx`
- [ ] `components/doctor/DoctorSidebar.jsx`
- [ ] `components/doctor/DoctorOfficeQueue.jsx`
- [ ] `components/doctor/PatientHistory.jsx`
- [ ] `components/doctor/AppointmentLive.jsx`
- [ ] `components/doctor/Ordonnance.jsx`
- [ ] `components/doctor/ProtectedRoute.jsx`

### Assistant Components (Medium Priority)
- [ ] `components/assistant/AssistantDashboard.jsx`
- [ ] `components/assistant/AssistantAppointments.jsx`
- [ ] `components/assistant/AssistantPatients.jsx`
- [ ] `components/assistant/AssistantQueue.jsx`
- [ ] `components/assistant/AssistantLogin.jsx`
- [ ] `components/assistant/AssistantRegister.jsx`
- [ ] `components/assistant/NewAppointment.jsx`

### Pages (Medium Priority)
- [ ] `pages/AdminRegister.jsx`
- [ ] `pages/VideoAppointment.jsx`
- [ ] `pages/Profile.jsx`

### Already Fixed
- [x] `admin/AdminDashboard.jsx` ✅
- [x] `admin/AdminAppointments.jsx` ✅
- [x] `admin/AdminAccounts.jsx` ✅ (already using api)
- [x] `admin/AdminAssistants.jsx` ✅
- [x] `admin/AdminAccountCreate.jsx` ✅
- [x] `requests.js` ✅ (this is the centralized api instance)

## Replacement Pattern

### Step 1: Replace Import
```javascript
// BEFORE
import axios from 'axios';

// AFTER
import api from '../../requests';  // Adjust path as needed
```

### Step 2: Remove API_URL Constants
```javascript
// DELETE THIS LINE
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

### Step 3: Replace axios.get/post/put/delete Calls
```javascript
// BEFORE
await axios.get(`${API_URL}/api/some-endpoint`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// AFTER
await api.get('/some-endpoint');  // Token handled automatically by interceptor
```

### Step 4: Handle Paginated Responses
```javascript
// BEFORE
const response = await axios.get('/endpoint');
setData(response.data);

// AFTER
const response = await api.get('/endpoint');
setData(response.data?.data || response.data || []);
```

## Common Patterns to Replace

### Pattern 1: GET Request with Token
```javascript
// OLD
const token = localStorage.getItem('doctorToken');
const res = await axios.get(`http://localhost:5000/api/endpoint`, {
  headers: { Authorization: `Bearer ${token}` }
});

// NEW
const res = await api.get('/endpoint');
```

### Pattern 2: POST Request
```javascript
// OLD
await axios.post(`${API_URL}/api/endpoint`, data, {
  headers: { 'Content-Type': 'application/json' }
});

// NEW
await api.post('/endpoint', data);
```

### Pattern 3: PUT/PATCH Request
```javascript
// OLD
await axios.put(`${API_URL}/api/endpoint/${id}`, data);

// NEW
await api.put(`/endpoint/${id}`, data);
```

### Pattern 4: DELETE Request
```javascript
// OLD
await axios.delete(`${API_URL}/api/endpoint/${id}`);

// NEW
await api.delete(`/endpoint/${id}`);
```

## Notes

1. **Path Adjustment**: The import path `../../requests` needs to be adjusted based on file location:
   - From `src/components/doctor/`: use `../../requests`
   - From `src/components/assistant/`: use `../../requests`
   - From `src/pages/`: use `../requests` or `../../requests` depending on structure

2. **Hardcoded URLs**: Replace all hardcoded URLs like `http://localhost:5000/api/...` with relative paths

3. **Manual Headers**: Remove manual header setting for Authorization - the interceptor handles it

4. **Error Handling**: Keep existing try-catch blocks, they work the same way

5. **Response Structure**: Laravel returns paginated data in `response.data.data`, so extract accordingly

## Testing Checklist

After replacing axios in each file:
- [ ] File has no syntax errors
- [ ] Import path is correct
- [ ] All axios calls replaced with api calls
- [ ] No hardcoded URLs remain
- [ ] No manual token handling remains
- [ ] Test the component in browser
- [ ] Check Network tab for correct URLs (no double /api/)
- [ ] Verify authentication works

## Quick Command to Find Remaining axios Usage

```bash
# Find all files still importing axios
grep -r "import.*axios" frontend/src --include="*.jsx" --include="*.js"

# Find all files still using axios methods
grep -r "axios\.\(get\|post\|put\|delete\)" frontend/src --include="*.jsx" --include="*.js"
```
