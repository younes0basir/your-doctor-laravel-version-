import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DoctorSidebar from './DoctorSidebar';
import { searchMedicines } from '../../requests/medicineApi';
import { 
  FiSearch, 
  FiPlus, 
  FiTrash2, 
  FiFileText, 
  FiUser, 
  FiActivity,
  FiLoader,
  FiCheck
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../requests';

const PrescriptionModule = () => {
  const { user } = useAuth();
  const doctor = user?.doctorProfile;
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [patients, setPatients] = useState([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get('/patients');
        setPatients(res.data || []);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length > 2) {
        setLoading(true);
        const results = await searchMedicines(searchTerm);
        setSearchResults(results);
        setLoading(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const addMedicine = (med) => {
    if (selectedMedicines.find(m => m.id === med.id)) {
      toast.warning('This medication is already in the list');
      return;
    }
    setSelectedMedicines([...selectedMedicines, { ...med, posology: '', duration: '' }]);
    setSearchTerm('');
    setSearchResults([]);
  };

  const removeMedicine = (id) => {
    setSelectedMedicines(selectedMedicines.filter(m => m.id !== id));
  };

  const updateMedicine = (id, field, value) => {
    setSelectedMedicines(selectedMedicines.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const handleSubmit = async () => {
    if (!patientId || selectedMedicines.length === 0) {
      toast.error('Please select a patient and at least one medication');
      return;
    }
    
    // In a real app, you'd send this to your backend to save and generate PDF
    toast.success('Prescription generated successfully!');
    console.log({
      patient_id: patientId,
      doctor_id: doctor?.id,
      medications: selectedMedicines,
      notes: notes
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorSidebar activeTab="prescriptions" />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Prescription</h1>
              <p className="text-gray-600">Search medication and build a medical order</p>
            </div>
            <button
              onClick={handleSubmit}
              className="flex items-center px-6 py-3 bg-[#ff5a5f] text-white rounded-xl hover:bg-[#ff4248] transition shadow-lg font-bold"
            >
              <FiFileText className="mr-2" /> Generate PDF
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Patient & Search */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Patient</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-3 text-gray-400" />
                  <select
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff5a5f] focus:border-transparent outline-none appearance-none"
                  >
                    <option value="">Select a patient...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-2">Search Medication</label>
                <div className="relative mb-4">
                  <FiSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search name or ingredient..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff5a5f] focus:border-transparent outline-none"
                  />
                  {loading && <FiLoader className="absolute right-3 top-3 animate-spin text-[#ff5a5f]" />}
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchResults.map(med => (
                    <div 
                      key={med.id}
                      onClick={() => addMedicine(med)}
                      className="p-3 border border-gray-50 rounded-xl hover:bg-gray-50 cursor-pointer transition flex justify-between items-center group"
                    >
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{med.nom}</p>
                        <p className="text-xs text-gray-500">{med.forme} - {med.dosage1} {med.unite_dosage1}</p>
                      </div>
                      <FiPlus className="text-gray-400 group-hover:text-[#ff5a5f]" />
                    </div>
                  ))}
                  {searchTerm.length > 2 && searchResults.length === 0 && !loading && (
                    <p className="text-center text-gray-400 text-sm py-4">No medicines found</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Prescription List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-800 flex items-center">
                    <FiActivity className="mr-2 text-[#ff5a5f]" /> Medications Order
                  </h3>
                  <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                    {selectedMedicines.length} items
                  </span>
                </div>

                <div className="flex-1 p-6 space-y-4">
                  {selectedMedicines.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                      <div className="bg-gray-50 p-6 rounded-full mb-4">
                        <FiFileText size={48} />
                      </div>
                      <p>Start by adding medications from the search list</p>
                    </div>
                  ) : (
                    selectedMedicines.map(med => (
                      <div key={med.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group animate-in fade-in slide-in-from-right-4">
                        <button 
                          onClick={() => removeMedicine(med.id)}
                          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
                        >
                          <FiTrash2 />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="font-black text-[#ff5a5f] uppercase tracking-tight">{med.nom}</p>
                            <p className="text-xs text-gray-500 mt-1">{med.dci1}</p>
                            <div className="mt-2 flex gap-2">
                              <span className="px-2 py-0.5 bg-white rounded-md text-[10px] font-bold text-gray-600 border border-gray-200 uppercase">{med.forme}</span>
                              <span className="px-2 py-0.5 bg-white rounded-md text-[10px] font-bold text-gray-600 border border-gray-200">{med.dosage1} {med.unite_dosage1}</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Posology / Instructions</label>
                              <input 
                                type="text"
                                placeholder="Ex: 1 tablet 3 times a day"
                                value={med.posology}
                                onChange={(e) => updateMedicine(med.id, 'posology', e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[#ff5a5f]"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Duration</label>
                              <input 
                                type="text"
                                placeholder="Ex: 7 days"
                                value={med.duration}
                                onChange={(e) => updateMedicine(med.id, 'duration', e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[#ff5a5f]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    rows="3"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter any additional advice or instructions for the patient..."
                    className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#ff5a5f] focus:border-transparent transition"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionModule;
