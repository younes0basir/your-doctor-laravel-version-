import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiMessageCircle, FiX, FiUser, FiActivity, FiArrowRight, FiLoader, FiGlobe, FiCalendar, FiCheck, FiLogIn } from 'react-icons/fi';
import api from '../../requests';
import ReactMarkdown from 'react-markdown';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MediAI = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'assistant', content: 'Hello! I am **MediAI**, your health assistant. Describe your symptoms, and I\'ll find you the right doctor. You can even say "Book with Dr. X tomorrow at 11 AM"! 🩺' }
    ]);
    const [loading, setLoading] = useState(false);
    const [lastDoctors, setLastDoctors] = useState([]); // Track last recommended doctors
    const [pendingBooking, setPendingBooking] = useState(null); // Booking awaiting confirmation
    const chatEndRef = useRef(null);
    const navigate = useNavigate();
    const { user, token } = useAuth();

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [chatHistory, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || loading) return;

        const userMsg = message.trim();
        const userMessage = { role: 'user', content: userMsg };
        setChatHistory(prev => [...prev, userMessage]);
        setMessage('');
        setLoading(true);

        // Check if this is a "yes" confirmation for pending booking
        if (pendingBooking && /^(yes|oui|نعم|iyeh|ah|yeah|ok|confirm|أكد)/i.test(userMsg)) {
            await handleConfirmBooking();
            setLoading(false);
            return;
        }
        // Check if user says "no" to cancel pending booking
        if (pendingBooking && /^(no|non|لا|la|cancel|annul)/i.test(userMsg)) {
            setPendingBooking(null);
            setChatHistory(prev => [...prev, { role: 'assistant', content: 'No problem! Booking cancelled. How else can I help you?' }]);
            setLoading(false);
            return;
        }

        try {
            const res = await api.post('/ai/chat', {
                message: userMsg,
                history: chatHistory.slice(-4),
                context_doctors: lastDoctors
            });

            const data = res.data;

            // Handle different action types
            if (data.action === 'login_required') {
                setChatHistory(prev => [...prev, { 
                    role: 'assistant', 
                    content: data.reply,
                    action: 'login_required'
                }]);
            } else if (data.action === 'need_info') {
                setChatHistory(prev => [...prev, { 
                    role: 'assistant', 
                    content: data.reply 
                }]);
            } else if (data.action === 'confirm_booking') {
                setPendingBooking(data.booking_data);
                setChatHistory(prev => [...prev, { 
                    role: 'assistant', 
                    content: data.reply,
                    action: 'confirm_booking',
                    bookingData: data.booking_data
                }]);
            } else {
                // Normal symptom analysis response
                const assistantMessage = { 
                    role: 'assistant', 
                    content: data.reply,
                    specialty: data.suggested_specialty,
                    doctors: data.recommended_doctors
                };
                // Track recommended doctors for booking context
                if (data.recommended_doctors && data.recommended_doctors.length > 0) {
                    setLastDoctors(data.recommended_doctors);
                }
                setChatHistory(prev => [...prev, assistantMessage]);
            }
        } catch (err) {
            console.error('AI Error:', err);
            setChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, I\'m having trouble connecting. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmBooking = async () => {
        if (!pendingBooking) return;

        try {
            const res = await api.post('/ai/book', {
                doctor_id: pendingBooking.doctor_id,
                date: pendingBooking.date,
                time: pendingBooking.time
            });

            if (res.data.success) {
                setChatHistory(prev => [...prev, { 
                    role: 'assistant', 
                    content: `🎉 **Booked!** ${res.data.message}\n\nYou can view your appointment in **My Appointments**.`,
                    action: 'booking_success'
                }]);
            }
        } catch (err) {
            console.error('Booking error:', err);
            setChatHistory(prev => [...prev, { 
                role: 'assistant', 
                content: 'Sorry, there was a problem creating the booking. Please try again or book manually.' 
            }]);
        } finally {
            setPendingBooking(null);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-colors ${
                    isOpen ? 'bg-white text-gray-800' : 'bg-[#ff5a5f] text-white'
                }`}
            >
                {isOpen ? <FiX size={28} /> : <FiMessageCircle size={28} />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                    </span>
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 100, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 100 }}
                        className="absolute bottom-20 right-0 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-gray-100"
                    >
                        {/* Header */}
                        <div className="p-5 bg-gradient-to-r from-[#ff5a5f] to-[#ff4248] text-white">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                    <FiActivity size={22} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base">MediAI Assistant</h3>
                                    <div className="flex items-center gap-2 text-white/80 text-[10px]">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                        {user ? `Logged in as ${user.first_name}` : 'Guest Mode'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50/50 custom-scrollbar">
                            {chatHistory.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                                        <div className={`p-3.5 rounded-2xl shadow-sm ${
                                            msg.role === 'user' 
                                                ? 'bg-[#ff5a5f] text-white rounded-tr-none' 
                                                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                                        }`}>
                                            <div className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-p:my-1 prose-strong:text-inherit prose-li:my-0">
                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                            </div>
                                        </div>

                                        {/* Login Required Action */}
                                        {msg.action === 'login_required' && (
                                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                                                <Link
                                                    to="/login"
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-colors"
                                                >
                                                    <FiLogIn /> Sign In to Book
                                                </Link>
                                            </motion.div>
                                        )}

                                        {/* Booking Confirmation Buttons */}
                                        {msg.action === 'confirm_booking' && pendingBooking && (
                                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setChatHistory(prev => [...prev, { role: 'user', content: 'Yes, confirm!' }]);
                                                        setLoading(true);
                                                        handleConfirmBooking().then(() => setLoading(false));
                                                    }}
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-500 text-white rounded-2xl text-xs font-bold hover:bg-green-600 transition-colors"
                                                >
                                                    <FiCheck /> Confirm
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setPendingBooking(null);
                                                        setChatHistory(prev => [...prev, 
                                                            { role: 'user', content: 'No, cancel.' },
                                                            { role: 'assistant', content: 'No problem! How else can I help?' }
                                                        ]);
                                                    }}
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold hover:bg-gray-300 transition-colors"
                                                >
                                                    <FiX /> Cancel
                                                </button>
                                            </motion.div>
                                        )}

                                        {/* Booking Success */}
                                        {msg.action === 'booking_success' && (
                                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                                                <Link
                                                    to="/my-appointments"
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white rounded-2xl text-sm font-bold hover:bg-green-600 transition-colors"
                                                >
                                                    <FiCalendar /> View My Appointments
                                                </Link>
                                            </motion.div>
                                        )}
                                        
                                        {/* Specialty & Doctor Recommendations */}
                                        {(msg.specialty || (msg.doctors && msg.doctors.length > 0)) && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="space-y-3"
                                            >
                                                {msg.specialty && (
                                                    <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl">
                                                        <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mb-1.5">Recommended Specialist</p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-bold text-sm text-indigo-900">{msg.specialty}</span>
                                                            <Link 
                                                                to={`/doctors?specialty=${msg.specialty}`}
                                                                onClick={() => setIsOpen(false)}
                                                                className="flex items-center gap-1 text-[10px] bg-indigo-600 text-white px-2.5 py-1 rounded-lg hover:bg-indigo-700 transition-colors"
                                                            >
                                                                View All <FiArrowRight />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                )}

                                                {msg.doctors && msg.doctors.length > 0 && (
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Available Doctors</p>
                                                        {msg.doctors.map(doc => (
                                                            <div key={doc.id} className="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
                                                                <img 
                                                                    src={doc.image || 'https://via.placeholder.com/150'} 
                                                                    alt={doc.name}
                                                                    className="w-10 h-10 rounded-full object-cover bg-gray-100 flex-shrink-0"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="text-xs font-bold text-gray-900 truncate">{doc.name}</h4>
                                                                    <p className="text-[10px] text-gray-500">{doc.experience} • {doc.fee} MAD</p>
                                                                </div>
                                                                <button 
                                                                    onClick={() => {
                                                                        setMessage(`Book with ${doc.name} `);
                                                                    }}
                                                                    className="flex-shrink-0 py-1.5 px-3 bg-[#ff5a5f]/10 text-[#ff5a5f] rounded-xl text-[10px] font-bold hover:bg-[#ff5a5f] hover:text-white transition-all"
                                                                >
                                                                    Book
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-100 p-3.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                                        <FiLoader className="animate-spin text-[#ff5a5f]" />
                                        <span className="text-xs text-gray-400 font-medium">MediAI is thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
                            <div className="relative flex items-center gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={pendingBooking ? 'Type "yes" to confirm...' : 'Describe symptoms or book a doctor...'}
                                    className="flex-1 bg-gray-100 border-none rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-[#ff5a5f] transition-all"
                                />
                                <button
                                    disabled={!message.trim() || loading}
                                    className="p-3.5 bg-[#ff5a5f] text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#e04a50] transition-colors shadow-lg shadow-red-100"
                                >
                                    <FiSend size={18} />
                                </button>
                            </div>
                            <div className="flex items-center gap-3 mt-3 text-[9px] text-gray-400 font-medium uppercase tracking-widest px-1">
                                <span className="flex items-center gap-1"><FiGlobe /> Multilingual</span>
                                <span className="flex items-center gap-1"><FiCalendar /> Smart Booking</span>
                                <span className="flex items-center gap-1"><FiUser /> {user ? 'Authenticated' : 'Guest'}</span>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default MediAI;
