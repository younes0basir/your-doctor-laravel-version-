import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../requests';
import { 
  FiFileText, 
  FiPlus, 
  FiClock, 
  FiUser, 
  FiActivity, 
  FiSearch,
  FiChevronRight,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiXCircle,
  FiLoader
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const MedicalRecords = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    diagnosis: '',
    treatment: '',
    notes: '',
    vitals: {
      weight: '',
      blood_pressure: '',
      temperature: '',
      heart_rate: ''
    }
  });

  useEffect(() => {
    if (patientId) {
      fetchPatientInfo();
      fetchRecords();
    }
  }, [patientId]);

  const fetchPatientInfo = async () => {
    try {
      const res = await api.get(`/users/${patientId}`);
      setPatientInfo(res.data);
    } catch (err) {
      console.error('Error fetching patient info:', err);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/medical-records/patient/${patientId}`);
      setRecords(res.data);
    } catch (err) {
      toast.error('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get current user (doctor) from the /user endpoint to be safe
      const profileRes = await api.get('/user');
      const doctorId = profileRes.data?.doctor_id || profileRes.data?.doctorProfile?.id;

      if (!doctorId) {
        toast.error('No doctor profile found for your account');
        return;
      }

      const payload = {
        ...formData,
        patient_id: patientId,
        doctor_id: doctorId
      };

      if (selectedRecord) {
        await api.put(`/medical-records/${selectedRecord.id}`, payload);
        toast.success('Record updated');
      } else {
        await api.post('/medical-records', payload);
        toast.success('Record added');
      }

      setShowForm(false);
      setSelectedRecord(null);
      resetForm();
      fetchRecords();
    } catch (err) {
      toast.error('Failed to save record');
    }
  };

  const resetForm = () => {
    setFormData({
      diagnosis: '',
      treatment: '',
      notes: '',
      vitals: {
        weight: '',
        blood_pressure: '',
        temperature: '',
        heart_rate: ''
      }
    });
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setFormData({
      diagnosis: record.diagnosis || '',
      treatment: record.treatment || '',
      notes: record.notes || '',
      vitals: record.vitals || {
        weight: '',
        blood_pressure: '',
        temperature: '',
        heart_rate: ''
      }
    });
    setShowForm(true);
  };

  const filteredRecords = records.filter(r => 
    (r.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.treatment?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-1 p-6 bg-gray-50 overflow-auto min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <FiFileText className="mr-3 text-blue-600" />
              Medical Records
            </h1>
            {patientInfo && (
              <p className="text-gray-600 mt-1">
                For: <span className="font-semibold text-blue-700">{patientInfo.first_name} {patientInfo.last_name}</span>
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-200 text-gray-600 bg-white rounded-lg hover:bg-gray-50 transition-all shadow-sm"
            >
              Back
            </button>
            <button
              onClick={() => { resetForm(); setSelectedRecord(null); setShowForm(true); }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              <FiPlus className="mr-2" /> Add Record
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by diagnosis or treatment..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FiLoader className="animate-spin h-10 w-10 text-blue-500" />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <FiActivity className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No medical records found</h3>
            <p className="text-gray-500">Start by adding a new consultation record for this patient.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <motion.div
                key={record.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className="bg-blue-50 p-2 rounded-lg mr-4">
                        <FiCalendar className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                          {new Date(record.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <h3 className="text-lg font-bold text-gray-800 mt-1">
                          {record.diagnosis || 'General Consultation'}
                        </h3>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleEdit(record)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <FiEdit2 />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Treatment / Prescription</h4>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-gray-700 whitespace-pre-wrap">{record.treatment || 'No treatment specified'}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Notes</h4>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-gray-700 whitespace-pre-wrap">{record.notes || 'No additional notes'}</p>
                      </div>
                    </div>
                  </div>

                  {record.vitals && (
                    <div className="mt-6 pt-4 border-t border-gray-50 flex flex-wrap gap-4">
                      {record.vitals.weight && (
                        <div className="bg-blue-50 px-3 py-1.5 rounded-lg flex items-center border border-blue-100">
                          <span className="text-xs text-blue-600 font-bold mr-2">WEIGHT:</span>
                          <span className="text-sm font-bold text-gray-700">{record.vitals.weight} kg</span>
                        </div>
                      )}
                      {record.vitals.blood_pressure && (
                        <div className="bg-green-50 px-3 py-1.5 rounded-lg flex items-center border border-green-100">
                          <span className="text-xs text-green-600 font-bold mr-2">BP:</span>
                          <span className="text-sm font-bold text-gray-700">{record.vitals.blood_pressure}</span>
                        </div>
                      )}
                      {record.vitals.temperature && (
                        <div className="bg-orange-50 px-3 py-1.5 rounded-lg flex items-center border border-orange-100">
                          <span className="text-xs text-orange-600 font-bold mr-2">TEMP:</span>
                          <span className="text-sm font-bold text-gray-700">{record.vitals.temperature} °C</span>
                        </div>
                      )}
                      {record.vitals.heart_rate && (
                        <div className="bg-red-50 px-3 py-1.5 rounded-lg flex items-center border border-red-100">
                          <span className="text-xs text-red-600 font-bold mr-2">PULSE:</span>
                          <span className="text-sm font-bold text-gray-700">{record.vitals.heart_rate} bpm</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-4 flex items-center text-xs text-gray-400">
                    <FiUser className="mr-1" />
                    Recorded by: {record.doctor?.user?.first_name ? `Dr. ${record.doctor.user.first_name} ${record.doctor.user.last_name}` : 'Unknown Doctor'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedRecord ? 'Edit Medical Record' : 'Add Medical Record'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <FiXCircle size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Diagnosis</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.diagnosis}
                      onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                      placeholder="e.g. Chronic Hypertension"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.vitals.weight}
                        onChange={(e) => setFormData({...formData, vitals: {...formData.vitals, weight: e.target.value}})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Blood Pressure</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.vitals.blood_pressure}
                        onChange={(e) => setFormData({...formData, vitals: {...formData.vitals, blood_pressure: e.target.value}})}
                        placeholder="120/80"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Temperature (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.vitals.temperature}
                        onChange={(e) => setFormData({...formData, vitals: {...formData.vitals, temperature: e.target.value}})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Heart Rate (bpm)</label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.vitals.heart_rate}
                        onChange={(e) => setFormData({...formData, vitals: {...formData.vitals, heart_rate: e.target.value}})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Treatment / Prescription</label>
                    <textarea
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      value={formData.treatment}
                      onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                      placeholder="Medications, dosage, and instructions..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Consultation Notes</label>
                    <textarea
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Detailed clinical notes..."
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all font-semibold"
                  >
                    {selectedRecord ? 'Update Record' : 'Create Record'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MedicalRecords;
