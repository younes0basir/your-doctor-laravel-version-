import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../requests';
import { toast } from 'react-toastify';
import { 
  FiClock, 
  FiUser, 
  FiCheckCircle, 
  FiPlayCircle,
  FiLoader,
  FiAlertCircle
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import DoctorSidebar from './DoctorSidebar';

const DoctorOfficeQueue = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for the wait timers
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchQueue = async () => {
    const doctorData = JSON.parse(localStorage.getItem('doctor'));

    if (!doctorData) {
      toast.error('Session expirée');
      navigate('/login');
      return;
    }

    try {
      const res = await api.get(`/appointments/queue/${doctorData.id}`);
      setQueue(res.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger la file d\'attente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Poll every 15 seconds to automatically fetch new arrivals
    const interval = setInterval(() => {
      fetchQueue();
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

  const handleQueueAction = async (appointmentId, newStatus) => {
    setActionLoading(appointmentId);
    try {
      await api.patch(`/appointments/${appointmentId}/queue`, { queue_status: newStatus });
      toast.success(newStatus === 'in_consultation' ? 'Consultation démarrée' : 'Consultation terminée');
      fetchQueue(); // refresh immediately
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setActionLoading(null);
    }
  };

  const getWaitTime = (arrivalTime) => {
    if (!arrivalTime) return 'Inconnu';
    const diff = Math.floor((currentTime - new Date(arrivalTime)) / 60000);
    return diff < 1 ? 'Vient d\'arriver' : `${diff} min`;
  };

  const inConsultation = queue.filter(q => q.queue_status === 'in_consultation');
  const waiting = queue.filter(q => q.queue_status === 'waiting');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorSidebar activeTab="office-queue" />
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">File d'attente</h1>
              <p className="text-gray-600 mt-1">Vue en direct de votre salle d'attente</p>
            </div>
            <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 shadow-sm border border-red-100 flex items-center">
              <FiAlertCircle className="mr-2" />
              {error}
            </div>
          )}

          {loading && queue.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <FiLoader className="animate-spin h-8 w-8 text-[#ff5a5f]" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Currently In Consultation */}
              <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
                <div className="bg-green-50 px-6 py-4 border-b border-green-100 flex items-center">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
                  <h2 className="text-lg font-semibold text-green-900">En Consultation</h2>
                </div>
                
                <div className="p-6">
                  {inConsultation.length > 0 ? (
                    inConsultation.map(appt => (
                      <div key={appt.id} className="flex flex-col sm:flex-row justify-between items-center bg-green-50 p-4 rounded-lg border border-green-100">
                        <div className="flex items-center mb-4 sm:mb-0">
                          <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm text-green-600">
                            <FiUser className="h-6 w-6" />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-bold text-gray-900">
                              {appt.patient?.first_name || 'Inconnu'} {appt.patient?.last_name || ''}
                            </h3>
                            <div className="text-sm text-green-700 flex items-center mt-1">
                              <FiClock className="mr-1" />
                              Démarré à {appt.consultation_start_time ? new Date(appt.consultation_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Inconnu'}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleQueueAction(appt.id, 'finished')}
                          disabled={actionLoading === appt.id}
                          className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm font-medium flex items-center justify-center"
                        >
                          {actionLoading === appt.id ? <FiLoader className="animate-spin mr-2" /> : <FiCheckCircle className="mr-2" />}
                          Terminer la consultation
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500 italic">
                      Aucun patient en consultation actuellement.
                    </div>
                  )}
                </div>
              </div>

              {/* Waiting Room */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Salle d'attente</h2>
                  <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs font-bold">
                    {waiting.length} en attente
                  </span>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {waiting.length > 0 ? (
                    <AnimatePresence>
                      {waiting.map((appt, index) => (
                        <motion.div 
                          key={appt.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-6 hover:bg-gray-50 transition flex flex-col sm:flex-row justify-between items-center"
                        >
                          <div className="flex items-center w-full sm:w-auto mb-4 sm:mb-0">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                              #{index + 1}
                            </div>
                            <div className="ml-4">
                              <h3 className="text-md font-bold text-gray-900">
                                {appt.patient?.first_name || 'Inconnu'} {appt.patient?.last_name || ''}
                              </h3>
                              <div className="flex items-center mt-1 space-x-4">
                                <span className="text-sm text-gray-500 flex items-center">
                                  <FiClock className="mr-1" />
                                  Arrivé: {appt.arrival_time ? new Date(appt.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Inconnu'}
                                </span>
                                <span className={`text-sm font-medium ${parseInt(getWaitTime(appt.arrival_time)) > 30 ? 'text-red-500' : 'text-orange-500'}`}>
                                  Attente: {getWaitTime(appt.arrival_time)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleQueueAction(appt.id, 'in_consultation')}
                            disabled={actionLoading === appt.id || inConsultation.length > 0}
                            className={`w-full sm:w-auto px-5 py-2 rounded-lg transition shadow-sm font-medium flex items-center justify-center ${
                              inConsultation.length > 0 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-[#ff5a5f] text-white hover:bg-[#ff4248]'
                            }`}
                            title={inConsultation.length > 0 ? "Terminez la consultation actuelle d'abord" : "Appeler le patient"}
                          >
                            {actionLoading === appt.id ? <FiLoader className="animate-spin mr-2" /> : <FiPlayCircle className="mr-2" />}
                            Appeler le patient
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  ) : (
                    <div className="text-center py-12 px-4">
                      <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiUser className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">La salle d'attente est vide</h3>
                      <p className="text-gray-500">Aucun patient n'attend pour le moment.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorOfficeQueue;
