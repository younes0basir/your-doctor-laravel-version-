import React, { useEffect, useState } from 'react';
import api from '../../requests';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiSearch,
  FiPlus,
  FiUserPlus,
  FiX,
  FiLoader,
  FiPhone,
  FiMail,
  FiCalendar,
  FiUser,
  FiFileText,
  FiAlertCircle
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import AssistantSidebar from './AssistantSidebar';

import { useAuth } from '../../context/AuthContext';

const AssistantPatients = () => {
  const { user, token } = useAuth();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // New Patient Modal State
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [cinSearch, setCinSearch] = useState('');
  const [cinSearching, setCinSearching] = useState(false);
  const [cinResult, setCinResult] = useState(null);
  const [newPatientForm, setNewPatientForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    age: '',
    cin: '',
    gender: 'Male'
  });
  const [newPatientLoading, setNewPatientLoading] = useState(false);
  const [newPatientError, setNewPatientError] = useState('');

  const fetchPatients = async () => {
    if (!token || user?.role !== 'assistant') {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const doctorId = user.doctorProfile?.id;
      if (!doctorId) throw new Error('No doctor assigned or doctor profile not loaded');
      
      const res = await api.get(`/patients/doctor/${doctorId}`);
      
      setPatients(res.data || []);
      setFilteredPatients(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch patients');
      toast.error(err.message || 'Failed to fetch patients');
      setPatients([]);
      setFilteredPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = patients.filter(patient => {
        const firstName = patient.firstName || patient.first_name || '';
        const lastName = patient.lastName || patient.last_name || '';
        const email = patient.email || '';
        const phone = patient.phoneNumber || patient.phone || '';
        
        return (
          firstName.toLowerCase().includes(lowercasedSearch) ||
          lastName.toLowerCase().includes(lowercasedSearch) ||
          email.toLowerCase().includes(lowercasedSearch) ||
          phone.includes(searchTerm)
        );
      });
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  useEffect(() => {
    fetchPatients();
  }, [user, token]);

  const handleCinSearch = async (e) => {
    e.preventDefault();
    if (!cinSearch.trim()) return;
    
    setCinSearching(true);
    setCinResult(null);
    setNewPatientError('');
    try {
      const res = await api.get(`/admin/patients?search=${cinSearch}`);
      const data = res.data?.data || res.data;
      // Search for exact CIN match in the results
      const exactMatch = Array.isArray(data) ? data.find(p => p.cin === cinSearch) : null;
      
      if (exactMatch) {
        setCinResult(exactMatch);
        toast.info('Patient already exists in the system.');
      } else {
        setNewPatientError('No patient found with this CIN. You can create a new record.');
      }
    } catch (err) {
      setNewPatientError('Error searching for patient.');
    } finally {
      setCinSearching(false);
    }
  };

  const handleCreateNewPatient = async (e) => {
    e.preventDefault();
    setNewPatientLoading(true);
    setNewPatientError('');
    try {
      const payload = {
        ...newPatientForm,
        doctor_id: user.doctor_id // Assign to current doctor
      };
      
        await api.post('/admin/patients', payload);
      toast.success('Patient created successfully!');
      setShowNewPatient(false);
      fetchPatients(); // Refresh the list
    } catch (err) {
      setNewPatientError(err.response?.data?.message || 'Failed to create patient');
    } finally {
      setNewPatientLoading(false);
    }
  };

  const handleNewPatientFormChange = (e) => {
    const { name, value } = e.target;
    setNewPatientForm(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#ff5a5f] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AssistantSidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Patients</h1>
              <div className="flex items-center mt-2 text-gray-500">
                <FiUser className="mr-2" />
                <span>{filteredPatients.length} {filteredPatients.length === 1 ? 'patient' : 'patients'} under your doctor's care</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0 w-full md:w-auto flex flex-col md:flex-row gap-3">
              <button
                onClick={() => setShowNewPatient(true)}
                className="bg-[#ff5a5f] hover:bg-[#e04a50] text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors shadow-sm"
              >
                <FiPlus className="mr-2" /> Add New Patient
              </button>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="focus:ring-[#ff5a5f] focus:border-[#ff5a5f] block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Patients List */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              {error ? (
                <div className="text-center p-12">
                  <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading patients</h3>
                  <p className="mt-1 text-sm text-gray-500">{error}</p>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center p-12">
                  <FiUser className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {searchTerm ? 'No matching patients found' : 'No patients found'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Try a different search term' : 'Your doctor doesn\'t have any patients assigned yet'}
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Age
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Visit
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#ff5a5f] bg-opacity-20 flex items-center justify-center">
                              <FiUser className="h-5 w-5 text-[#ff5a5f]" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {patient.firstName || patient.first_name} {patient.lastName || patient.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {patient.gender || 'Not specified'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <FiMail className="mr-2 text-gray-400" />
                            {patient.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <FiPhone className="mr-2 text-gray-400" />
                            {patient.phoneNumber || patient.phone || 'Not provided'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {patient.age ? `${patient.age} years` : 'Not specified'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 flex items-center">
                            <FiCalendar className="mr-2 text-gray-400" />
                            {patient.lastVisitDate ? 
                              new Date(patient.lastVisitDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 'Never visited'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => navigate(`/assistant/medical-records/${patient.id}`)}
                            className="bg-[#ff5a5f] bg-opacity-10 hover:bg-opacity-20 text-[#ff5a5f] px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
                          >
                            <FiFileText className="mr-2" />
                            View Records
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Patient Modal */}
      <AnimatePresence>
        {showNewPatient && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FiUserPlus className="mr-2 text-[#ff5a5f]" /> Add New Patient
                </h2>
                <button 
                  onClick={() => setShowNewPatient(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="h-6 w-6 text-gray-400" />
                </button>
              </div>

              {/* CIN Search first */}
              <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Check if patient already exists (Search by CIN)</label>
                <form onSubmit={handleCinSearch} className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] outline-none"
                    placeholder="Enter patient CIN..."
                    value={cinSearch}
                    onChange={(e) => setCinSearch(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={cinSearching}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors disabled:bg-gray-400"
                  >
                    {cinSearching ? <FiLoader className="animate-spin" /> : <FiSearch />}
                  </button>
                </form>
                {cinResult && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-800 text-sm flex items-center">
                    <FiUser className="mr-2" />
                    <span>Found: {cinResult.first_name} {cinResult.last_name} ({cinResult.email})</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleCreateNewPatient} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] outline-none"
                      value={newPatientForm.first_name}
                      onChange={handleNewPatientFormChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] outline-none"
                      value={newPatientForm.last_name}
                      onChange={handleNewPatientFormChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] outline-none"
                    value={newPatientForm.email}
                    onChange={handleNewPatientFormChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] outline-none"
                      value={newPatientForm.phone}
                      onChange={handleNewPatientFormChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input
                      type="number"
                      name="age"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] outline-none"
                      value={newPatientForm.age}
                      onChange={handleNewPatientFormChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CIN</label>
                    <input
                      type="text"
                      name="cin"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] outline-none"
                      value={newPatientForm.cin}
                      onChange={handleNewPatientFormChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      name="gender"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] outline-none bg-white"
                      value={newPatientForm.gender}
                      onChange={handleNewPatientFormChange}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                {newPatientError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-center">
                    <FiAlertCircle className="mr-2" /> {newPatientError}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowNewPatient(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={newPatientLoading}
                    className="px-6 py-2 bg-[#ff5a5f] text-white rounded-lg hover:bg-[#e04a50] transition-colors disabled:bg-gray-400 flex items-center"
                  >
                    {newPatientLoading && <FiLoader className="animate-spin mr-2" />}
                    Create Patient
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssistantPatients;
