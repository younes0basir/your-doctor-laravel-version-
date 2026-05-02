import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaSpinner } from 'react-icons/fa';
import api from '../requests';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Clear any existing session data
      localStorage.removeItem('adminToken');
      localStorage.removeItem('doctorToken');
      localStorage.removeItem('assistantToken');
      localStorage.removeItem('patientToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('admin');
      localStorage.removeItem('doctor');
      localStorage.removeItem('assistant');

      const response = await api.post('/login', {
        email: formData.email,
        password: formData.password,
      });
      
      const { token, user, doctor, admin, assistant } = response.data;
      
      // Store token and profile based on user role
      if (user.role === 'admin' || admin) {
        localStorage.setItem('adminToken', token);
        localStorage.setItem('admin', JSON.stringify(admin || user));
      } else if (user.role === 'doctor' || doctor) {
        localStorage.setItem('doctorToken', token);
        localStorage.setItem('doctor', JSON.stringify(doctor || user));
      } else if (user.role === 'assistant' || assistant) {
        localStorage.setItem('assistantToken', token);
        localStorage.setItem('assistant', JSON.stringify(assistant || user));
      } else {
        localStorage.setItem('patientToken', token);
      }
      
      // Also store common user data
      localStorage.setItem('userData', JSON.stringify(user));
      
      toast.success('Connexion réussie!');
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (user.role === 'assistant') {
        navigate('/assistant/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Échec de la connexion. Vérifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff5f5] to-[#ffebeb] py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-[#ff5a5f]/20">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 bg-[#ff5a5f]/10 rounded-full flex items-center justify-center mb-4">
            <FaUser className="text-3xl text-[#ff5a5f]" />
          </div>
          <h2 className="text-3xl font-bold text-[#ff5a5f]">Connexion</h2>
          <p className="mt-2 text-gray-600">Veuillez vous connecter à votre compte</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none transition"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none transition"
                minLength="6"
              />
              <FaLock className="absolute right-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-[#ff5a5f] focus:ring-[#ff5a5f] border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Se souvenir de moi
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-[#ff5a5f] hover:bg-[#e04a50] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff5a5f] transition-colors"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-500">
            Connectez-vous avec votre email et mot de passe
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
