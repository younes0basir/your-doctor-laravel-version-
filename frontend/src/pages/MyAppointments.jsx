import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../requests';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiLoader,
  FiChevronRight,
  FiMapPin,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle
} from 'react-icons/fi';

const statusConfig = {
  completed: { label: 'Terminé', color: 'bg-green-100 text-green-700 border-green-200', icon: FiCheckCircle, dot: 'bg-green-500' },
  confirmed: { label: 'Confirmé', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: FiCheckCircle, dot: 'bg-blue-500' },
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: FiClock, dot: 'bg-amber-500' },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-700 border-red-200', icon: FiXCircle, dot: 'bg-red-500' },
};

const MyAppointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/my-appointments');
      setAppointments(res.data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all'
    ? appointments
    : appointments.filter(a => a.status === filter);

  const upcoming = appointments.filter(a =>
    ['pending', 'confirmed'].includes(a.status) &&
    new Date(a.appointment_date) >= new Date(new Date().toDateString())
  );

  const stats = {
    total: appointments.length,
    completed: appointments.filter(a => a.status === 'completed').length,
    upcoming: upcoming.length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mes Rendez-vous</h1>
          <p className="text-gray-500 mt-1">
            Bonjour {user?.first_name}, voici l'historique de vos consultations.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-green-100 p-4 shadow-sm">
            <p className="text-xs font-semibold text-green-500 uppercase tracking-wider">Terminés</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider">À venir</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{stats.upcoming}</p>
          </div>
          <div className="bg-white rounded-xl border border-red-100 p-4 shadow-sm">
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wider">Annulés</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{stats.cancelled}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'Tous' },
            { key: 'pending', label: 'En attente' },
            { key: 'confirmed', label: 'Confirmés' },
            { key: 'completed', label: 'Terminés' },
            { key: 'cancelled', label: 'Annulés' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === tab.key
                  ? 'bg-[#ff5a5f] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#ff5a5f] hover:text-[#ff5a5f]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FiLoader className="animate-spin h-10 w-10 text-[#ff5a5f] mb-4" />
            <p className="text-gray-500">Chargement de vos rendez-vous...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <FiCalendar className="mx-auto h-14 w-14 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">Aucun rendez-vous</h3>
            <p className="text-gray-500 mt-1">
              {filter === 'all'
                ? "Vous n'avez pas encore de rendez-vous."
                : "Aucun rendez-vous avec ce statut."
              }
            </p>
            <button
              onClick={() => navigate('/doctors')}
              className="mt-6 px-6 py-2.5 bg-[#ff5a5f] text-white rounded-lg hover:bg-[#e04a50] transition-colors font-medium shadow-md"
            >
              Prendre un rendez-vous
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((appointment, index) => {
              const config = statusConfig[appointment.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              const appointmentDate = new Date(appointment.appointment_date);
              const isToday = appointmentDate.toDateString() === new Date().toDateString();
              const isPast = appointmentDate < new Date(new Date().toDateString());

              return (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${
                    isToday ? 'border-[#ff5a5f] ring-1 ring-[#ff5a5f]/20' : 'border-gray-100'
                  }`}
                >
                  {isToday && (
                    <div className="bg-[#ff5a5f] text-white text-xs font-bold px-4 py-1 text-center uppercase tracking-wider">
                      Aujourd'hui
                    </div>
                  )}
                  <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* Left: Date + Doctor */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* Date block */}
                      <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center ${
                        isPast && appointment.status !== 'completed' ? 'bg-gray-100' : 'bg-[#ff5a5f]/10'
                      }`}>
                        <span className={`text-xs font-bold uppercase ${
                          isPast && appointment.status !== 'completed' ? 'text-gray-400' : 'text-[#ff5a5f]'
                        }`}>
                          {appointmentDate.toLocaleDateString('fr-FR', { month: 'short' })}
                        </span>
                        <span className={`text-xl font-bold ${
                          isPast && appointment.status !== 'completed' ? 'text-gray-500' : 'text-gray-900'
                        }`}>
                          {appointmentDate.getDate()}
                        </span>
                      </div>

                      {/* Details */}
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          Dr. {appointment.doctor?.user?.first_name} {appointment.doctor?.user?.last_name}
                        </p>
                        {appointment.doctor?.specialty && (
                          <p className="text-xs text-gray-500 mt-0.5">{appointment.doctor.specialty}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <FiClock size={12} />
                            {appointment.appointment_time}
                          </span>
                          <span className="flex items-center gap-1 capitalize">
                            <FiAlertCircle size={12} />
                            {appointment.type}
                          </span>
                        </div>
                        {appointment.reason && (
                          <p className="text-xs text-gray-400 mt-1.5 italic line-clamp-1">
                            « {appointment.reason} »
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Status */}
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${config.color}`}>
                        <StatusIcon size={14} />
                        {config.label}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
