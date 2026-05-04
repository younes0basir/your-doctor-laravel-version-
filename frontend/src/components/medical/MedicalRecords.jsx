import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
import DoctorSidebar from '../doctor/DoctorSidebar';
import AssistantSidebar from '../assistant/AssistantSidebar';
import { searchMedicines } from '../../requests/medicineApi';
import { FiPrinter } from 'react-icons/fi';

const MedicalRecords = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAssistant = location.pathname.startsWith('/assistant');
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);
  const [isEditingAge, setIsEditingAge] = useState(false);
  const [tempAge, setTempAge] = useState('');
  const [activeTab, setActiveTab] = useState('records');
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

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
    },
    prescriptions: []
  });

  const [medSearch, setMedSearch] = useState('');
  const [medResults, setMedResults] = useState([]);
  const [medLoading, setMedLoading] = useState(false);

  useEffect(() => {
    if (patientId) {
      fetchPatientInfo();
      fetchRecords();
      fetchAppointmentHistory();
    }
  }, [patientId]);

  const fetchAppointmentHistory = async () => {
    setAppointmentsLoading(true);
    try {
      const res = await api.get(`/appointments/patient/${patientId}/history`);
      setAppointments(res.data || []);
    } catch (err) {
      console.error('Error fetching appointment history:', err);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const fetchPatientInfo = async () => {
    try {
      const res = await api.get(`/users/${patientId}`);
      setPatientInfo(res.data);
      setTempAge(res.data.age || '');
    } catch (err) {
      console.error('Error fetching patient info:', err);
    }
  };

  const handleUpdateAge = async () => {
    try {
      await api.put(`/users/${patientId}`, { age: tempAge });
      setPatientInfo({ ...patientInfo, age: tempAge });
      setIsEditingAge(false);
      toast.success('Patient age updated');
    } catch (err) {
      toast.error('Failed to update age');
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (medSearch.length > 2) {
        setMedLoading(true);
        const results = await searchMedicines(medSearch);
        setMedResults(results);
        setMedLoading(false);
      } else {
        setMedResults([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [medSearch]);

  const addMedicine = (med) => {
    if (formData.prescriptions.find(m => m.id === med.id)) {
      toast.warning('Already added');
      return;
    }
    setFormData({
      ...formData,
      prescriptions: [...formData.prescriptions, { ...med, posology: '', duration: '' }]
    });
    setMedSearch('');
    setMedResults([]);
  };

  const removeMedicine = (id) => {
    setFormData({
      ...formData,
      prescriptions: formData.prescriptions.filter(m => m.id !== id)
    });
  };

  const updateMedicine = (id, field, value) => {
    setFormData({
      ...formData,
      prescriptions: formData.prescriptions.map(m => 
        m.id === id ? { ...m, [field]: value } : m
      )
    });
  };

  const handlePrint = (record) => {
    if (!record.prescriptions || record.prescriptions.length === 0) {
      toast.info('No medications to print in this record.');
      return;
    }
    const printWindow = window.open('', '_blank', 'width=800,height=1100');

    const doctorName = `Dr. ${record.doctor?.user?.first_name || ''} ${record.doctor?.user?.last_name || ''}`.trim();
    const specialty = record.doctor?.specialty || 'Médecin Généraliste';
    const doctorAddress = record.doctor?.user?.address || '';
    const cabinetLogo = record.doctor?.cabinet_logo || '';
    const recordDate = new Date(record.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    const patientName = `${patientInfo?.first_name || ''} ${patientInfo?.last_name || ''}`.trim();

    const medsHtml = record.prescriptions.map((med, idx) => `
      <tr>
        <td style="padding: 14px 12px; vertical-align: top; color: #1e3a5f; font-weight: 700; font-size: 13px; width: 30px;">${idx + 1}.</td>
        <td style="padding: 14px 12px; vertical-align: top;">
          <div style="font-weight: 700; font-size: 15px; color: #1e3a5f; letter-spacing: 0.3px;">${med.nom || ''}</div>
          <div style="font-size: 11px; color: #6b7b8d; margin-top: 2px;">${med.forme || ''} ${med.dosage1 ? '— ' + med.dosage1 : ''} ${med.unite_dosage1 || ''}</div>
        </td>
        <td style="padding: 14px 12px; vertical-align: top; font-size: 13px; color: #334155;">${med.posology || '—'}</td>
        <td style="padding: 14px 12px; vertical-align: top; font-size: 13px; color: #334155; white-space: nowrap;">${med.duration ? med.duration + ' mois' : '—'}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <title>Ordonnance — ${patientName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');

            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

            @page {
              size: A4;
              margin: 15mm 18mm;
            }

            body {
              font-family: 'Inter', -apple-system, sans-serif;
              color: #1e293b;
              background: #fff;
              padding: 0;
              margin: 0;
              font-size: 13px;
              line-height: 1.5;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .page {
              max-width: 210mm;
              min-height: 280mm;
              margin: 0 auto;
              padding: 36px 40px 30px;
              position: relative;
            }

            /* ── Header ── */
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding-bottom: 18px;
              border-bottom: 2.5px solid #1e3a5f;
              margin-bottom: 0;
            }

            .header-left {
              display: flex;
              align-items: center;
              gap: 16px;
            }

            .cabinet-logo {
              width: 64px;
              height: 64px;
              border-radius: 10px;
              object-fit: contain;
              border: 1px solid #e2e8f0;
              background: #f8fafc;
              padding: 4px;
            }

            .doctor-name {
              font-family: 'Playfair Display', Georgia, serif;
              font-size: 22px;
              font-weight: 700;
              color: #1e3a5f;
              line-height: 1.2;
            }

            .doctor-specialty {
              font-size: 12px;
              font-weight: 500;
              color: #3b82f6;
              text-transform: uppercase;
              letter-spacing: 1.2px;
              margin-top: 3px;
            }

            .doctor-address {
              font-size: 11px;
              color: #64748b;
              margin-top: 4px;
              max-width: 260px;
            }

            .header-right {
              text-align: right;
              font-size: 12px;
              color: #64748b;
            }

            .header-right .date-value {
              font-size: 13px;
              font-weight: 600;
              color: #1e3a5f;
            }

            /* ── Accent bar ── */
            .accent-bar {
              height: 3px;
              background: linear-gradient(90deg, #3b82f6, #1e3a5f 40%, #1e3a5f 60%, #3b82f6);
              border-radius: 2px;
            }

            /* ── Patient Info ── */
            .patient-section {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: #f0f5ff;
              border: 1px solid #dbeafe;
              border-radius: 8px;
              padding: 14px 20px;
              margin: 20px 0;
            }

            .patient-section .label {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #64748b;
              font-weight: 600;
            }

            .patient-section .value {
              font-size: 14px;
              font-weight: 600;
              color: #1e3a5f;
            }

            /* ── Title ── */
            .rx-title {
              text-align: center;
              margin: 28px 0 20px;
              position: relative;
            }

            .rx-title span {
              display: inline-block;
              font-family: 'Playfair Display', Georgia, serif;
              font-size: 16px;
              font-weight: 700;
              color: #1e3a5f;
              text-transform: uppercase;
              letter-spacing: 4px;
              padding: 0 24px;
              background: #fff;
              position: relative;
              z-index: 1;
            }

            .rx-title::before {
              content: '';
              position: absolute;
              left: 0;
              right: 0;
              top: 50%;
              height: 1px;
              background: #cbd5e1;
            }

            /* ── Medications Table ── */
            .meds-table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              margin-bottom: 30px;
            }

            .meds-table thead th {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #64748b;
              font-weight: 600;
              padding: 10px 12px;
              text-align: left;
              border-bottom: 1.5px solid #e2e8f0;
            }

            .meds-table tbody tr {
              border-bottom: 1px solid #f1f5f9;
            }

            .meds-table tbody tr:last-child {
              border-bottom: 1.5px solid #e2e8f0;
            }

            /* ── Notes ── */
            .notes-section {
              background: #fafbfc;
              border-left: 3px solid #3b82f6;
              padding: 14px 18px;
              border-radius: 0 6px 6px 0;
              margin-top: 24px;
            }

            .notes-label {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #64748b;
              font-weight: 600;
              margin-bottom: 6px;
            }

            .notes-text {
              font-size: 12px;
              color: #475569;
              line-height: 1.6;
              font-style: italic;
            }

            /* ── Signature ── */
            .signature-block {
              margin-top: 50px;
              display: flex;
              justify-content: flex-end;
            }

            .signature-inner {
              text-align: center;
              width: 220px;
            }

            .signature-label {
              font-size: 11px;
              color: #64748b;
              font-weight: 500;
              margin-bottom: 50px;
            }

            .signature-line {
              border-top: 1.5px solid #1e3a5f;
              padding-top: 6px;
              font-size: 12px;
              font-weight: 600;
              color: #1e3a5f;
            }

            /* ── Footer ── */
            .doc-footer {
              position: absolute;
              bottom: 20px;
              left: 40px;
              right: 40px;
              text-align: center;
              font-size: 9px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 10px;
              letter-spacing: 0.5px;
            }

            /* ── Print button ── */
            .print-btn {
              position: fixed;
              bottom: 24px;
              right: 24px;
              background: linear-gradient(135deg, #1e3a5f, #3b82f6);
              color: #fff;
              border: none;
              padding: 12px 28px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              box-shadow: 0 4px 14px rgba(30,58,95,0.3);
              transition: transform 0.15s;
            }

            .print-btn:hover { transform: translateY(-1px); }

            @media print {
              .no-print { display: none !important; }
              body { padding: 0; }
              .page { padding: 0; min-height: auto; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <!-- Header -->
            <div class="header">
              <div class="header-left">
                ${cabinetLogo ? `<img src="${cabinetLogo}" alt="Cabinet" class="cabinet-logo" />` : ''}
                <div>
                  <div class="doctor-name">${doctorName}</div>
                  <div class="doctor-specialty">${specialty}</div>
                  ${doctorAddress ? `<div class="doctor-address">${doctorAddress}</div>` : ''}
                </div>
              </div>
              <div class="header-right">
                <div style="margin-bottom: 4px;">Date</div>
                <div class="date-value">${recordDate}</div>
                <div style="margin-top: 8px; font-size: 11px;">Réf: ORD-${String(record.id).padStart(4, '0')}</div>
              </div>
            </div>

            <div class="accent-bar"></div>

            <!-- Patient -->
            <div class="patient-section">
              <div>
                <div class="label">Patient</div>
                <div class="value">${patientName}</div>
              </div>
              <div style="text-align: right;">
                <div class="label">Âge</div>
                <div class="value">${patientInfo?.age || '—'}</div>
              </div>
            </div>

            <!-- Title -->
            <div class="rx-title">
              <span>Ordonnance Médicale</span>
            </div>

            <!-- Medications -->
            <table class="meds-table">
              <thead>
                <tr>
                  <th style="width:30px">N°</th>
                  <th>Médicament</th>
                  <th>Posologie</th>
                  <th>Durée</th>
                </tr>
              </thead>
              <tbody>
                ${medsHtml}
              </tbody>
            </table>

            <!-- Notes -->
            ${record.notes ? `
              <div class="notes-section">
                <div class="notes-label">Observations du médecin</div>
                <div class="notes-text">${record.notes}</div>
              </div>
            ` : ''}

            <!-- Signature -->
            <div class="signature-block">
              <div class="signature-inner">
                <div class="signature-label">Cachet et Signature</div>
                <div class="signature-line">${doctorName}</div>
              </div>
            </div>

            <!-- Footer -->
            <div class="doc-footer">
              Ce document est une ordonnance médicale. Toute modification est interdite. &bull; Généré le ${new Date().toLocaleDateString('fr-FR')}
            </div>
          </div>

          <div class="no-print">
            <button class="print-btn" onclick="window.print()">🖨️ Imprimer l'ordonnance</button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
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
      // Get current user profile
      const profileRes = await api.get('/user');
      const user = profileRes.data?.user;
      let doctorId = null;

      if (user?.role === 'doctor') {
        // For doctors, the profile response now includes the doctor record
        doctorId = profileRes.data?.doctor?.id;
      } else if (user?.role === 'assistant') {
        // For assistants, user.doctor_id is the user_id of the doctor
        // We need the ID from the doctors table
        const docUser_id = user.doctor_id;
        const docRes = await api.get(`/doctors/by-user/${docUser_id}`);
        const docProfile = docRes.data?.doctor || docRes.data;
        doctorId = docProfile?.id;
      }

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
      },
      prescriptions: []
    });
    setMedSearch('');
    setMedResults([]);
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
      },
      prescriptions: record.prescriptions || []
    });
    setShowForm(true);
  };

  const filteredRecords = records.filter(r => 
    (r.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.treatment?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {isAssistant ? (
        <AssistantSidebar activeTab="patients" />
      ) : (
        <DoctorSidebar activeTab="patients" />
      )}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <FiFileText className="mr-3 text-blue-600" />
                Medical Records
              </h1>
              {patientInfo && (
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-gray-600">
                    For: <span className="font-semibold text-blue-700">{patientInfo.first_name} {patientInfo.last_name}</span>
                  </p>
                  <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    <span className="text-sm font-medium text-blue-600 mr-2">Age:</span>
                    {isEditingAge ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          className="w-16 px-1 py-0.5 border border-blue-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                          value={tempAge}
                          onChange={(e) => setTempAge(e.target.value)}
                          autoFocus
                        />
                        <button 
                          onClick={handleUpdateAge}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Save"
                        >
                          <FiPlus size={14} />
                        </button>
                        <button 
                          onClick={() => setIsEditingAge(false)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Cancel"
                        >
                          <FiXCircle size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-700">{patientInfo.age || '—'}</span>
                        <button 
                          onClick={() => setIsEditingAge(true)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit Age"
                        >
                          <FiEdit2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-200 text-gray-600 bg-white rounded-lg hover:bg-gray-50 transition-all shadow-sm"
              >
                Back
              </button>
              {activeTab === 'records' && (
                <button
                  onClick={() => { resetForm(); setSelectedRecord(null); setShowForm(true); }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                >
                  <FiPlus className="mr-2" /> Add Record
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('records')}
              className={`pb-3 px-6 text-sm font-semibold transition-colors relative ${
                activeTab === 'records' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Medical Records
              {activeTab === 'records' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`pb-3 px-6 text-sm font-semibold transition-colors relative ${
                activeTab === 'appointments' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Appointment History
              {activeTab === 'appointments' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          </div>

          {activeTab === 'records' ? (
          <>

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
                        {record.prescriptions && record.prescriptions.length > 0 && (
                          <button 
                            onClick={() => handlePrint(record)} 
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="Print Prescription"
                          >
                            <FiPrinter />
                          </button>
                        )}
                        <button onClick={() => handleEdit(record)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <FiEdit2 />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-1">
                        <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Prescription (Ordonnance)</h4>
                        {record.prescriptions && record.prescriptions.length > 0 ? (
                          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 space-y-2">
                            {record.prescriptions.map((med, idx) => (
                              <div key={idx} className="text-sm">
                                <p className="font-bold text-blue-800">{med.nom}</p>
                                <p className="text-xs text-gray-600">{med.posology} {med.duration && `| ${med.duration}`}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <p className="text-gray-500 italic text-sm">No structured prescription</p>
                          </div>
                        )}
                      </div>
                      <div className="md:col-span-1">
                        <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Treatment Plan</h4>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p className="text-gray-700 whitespace-pre-wrap text-sm">{record.treatment || 'No treatment specified'}</p>
                        </div>
                      </div>
                      <div className="md:col-span-1">
                        <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Notes</h4>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p className="text-gray-700 whitespace-pre-wrap text-sm">{record.notes || 'No additional notes'}</p>
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
          </>
          ) : (
            /* Appointment History Tab */
            <div className="space-y-4">
              {appointmentsLoading ? (
                <div className="flex justify-center items-center py-20">
                  <FiLoader className="animate-spin h-10 w-10 text-blue-500" />
                </div>
              ) : appointments.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                  <FiClock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No appointment history</h3>
                  <p className="text-gray-500">This patient hasn't had any appointments yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div className="flex items-center">
                        <div className={`p-3 rounded-full mr-4 ${
                          appointment.status === 'completed' ? 'bg-green-50 text-green-600' :
                          appointment.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          <FiCalendar size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">
                            {new Date(appointment.appointment_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                            <span className="mx-2 text-gray-300">|</span>
                            {appointment.appointment_time}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            With Dr. {appointment.doctor?.user?.first_name} {appointment.doctor?.user?.last_name}
                            {appointment.doctor?.specialty && ` (${appointment.doctor.specialty})`}
                          </p>
                          {appointment.reason && (
                            <p className="text-xs text-gray-400 mt-1 italic">Reason: {appointment.reason}</p>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
                        appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {appointment.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
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

                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <label className="block text-sm font-semibold text-blue-900 mb-3">Structured Prescription (Ordonnance)</label>
                      
                      {/* Search Input */}
                      <div className="relative mb-4">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search medicine (e.g. Paracetamol)..."
                          className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          value={medSearch}
                          onChange={(e) => setMedSearch(e.target.value)}
                        />
                        {medLoading && <FiLoader className="absolute right-3 top-3 animate-spin text-blue-500" />}
                      </div>

                      {/* Search Results */}
                      {medResults.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg mb-4 max-h-48 overflow-y-auto absolute z-10 w-[calc(100%-3rem)] max-w-xl">
                          {medResults.map(med => (
                            <div 
                              key={med.id}
                              onClick={() => addMedicine(med)}
                              className="p-3 border-b border-gray-50 hover:bg-blue-50 cursor-pointer flex justify-between items-center group"
                            >
                              <div>
                                <p className="font-bold text-gray-800 text-sm">{med.nom}</p>
                                <p className="text-xs text-gray-500">{med.forme} - {med.dosage1} {med.unite_dosage1}</p>
                              </div>
                              <FiPlus className="text-gray-400 group-hover:text-blue-500" />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Selected Medications */}
                      <div className="space-y-3 mt-4">
                        {formData.prescriptions.map(med => (
                          <div key={med.id} className="bg-white p-3 rounded-lg border border-blue-200 relative">
                            <button 
                              type="button"
                              onClick={() => removeMedicine(med.id)}
                              className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                            >
                              <FiTrash2 />
                            </button>
                            <p className="font-bold text-blue-700 text-sm mb-2">{med.nom} <span className="text-xs font-normal text-gray-500">({med.forme})</span></p>
                            <div className="grid grid-cols-2 gap-3">
                              <input 
                                type="text"
                                placeholder="Posology (e.g. 1 tab / 8h)"
                                value={med.posology || ''}
                                onChange={(e) => updateMedicine(med.id, 'posology', e.target.value)}
                                className="w-full text-sm border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                              />
                              <input 
                                type="text"
                                placeholder="Duration (e.g. 5 days)"
                                value={med.duration || ''}
                                onChange={(e) => updateMedicine(med.id, 'duration', e.target.value)}
                                className="w-full text-sm border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                              />
                            </div>
                          </div>
                        ))}
                        {formData.prescriptions.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-2 italic">No medications added yet.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">General Treatment Plan (Text)</label>
                      <textarea
                        rows="2"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        value={formData.treatment || ''}
                        onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                        placeholder="Medications, dosage, and instructions..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Consultation Notes</label>
                      <textarea
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        value={formData.notes || ''}
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
    </div>
  );
};

export default MedicalRecords;
