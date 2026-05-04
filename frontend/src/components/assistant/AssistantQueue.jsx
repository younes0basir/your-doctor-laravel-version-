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
  FiActivity
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const AssistantQueue = () => {
  const { user, token } = useAuth();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchQueue = async () => {
    if (!user?.doctor_id || !token) return;

    try {
      setRefreshing(true);
      const res = await api.get(`/appointments/queue/${user.doctor_id}`);
      setQueue(res.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load queue data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.doctor_id) {
      fetchQueue();
      const interval = setInterval(fetchQueue, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const getWaitTime = (arrivalTime) => {
    if (!arrivalTime) return 'Just arrived';
    const diff = Math.floor((currentTime - new Date(arrivalTime)) / 60000);
    return diff < 1 ? 'Just arrived' : `${diff} min`;
  };

  const inConsultation = queue.filter(q => q.queue_status === 'in_consultation');
  const waiting = queue.filter(q => q.queue_status === 'waiting');

  if (loading && !refreshing) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AssistantSidebar activeTab="queue" />
        <div className="flex-1 flex items-center justify-center">
          <FiLoader className="animate-spin h-10 w-10 text-[#ff5a5f]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AssistantSidebar activeTab="queue" />
      <div className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Doctor's Queue</h1>
              <p className="text-gray-600 mt-1">Live status of the waiting room</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <button
                onClick={fetchQueue}
                disabled={refreshing}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''} text-gray-600`} />
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-100 flex items-center shadow-sm">
              <FiAlertCircle className="mr-3 h-5 w-5" />
              {error}
            </div>
          )}

          <div className="space-y-8">
            {/* Current Consultation */}
            <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
              <div className="bg-green-50/50 px-6 py-4 border-b border-green-100 flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-3"></div>
                <h2 className="text-lg font-bold text-green-900 uppercase tracking-wider text-sm">Now In Consultation</h2>
              </div>
              <div className="p-6">
                {inConsultation.length > 0 ? (
                  inConsultation.map(appt => (
                    <div key={appt.id} className="flex items-center bg-green-50 p-5 rounded-2xl border border-green-100">
                      <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center shadow-sm text-green-600 mr-5">
                        <FiUser className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-xl">
                          {appt.patient?.first_name} {appt.patient?.last_name}
                        </h3>
                        <div className="text-sm text-green-700 flex items-center mt-1 font-medium">
                          <FiClock className="mr-2" />
                          Started at {appt.consultation_start_time ? new Date(appt.consultation_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-400 italic font-medium">
                    The doctor is currently not in consultation
                  </div>
                )}
              </div>
            </div>

            {/* Waiting List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider text-sm">Waiting Room</h2>
                <span className="bg-[#ff5a5f]/10 text-[#ff5a5f] py-1 px-4 rounded-full text-xs font-bold shadow-sm border border-[#ff5a5f]/10">
                  {waiting.length} Patients Waiting
                </span>
              </div>
              
              <div className="divide-y divide-gray-100">
                <AnimatePresence>
                  {waiting.length > 0 ? (
                    waiting.map((appt, index) => (
                      <motion.div 
                        key={appt.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="p-6 hover:bg-gray-50/50 transition flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold shadow-sm mr-5">
                            #{index + 1}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {appt.patient?.first_name} {appt.patient?.last_name}
                            </h3>
                            <div className="flex items-center mt-1 space-x-5">
                              <span className="text-sm text-gray-500 flex items-center">
                                <FiClock className="mr-2" />
                                Arrived: {appt.arrival_time ? new Date(appt.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                              </span>
                              <span className={`text-sm font-bold ${parseInt(getWaitTime(appt.arrival_time)) > 30 ? 'text-red-500' : 'text-orange-500'}`}>
                                Waiting for: {getWaitTime(appt.arrival_time)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="hidden sm:block">
                          <div className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500 font-medium">
                            Status: Waiting
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-16 px-4">
                      <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                        <FiActivity className="h-10 w-10 text-gray-300" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">The waiting room is empty</h3>
                      <p className="text-gray-500 max-w-xs mx-auto">There are currently no patients waiting for consultation.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantQueue;
