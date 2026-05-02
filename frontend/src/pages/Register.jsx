import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';
import api from '../requests';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (!formData.email || !formData.password || !formData.firstName) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/register', {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName ? formData.lastName.trim() : '',
        email: formData.email.trim(),
        password: formData.password,
        role: 'patient'
      });

      toast.success('Inscription réussie! Veuillez vous connecter.');
      navigate('/login');
    } catch (err) {
      console.error('Error registering user:', err);
      
      if (err.response?.data?.message?.includes('email')) {
        toast.error('Cet email est déjà enregistré. Veuillez vous connecter.');
      } else {
        toast.error(err.response?.data?.message || 'L\'inscription a échoué. Veuillez réessayer.');
      }
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
          <h2 className="text-3xl font-bold text-[#ff5a5f]">Créer un compte</h2>
          <p className="mt-2 text-gray-600">Rejoignez-nous pour prendre rendez-vous facilement</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                Prénom *
              </label>
              <div className="relative">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none transition"
                  required
                  placeholder="Jean"
                />
              </div>
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <div className="relative">
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none transition"
                  placeholder="Dupont"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none transition"
                required
                placeholder="email@example.com"
              />
              <FaEnvelope className="absolute right-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] outline-none transition"
                required
                minLength="6"
                placeholder="Au moins 6 caractères"
              />
              <FaLock className="absolute right-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-[#ff5a5f] hover:bg-[#e04a50] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff5a5f] transition-colors"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center">
                Inscription <FaArrowRight className="ml-2" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Vous avez déjà un compte ?{' '}
            <NavLink to="/login" className="font-medium text-[#ff5a5f] hover:underline">
              Connectez-vous ici
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
