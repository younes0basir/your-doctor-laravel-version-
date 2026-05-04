import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiClock, FiX, FiCheck, FiInfo, FiLoader } from 'react-icons/fi';
import api from '../../requests';
import { toast } from 'react-toastify';

const DoctorAvailabilityCalendar = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({
        is_available: false,
        reason: '',
        start_time: '',
        end_time: ''
    });

    useEffect(() => {
        fetchAvailabilities();
    }, []);

    const fetchAvailabilities = async () => {
        setLoading(true);
        try {
            const res = await api.get('/doctor/availabilities');
            const mappedEvents = res.data.map(item => ({
                id: item.id,
                title: item.is_available ? 'Available' : (item.reason || 'Blocked'),
                start: item.date,
                allDay: !item.start_time,
                backgroundColor: item.is_available ? '#10b981' : '#ef4444',
                borderColor: item.is_available ? '#10b981' : '#ef4444',
                extendedProps: { ...item }
            }));
            setEvents(mappedEvents);
        } catch (err) {
            console.error('Error fetching availabilities:', err);
            toast.error('Failed to load calendar data');
        } finally {
            setLoading(false);
        }
    };

    const handleDateClick = (arg) => {
        const existing = events.find(e => e.start === arg.dateStr);
        setSelectedDate(arg.dateStr);
        if (existing) {
            setFormData({
                is_available: existing.extendedProps.is_available,
                reason: existing.extendedProps.reason || '',
                start_time: existing.extendedProps.start_time || '',
                end_time: existing.extendedProps.end_time || ''
            });
        } else {
            setFormData({
                is_available: false,
                reason: '',
                start_time: '',
                end_time: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            await api.post('/doctor/availabilities', {
                date: selectedDate,
                ...formData
            });
            toast.success('Schedule updated');
            fetchAvailabilities();
            setShowModal(false);
        } catch (err) {
            console.error('Error updating availability:', err);
            toast.error('Failed to update schedule');
        } finally {
            setFormLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <FiLoader className="animate-spin h-10 w-10 text-[#ff5a5f] mb-4" />
                <p className="text-gray-500">Loading schedule...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Advanced Schedule</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage your holidays and personal leave by blocking dates.</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="text-xs font-medium text-gray-600">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="text-xs font-medium text-gray-600">Blocked</span>
                    </div>
                </div>
            </div>

            <div className="calendar-container">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek'
                    }}
                    events={events}
                    dateClick={handleDateClick}
                    height="auto"
                    themeSystem="standard"
                />
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800">
                                    Schedule for {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <FiX className="text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="flex gap-4 p-1 bg-gray-100 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_available: true })}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${
                                            formData.is_available ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'
                                        }`}
                                    >
                                        <FiCheck /> Available
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_available: false })}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${
                                            !formData.is_available ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'
                                        }`}
                                    >
                                        <FiX /> Blocked
                                    </button>
                                </div>

                                {!formData.is_available && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Block Type</label>
                                            <select 
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff5a5f] focus:border-transparent"
                                                value={formData.start_time ? 'partial' : 'full'}
                                                onChange={(e) => {
                                                    if (e.target.value === 'full') {
                                                        setFormData({ ...formData, start_time: '', end_time: '' });
                                                    } else {
                                                        setFormData({ ...formData, start_time: '09:00', end_time: '12:00' });
                                                    }
                                                }}
                                            >
                                                <option value="full">Full Day</option>
                                                <option value="partial">Specific Time Range</option>
                                            </select>
                                        </div>

                                        {formData.start_time && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                                                    <input
                                                        type="time"
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff5a5f] focus:border-transparent"
                                                        value={formData.start_time}
                                                        onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                                                    <input
                                                        type="time"
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff5a5f] focus:border-transparent"
                                                        value={formData.end_time}
                                                        onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff5a5f] focus:border-transparent"
                                                placeholder="e.g., Holiday, Personal Leave"
                                                value={formData.reason}
                                                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-2.5 text-gray-600 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="px-8 py-2.5 bg-[#ff5a5f] text-white font-medium rounded-xl hover:bg-[#e04a50] transition-colors shadow-lg shadow-red-200 flex items-center gap-2"
                                    >
                                        {formLoading ? <FiLoader className="animate-spin" /> : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .calendar-container .fc {
                    --fc-border-color: #f3f4f6;
                    --fc-daygrid-dot-event-dot-color: #ff5a5f;
                    --fc-button-bg-color: #ffffff;
                    --fc-button-border-color: #e5e7eb;
                    --fc-button-text-color: #374151;
                    --fc-button-active-bg-color: #ff5a5f;
                    --fc-button-active-border-color: #ff5a5f;
                    --fc-button-hover-bg-color: #f9fafb;
                    --fc-button-hover-border-color: #d1d5db;
                }
                .calendar-container .fc .fc-toolbar-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1f2937;
                }
                .calendar-container .fc .fc-button {
                    font-weight: 600;
                    text-transform: capitalize;
                    padding: 0.5rem 1rem;
                    border-radius: 0.75rem;
                }
                .calendar-container .fc .fc-button-primary:not(:disabled).fc-button-active {
                    background-color: #ff5a5f !important;
                    border-color: #ff5a5f !important;
                    color: white !important;
                }
                .calendar-container .fc-daygrid-day.fc-day-today {
                    background-color: #fff1f2 !important;
                }
                .calendar-container .fc-event {
                    border-radius: 6px;
                    padding: 2px 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default DoctorAvailabilityCalendar;
