import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiMessageCircle, FiX, FiUser, FiActivity, FiArrowRight, FiLoader, FiGlobe } from 'react-icons/fi';
import api from '../../requests';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';

const MediAI = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'assistant', content: 'Hello! I am **MediAI**, your health assistant. Describe your symptoms to me, and I will help you find the right specialist. (English, Français, العربية, Darija)' }
    ]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [chatHistory, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || loading) return;

        const userMessage = { role: 'user', content: message };
        setChatHistory(prev => [...prev, userMessage]);
        setMessage('');
        setLoading(true);

        try {
            const res = await api.post('/ai/chat', {
                message: userMessage.content,
                history: chatHistory.slice(-4) // Send last 4 messages for context
            });

            const assistantMessage = { 
                role: 'assistant', 
                content: res.data.reply,
                specialty: res.data.suggested_specialty 
            };
            setChatHistory(prev => [...prev, assistantMessage]);
        } catch (err) {
            console.error('AI Error:', err);
            setChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting. Please try again later.' }]);
        } finally {
            setLoading(false);
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
                        <div className="p-6 bg-gradient-to-r from-[#ff5a5f] to-[#ff4248] text-white">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                    <FiActivity size={24} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">MediAI Assistant</h3>
                                    <div className="flex items-center gap-2 text-white/80 text-xs">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        Llama 3.1 Powered • Online
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 custom-scrollbar">
                            {chatHistory.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                                        <div className={`p-4 rounded-2xl shadow-sm ${
                                            msg.role === 'user' 
                                                ? 'bg-[#ff5a5f] text-white rounded-tr-none' 
                                                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                                        }`}>
                                            <div className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-strong:text-inherit">
                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                            </div>
                                        </div>
                                        
                                        {/* Specialty Recommendation Card */}
                                        {msg.specialty && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl"
                                            >
                                                <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-2">Recommended Specialist</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-indigo-900">{msg.specialty}</span>
                                                    <Link 
                                                        to={`/doctors?specialty=${msg.specialty}`}
                                                        onClick={() => setIsOpen(false)}
                                                        className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                                                    >
                                                        Find Doctors <FiArrowRight />
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                                        <FiLoader className="animate-spin text-[#ff5a5f]" />
                                        <span className="text-xs text-gray-400 font-medium">MediAI is thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-6 bg-white border-t border-gray-100">
                            <div className="relative flex items-center gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="e.g., I have a headache and sore throat..."
                                    className="flex-1 bg-gray-100 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#ff5a5f] transition-all"
                                />
                                <button
                                    disabled={!message.trim() || loading}
                                    className="p-4 bg-[#ff5a5f] text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#e04a50] transition-colors shadow-lg shadow-red-100"
                                >
                                    <FiSend size={20} />
                                </button>
                            </div>
                            <div className="flex items-center gap-4 mt-4 text-[10px] text-gray-400 font-medium uppercase tracking-widest px-1">
                                <span className="flex items-center gap-1"><FiGlobe /> Multilingual</span>
                                <span className="flex items-center gap-1"><FiUser /> Private</span>
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
