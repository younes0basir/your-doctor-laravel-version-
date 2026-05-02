import React, { useEffect, useState } from 'react';
import api from '../../requests';
import { toast } from 'react-toastify';
import AssistantSidebar from './AssistantSidebar';
import {
  FiUser,
  FiClock,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
  FiSearch,
  FiCheckCircle,
  FiLogOut,
  FiActivity,
  FiPlusCircle,
  FiUserPlus,
  FiCalendar
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AssistantManageQueue = () => {
  const [appointments, setAppointments] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorId, setDoctorId] = useState(null);
  const [doctorName, setDoctorName] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      const profileRes = await api.get('/user');
      const user = profileRes.data?.user || profileRes.data;
      const docId = user?.doctor_id;
      setDoctorId(docId);

      if (!docId) {
        setError('No doctor assigned to your account');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Get doctor name
      const docRes = await api.get(`/doctors/by-user/${docId}`);
      const doctorData = docRes.data?.doctor || docRes.data;
      const docUser = doctorData?.user || doctorData;
      
      if (docUser?.first_name) {
        setDoctorName(`Dr. ${docUser.first_name} ${docUser.last_name}`);
      } else {
        setDoctorName(`Dr. ${doctorData.firstName || ''} ${doctorData.lastName || ''}`);
      }

      // Get today's appointments (to check in)
      const apptsRes = await api.get(`/appointments/doctor/${docId}`);
      // Filter for today's confirmed appointments that are not yet in queue
      const today = new Date().toISOString().split('T')[0];
      const todayAppts = (apptsRes.data || []).filter(appt => {
        const apptDate = appt.appointment_date.split(' ')[0];
        return apptDate === today && appt.status === 'confirmed' && !appt.queue_status;
      });
      setAppointments(todayAppts);

      // Get current queue
      const queueRes = await api.get(`/appointments/queue/${docId}`);
      setQueue(queueRes.data || []);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load waiting room data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = async (appointmentId) => {
    setActionLoading(appointmentId);
    try {
      await api.patch(`/appointments/${appointmentId}/queue`, { queue_status: 'waiting' });
      toast.success('Patient checked in successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to check in patient');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveFromQueue = async (appointmentId) => {
    if (!window.confirm('Remove this patient from the waiting room?')) return;
    
    setActionLoading(appointmentId);
    try {
      await api.patch(`/appointments/${appointmentId}/queue`, { queue_status: null });
      toast.success('Patient removed from queue');
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const getWaitTime = (arrivalTime) => {
    if (!arrivalTime) return 'Just arrived';
    const diff = Math.floor((currentTime - new Date(arrivalTime)) / 60000);
    return diff < 1 ? 'Just arrived' : `${diff} min`;
  };

  const filteredAppointments = appointments.filter(appt => {
    const name = `${appt.patient?.first_name} ${appt.patient?.last_name}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  if (loading && !refreshing) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AssistantSidebar activeTab="manage-queue" />
        <div className="flex-1 flex items-center justify-center">
          <FiLoader className="animate-spin h-10 w-10 text-[#ff5a5f]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AssistantSidebar activeTab="manage-queue" />
      <div className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Waiting Room Management</h1>
              <p className="text-gray-600 mt-1">Managing queue for <span className="font-semibold text-[#ff5a5f]">{doctorName}</span></p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <button
                onClick={fetchData}
                disabled={refreshing}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                title="Refresh"
              >
                <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''} text-gray-600`} />
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-100 flex items-center">
              <FiAlertCircle className="mr-3 h-5 w-5" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Today's Appointments - CHECK IN SECTION */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-200px)]">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center">
                    <FiPlusCircle className="mr-2 text-blue-500" /> Arrivals to Check-In
                  </h2>
                  <div className="mt-4 relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search appointments..."
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#ff5a5f] outline-none transition"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <AnimatePresence>
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map(appt => (
                        <motion.div
                          key={appt.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-blue-200 transition-all group"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 truncate">
                                {appt.patient?.first_name} {appt.patient?.last_name}
                              </h3>
                              <p className="text-xs text-gray-500 flex items-center mt-1">
                                <FiClock className="mr-1" /> {new Date(appt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <button
                              onClick={() => handleCheckIn(appt.id)}
                              disabled={actionLoading === appt.id}
                              className="ml-2 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                              title="Mark as Arrived"
                            >
                              {actionLoading === appt.id ? (
                                <FiLoader className="animate-spin h-5 w-5" />
                              ) : (
                                <FiUserPlus className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <FiCalendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No more arrivals expected</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Current Waiting Room & Consultation */}
            <div className="lg:col-span-2 space-y-8">
              {/* Currently In Consultation */}
              <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
                <div className="bg-green-50/50 px-6 py-4 border-b border-green-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-green-900 flex items-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-3"></div>
                    Currently In Consultation
                  </h2>
                </div>
                <div className="p-6">
                  {queue.filter(q => q.queue_status === 'in_consultation').length > 0 ? (
                    queue.filter(q => q.queue_status === 'in_consultation').map(appt => (
                      <div key={appt.id} className="flex items-center bg-green-50 p-4 rounded-xl border border-green-100">
                        <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm text-green-600 mr-4">
                          <FiUser className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">
                            {appt.patient?.first_name} {appt.patient?.last_name}
                          </h3>
                          <div className="text-sm text-green-700 flex items-center mt-1 font-medium">
                            Started at {appt.consultation_start_time ? new Date(appt.consultation_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-400 italic text-sm">
                      No patient in consultation
                    </div>
                  )}
                </div>
              </div>

              {/* Waiting Room List */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col min-h-[400px]">
                <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800">In Waiting Room</h2>
                  <span className="bg-[#ff5a5f]/10 text-[#ff5a5f] py-1 px-3 rounded-full text-xs font-bold">
                    {queue.filter(q => q.queue_status === 'waiting').length} patients
                  </span>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <AnimatePresence>
                      {queue.filter(q => q.queue_status === 'waiting').length > 0 ? (
                        queue.filter(q => q.queue_status === 'waiting').map((appt, index) => (
                          <motion.div
                            key={appt.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition-all"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-gray-400 font-bold text-sm shadow-sm">
                                #{index + 1}
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900">
                                  {appt.patient?.first_name} {appt.patient?.last_name}
                                </h3>
                                <div className="flex items-center mt-1 space-x-3">
                                  <span className="text-xs text-gray-500 flex items-center">
                                    <FiClock className="mr-1" /> Arrived: {appt.arrival_time ? new Date(appt.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                  </span>
                                  <span className={`text-xs font-bold ${parseInt(getWaitTime(appt.arrival_time)) > 30 ? 'text-red-500' : 'text-orange-500'}`}>
                                    Waiting: {getWaitTime(appt.arrival_time)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveFromQueue(appt.id)}
                              disabled={actionLoading === appt.id}
                              className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Cancel Check-In"
                            >
                              <FiLogOut className="h-5 w-5" />
                            </button>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiActivity className="h-8 w-8 text-gray-300" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">Waiting room is empty</h3>
                          <p className="text-sm text-gray-500">Check in patients on the left as they arrive.</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantManageQueue;
