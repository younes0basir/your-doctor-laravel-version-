import React, { useState } from 'react';
import api from '../../requests';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaEnvelope, FaSpinner } from 'react-icons/fa';

const AssistantRegister = ({ onRegistered }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    password_confirmation: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const doctorData = JSON.parse(localStorage.getItem('doctor'));
      // The 'doctor' object in localStorage might be the profile or the user
      // We need the User ID for the assistant's doctor_id column
      const doctorId = doctorData?.user_id || doctorData?.id;

      await api.post('/register', {
        ...form,
        first_name: form.firstName,
        last_name: form.lastName,
        password_confirmation: form.password_confirmation,
        role: 'assistant',
        doctor_id: doctorId
      });
      toast.success('Assistant registered successfully!');
      if (onRegistered) {
        onRegistered();
      } else {
        navigate('/doctor/assistants');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff5f5] to-[#ffebeb] py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-[#ff5a5f]/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#ff5a5f]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUser className="text-2xl text-[#ff5a5f]" />
          </div>
          <h2 className="text-2xl font-bold text-[#ff5a5f]">Assistant Registration</h2>
          <p className="mt-2 text-gray-600">Register a new medical assistant</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  required
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none transition"
                  placeholder="John"
                />
                <FaUser className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  required
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none transition"
                  placeholder="Doe"
                />
                <FaUser className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                id="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none transition"
                placeholder="email@example.com"
              />
              <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <div className="relative">
              <input
                type="password"
                name="password"
                id="password"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none transition"
                placeholder="At least 8 characters"
              />
              <FaLock className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
            <div className="relative">
              <input
                type="password"
                name="password_confirmation"
                id="password_confirmation"
                required
                value={form.password_confirmation}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none transition"
                placeholder="Confirm your password"
              />
              <FaLock className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 bg-[#ff5a5f] hover:bg-[#e04a50] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-colors"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Registering...
                </>
              ) : (
                'Register Assistant'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssistantRegister;
