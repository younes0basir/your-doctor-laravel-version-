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
import AssistantDashboard from './components/assistant/AssistantDashboard';
import AssistantAppointments from './components/assistant/AssistantAppointments';
import AssistantPatients from './components/assistant/AssistantPatients';
import AssistantManageQueue from './components/assistant/AssistantManageQueue';

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin/');
  const isDoctorRoute = location.pathname.startsWith('/doctor/');

  return (
    <div className='flex flex-col min-h-screen'>
      <ToastContainer />
      {/* Hide NavBar and Footer on admin/doctor pages */}
      {!isAdminRoute && !isDoctorRoute && <Navbar />}
      <div className='flex-grow'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/doctors' element={<ListOfDoctors />} />
          <Route path='/appointment/:doctorId' element={<Appointment />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/admin/*' element={<AdminSidebar />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="accounts" element={<AdminAccounts />} />
            <Route path="accounts/new" element={<AdminAccountCreate />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="assistants" element={<AdminAssistants />} />
            {/* fallback for unknown admin routes */}
            <Route path="*" element={<div className="p-8 text-center text-red-600 text-xl font-bold">Admin page not found</div>} />
            <Route index element={<AdminDashboard />} />
          </Route>
          <Route path='/doctor/*'>
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="patients" element={<DoctorPatients />} />
            {/* fallback for unknown doctor routes */}
            <Route path="*" element={<div className="p-8 text-center text-red-600 text-xl font-bold">Doctor page not found</div>} />
            <Route index element={<DoctorDashboard />} />
          </Route>
          <Route path='/assistant/*'>
            <Route path="dashboard" element={<AssistantDashboard />} />
            <Route path="appointments" element={<AssistantAppointments />} />
            <Route path="patients" element={<AssistantPatients />} />
            <Route path="manage-queue" element={<AssistantManageQueue />} />
            {/* fallback for unknown assistant routes */}
            <Route path="*" element={<div className="p-8 text-center text-red-600 text-xl font-bold">Assistant page not found</div>} />
            <Route index element={<AssistantDashboard />} />
          </Route>
        </Routes>
      </div>
      {!isAdminRoute && !isDoctorRoute && <Footer />}
    </div>
  )
}

export default App
