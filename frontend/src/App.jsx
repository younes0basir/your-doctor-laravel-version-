import React from 'react'
import Navbar from './components/Navbar'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ListOfDoctors from './pages/ListOfDoctors'
import Appointment from './pages/Appointment'
import About from './pages/About'
import Contact from './pages/Contact'
import Footer from './components/Footer'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AdminSidebar from './admin/AdminSidebar';
import AdminDashboard from './admin/AdminDashboard';
import AdminAccounts from './admin/AdminAccounts';
import AdminAppointments from './admin/AdminAppointments';
import AdminAssistants from './admin/AdminAssistants';
import AdminAccountCreate from './admin/AdminAccountCreate';
import DoctorSidebar from './components/doctor/DoctorSidebar';
import DoctorDashboard from './components/doctor/DoctorDashboard';
import DoctorAppointments from './components/doctor/DoctorAppointments';
import DoctorPatients from './components/doctor/DoctorPatients';
import DoctorAssistants from './components/doctor/DoctorAssistants';
import DoctorSettings from './components/doctor/DoctorSettings';
import DoctorOfficeQueue from './components/doctor/DoctorOfficeQueue';
import DoctorSchedule from './components/doctor/DoctorSchedule';
import AssistantDashboard from './components/assistant/AssistantDashboard';
import AssistantAppointments from './components/assistant/AssistantAppointments';
import AssistantPatients from './components/assistant/AssistantPatients';
import AssistantManageQueue from './components/assistant/AssistantManageQueue';
import AssistantQueue from './components/assistant/AssistantQueue';
import MedicalRecords from './components/medical/MedicalRecords';
import MyAppointments from './pages/MyAppointments';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin/');
  const isDoctorRoute = location.pathname.startsWith('/doctor/');
  const isAssistantRoute = location.pathname.startsWith('/assistant/');

  return (
    <AuthProvider>
    <div className='flex flex-col min-h-screen'>
      <ToastContainer />
      {/* Hide NavBar and Footer on admin/doctor/assistant pages */}
      {!isAdminRoute && !isDoctorRoute && !isAssistantRoute && <Navbar />}
      <div className='flex-grow'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/doctors' element={<ListOfDoctors />} />
          <Route path='/appointment/:doctorId' element={<Appointment />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/my-appointments' element={<ProtectedRoute allowedRoles={['patient']}><MyAppointments /></ProtectedRoute>} />
          
          <Route path='/admin/*' element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSidebar />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminAccounts />} />
            <Route path="users/new" element={<AdminAccountCreate />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="assistants" element={<AdminAssistants />} />
            <Route index element={<AdminDashboard />} />
            <Route path="*" element={<div className="p-8 text-center text-red-600 text-xl font-bold">Admin page not found</div>} />
          </Route>

          {/* Doctor Routes */}
          <Route path='/doctor/dashboard' element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path='/doctor/appointments' element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
          <Route path='/doctor/patients' element={<ProtectedRoute allowedRoles={['doctor']}><DoctorPatients /></ProtectedRoute>} />
          <Route path='/doctor/assistants' element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAssistants /></ProtectedRoute>} />
          <Route path='/doctor/settings' element={<ProtectedRoute allowedRoles={['doctor']}><DoctorSettings /></ProtectedRoute>} />
          <Route path='/doctor/office-queue' element={<ProtectedRoute allowedRoles={['doctor']}><DoctorOfficeQueue /></ProtectedRoute>} />
          <Route path='/doctor/schedule' element={<ProtectedRoute allowedRoles={['doctor']}><DoctorSchedule /></ProtectedRoute>} />
          <Route path='/doctor/medical-records/:patientId' element={<ProtectedRoute allowedRoles={['doctor']}><MedicalRecords /></ProtectedRoute>} />
          <Route path='/doctor' element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />

          {/* Assistant Routes */}
          <Route path='/assistant/dashboard' element={<ProtectedRoute allowedRoles={['assistant']}><AssistantDashboard /></ProtectedRoute>} />
          <Route path='/assistant/appointments' element={<ProtectedRoute allowedRoles={['assistant']}><AssistantAppointments /></ProtectedRoute>} />
          <Route path='/assistant/patients' element={<ProtectedRoute allowedRoles={['assistant']}><AssistantPatients /></ProtectedRoute>} />
          <Route path='/assistant/queue' element={<ProtectedRoute allowedRoles={['assistant']}><AssistantQueue /></ProtectedRoute>} />
          <Route path='/assistant/manage-queue' element={<ProtectedRoute allowedRoles={['assistant']}><AssistantManageQueue /></ProtectedRoute>} />
          <Route path='/assistant/medical-records/:patientId' element={<ProtectedRoute allowedRoles={['assistant']}><MedicalRecords /></ProtectedRoute>} />
          <Route path='/assistant' element={<ProtectedRoute allowedRoles={['assistant']}><AssistantDashboard /></ProtectedRoute>} />
        </Routes>
      </div>
      {!isAdminRoute && !isDoctorRoute && !isAssistantRoute && <Footer />}
    </div>
    </AuthProvider>
  )
}

export default App
