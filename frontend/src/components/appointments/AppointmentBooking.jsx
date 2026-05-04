import React, { useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../requests';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { format, addDays, setHours, setMinutes, isBefore, isAfter, startOfToday } from 'date-fns';


const AppointmentBooking = ({ doctorId, consultationFee, onSuccess }) => {
  const navigate = useNavigate();
  const { token, userData, logout } = useContext(AppContext);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [appointmentData, setAppointmentData] = useState({
    type: 'physical'
  });
  const [blockedDates, setBlockedDates] = useState([]);
  const [bookedSlots] = useState([]); // Placeholder for actual booked slots

  useEffect(() => {
    const fetchBlockedDates = async () => {
      try {
        const res = await api.get(`/doctors/${doctorId}/availabilities`);
        setBlockedDates(res.data || []);
      } catch (err) {
        console.error('Error fetching blocked dates:', err);
      }
    };
    if (doctorId) fetchBlockedDates();
  }, [doctorId]);

  // Check if a time slot should be disabled
  const isTimeSlotDisabled = (time) => {
    const currentTime = new Date();
    const slotDate = new Date(time);
    
    // Check if date is in the past
    if (isBefore(slotDate, currentTime)) return true;

    // Check if doctor blocked this specific date/time
    const dateStr = format(slotDate, 'yyyy-MM-dd');
    const slotTimeStr = format(slotDate, 'HH:mm');
    
    const blockRecord = blockedDates.find(b => format(new Date(b.date), 'yyyy-MM-dd') === dateStr && !b.is_available);
    
    if (blockRecord) {
        // If it's a full day block (no start_time)
        if (!blockRecord.start_time) return true;
        
        // If it's a partial block, check if slotTime is between start and end
        const start = blockRecord.start_time.substring(0, 5); // HH:mm
        const end = blockRecord.end_time.substring(0, 5); // HH:mm
        
        if (slotTimeStr >= start && slotTimeStr <= end) return true;
    }
    
    return false;
  };

  // Generate time slots for the selected date
  const generateTimeSlots = () => {
    const slots = [];
    const today = startOfToday();
    const currentTime = new Date();
    
    // Check if the entire selected date is blocked (no start_time means full day)
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const isFullDayBlocked = blockedDates.some(b => 
      format(new Date(b.date), 'yyyy-MM-dd') === selectedDateStr && 
      !b.is_available && 
      !b.start_time
    );

    if (isFullDayBlocked) return []; // Return empty slots ONLY if the whole day is blocked

    for (let hour = 8; hour < 19; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = setMinutes(setHours(selectedDate, hour), minute);
        
        // Skip slots beyond 1 month from now
        if (isAfter(time, addDays(today, 30))) continue;

        const isBooked = bookedSlots.some(slot => 
          format(new Date(slot), 'yyyy-MM-dd HH:mm') === format(time, 'yyyy-MM-dd HH:mm')
        );

        const isPast = isTimeSlotDisabled(time);

        slots.push({
          time,
          isBooked,
          isPast
        });
      }
    }
    return slots;
  };

  const handleTimeSelect = (time) => {
    if (!token || !userData) {
      toast.info('Veuillez vous connecter pour prendre un rendez-vous');
      navigate('/login');
      return;
    }
    setSelectedTime(time);
    setAppointmentData(prev => ({
      ...prev,
      appointment_date: format(time, "yyyy-MM-dd'T'HH:mm")
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token || !userData) {
      toast.error('Veuillez vous connecter pour prendre un rendez-vous');
      navigate('/login');
      return;
    }

    if (!selectedTime) {
      toast.error('Veuillez sélectionner une date et une heure de rendez-vous');
      return;
    }

    // Debug: Log formData before sending
    console.log('Submitting appointment:', appointmentData);

    // Ensure all required fields are present
    if (!doctorId || !userData?.id || !appointmentData.appointment_date || !appointmentData.type) {
      toast.error('Une erreur est survenue avec vos informations de réservation. Veuillez rafraîchir la page.');
      console.error('Missing fields:', { doctorId, patientId: userData?.id, date: appointmentData.appointment_date, type: appointmentData.type });
      return;
    }

    // Split datetime for backend expectations
    const formattedDate = format(selectedTime, 'yyyy-MM-dd');
    const formattedTime = format(selectedTime, 'HH:mm:ss');
    const mappedType = appointmentData.type === 'video' ? 'follow-up' : 'consultation';

    try {
      const response = await api.post(
        '/appointments',
        {
          doctor_id: doctorId,
          patient_id: userData.id,
          appointment_date: formattedDate,
          appointment_time: formattedTime,
          type: mappedType,
          reason: 'Consultation',
          amount: consultationFee || 0
        }
      );
      
      toast.success('Rendez-vous réservé avec succès');
      
      // If it's a video appointment, show additional information
      if (appointmentData.type === 'video') {
        toast.info('Pour votre téléconsultation, accédez à la section "Mes Rendez-vous" le jour de votre consultation');
      }
      
      if (onSuccess) onSuccess();
      navigate('/my-appointments');
    } catch (error) {
      console.error('Booking error:', error);
      if (error.response?.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        logout();
        navigate('/login');
      } else if (error.response?.status === 409) {
        toast.error('Ce créneau horaire est déjà réservé');
      } else {
        toast.error(error.response?.data?.message || error.message || 'Erreur lors de la réservation');
      }
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
    setSelectedTime(null);
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg border border-[#ADADAD]">
      <h2 className="text-2xl font-medium text-gray-700 mb-6">Prendre un rendez-vous</h2>
      {!token && (
        <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
          Connectez-vous pour réserver un rendez-vous
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-[#565656] mb-2">
            Sélectionnez une date
          </label>
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={handleDateChange}
            min={format(new Date(), 'yyyy-MM-dd')}
            max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
            className="block w-full rounded-md border-[#DDDDDD] shadow-sm focus:border-[#1c2541] focus:ring-[#1c2541]"
          />
        </div>

        {/* Time Selection */}
        <div>
          <label className="block text-sm font-medium text-[#565656] mb-2">
            Sélectionnez une heure
          </label>
          {timeSlots.length === 0 ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-center gap-2">
              <span className="font-medium">Ce médecin est indisponible à cette date.</span>
              <span className="text-sm">(Congé ou absence prévue)</span>
            </div>
          ) : (
            <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
            {timeSlots.map((slot, index) => {
              const isDisabled = slot.isBooked || slot.isPast;
              const buttonTitle = slot.isBooked 
                ? 'Créneau déjà réservé' 
                : slot.isPast 
                ? 'Créneau passé' 
                : format(slot.time, 'HH:mm');
              
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => !isDisabled && handleTimeSelect(slot.time)}
                  disabled={isDisabled}
                  className={`
                    text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer
                    ${selectedTime && format(selectedTime, 'HH:mm') === format(slot.time, 'HH:mm')
                      ? 'bg-[#1c2541] text-white'
                      : slot.isBooked
                      ? 'bg-red-100 text-red-800 cursor-not-allowed'
                      : slot.isPast
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'text-[#949494] border border-[#B4B4B4] hover:bg-gray-100'
                    }
                  `}
                  title={buttonTitle}
                >
                  {format(slot.time, 'HH:mm')}
                </button>
              );
            })}
          </div>
          )}
        </div>

        {/* Consultation Type */}
        <div>
          <label className="block text-sm font-medium text-[#565656]">
            Type de consultation
          </label>
          <select
            name="type"
            value={appointmentData.type}
            onChange={(e) => setAppointmentData(prev => ({ ...prev, type: e.target.value }))}
            className="mt-1 block w-full rounded-md border-[#DDDDDD] shadow-sm focus:border-[#1c2541] focus:ring-[#1c2541]"
          >
            <option value="physical">Consultation en cabinet</option>
            <option value="video">Téléconsultation</option>
          </select>
          {appointmentData.type === 'video' && (
            <p className="mt-2 text-sm text-gray-600">
              Pour la téléconsultation, vous recevrez l'accès à la visioconférence dans la section "Mes Rendez-vous"
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedTime}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${!selectedTime 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[#1c2541] hover:bg-[#1c2541]/90'}`}
        >
          Confirmer le rendez-vous
        </button>
      </form>
    </div>
  );
};

export default AppointmentBooking;
