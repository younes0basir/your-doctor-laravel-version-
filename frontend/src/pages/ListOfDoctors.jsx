import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiSearch, 
  FiMapPin, 
  FiBriefcase, 
  FiCalendar,
  FiCheckCircle,
  FiLoader,
  FiAlertCircle
} from 'react-icons/fi';
import api from '../requests';
import userIcon from '../assets/user_icon.svg';

const ListOfDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialities, setSpecialities] = useState([]);
  const [selectedSpeciality, setSelectedSpeciality] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpeciality]);

  useEffect(() => {
    const filterDoctors = () => {
      let filtered = [...doctors];
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(doctor =>
          (doctor.user?.full_name || '').toLowerCase().includes(query) ||
          (doctor.city && doctor.city.toLowerCase().includes(query)) ||
          (doctor.specialty && doctor.specialty.toLowerCase().includes(query))
        );
      }
      if (selectedCity) {
        filtered = filtered.filter(doctor => doctor.city === selectedCity);
      }
      setFilteredDoctors(filtered);
    };
    filterDoctors();
  }, [doctors, searchQuery, selectedCity]);

  useEffect(() => {
    const uniqueCities = [...new Set(doctors.map(doctor => doctor.city))].filter(Boolean).sort();
    setCities(uniqueCities);
  }, [doctors]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching doctors from API...');
      let url = '/doctors';
      if (selectedSpeciality) {
        url += `?specialty=${encodeURIComponent(selectedSpeciality)}`;
      }
      
      const response = await api.get(url);
      console.log('API Response:', response.data);
      
      // Handle paginated response (Laravel pagination)
      let doctorsData = response.data;
      if (response.data.data) {
        doctorsData = response.data.data;
      } else if (response.data.doctors) {
        doctorsData = response.data.doctors;
      }
      
      if (!Array.isArray(doctorsData)) {
        console.error('Invalid data format:', doctorsData);
        setDoctors([]);
        setFilteredDoctors([]);
        setLoading(false);
        return;
      }
      
      // Filter out hidden or unapproved doctors
      const activeDoctors = doctorsData.filter(doctor => 
        doctor.status === 'approved' && doctor.user !== null
      );
      
      console.log('Active doctors:', activeDoctors.length);
      setDoctors(activeDoctors);
      setFilteredDoctors(activeDoctors);
      
      // Extract unique specialties from doctors for filter
      const uniqueSpecialties = [...new Set(
        activeDoctors
          .map(doctor => doctor.specialty)
          .filter(Boolean)
      )].sort();
      setSpecialities(uniqueSpecialties.map((spec, idx) => ({ id: spec, name: spec })));
      
      setLoading(false);
      console.log('Loading complete');
      
    } catch (error) {
      console.error('Error fetching doctors:', error);
      console.error('Error details:', error.response?.data || error.message);
      setError(error.response?.data?.message || error.message || 'Erreur lors du chargement des médecins');
      toast.error('Erreur lors du chargement des médecins');
      setDoctors([]);
      setFilteredDoctors([]);
      setLoading(false);
    }
  };

  const handleBookAppointment = (doctorId) => {
    navigate(`/appointment/${doctorId}`);
  };

  return (
    <div className='px-4 md:px-8 lg:px-16 py-20'>
      {/* Header Section */}
      <div className='text-center mb-12'>
        <h1 className='text-3xl md:text-4xl font-bold text-gray-800 mb-2'>
          Trouvez Votre <span className='text-[#ff5a5f]'>Médecin</span>
        </h1>
        <p className='text-gray-600 max-w-2xl mx-auto'>
          Parcourez notre réseau de professionnels de santé qualifiés et prenez rendez-vous dès aujourd'hui
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className='mb-12 bg-white p-6 rounded-xl shadow-sm'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {/* Search Input */}
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FiSearch className='text-gray-400' />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, ville ou spécialité..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10 w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f]'
            />
          </div>
          
          {/* Specialty Filter */}
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FiBriefcase className='text-gray-400' />
            </div>
            <select
              value={selectedSpeciality}
              onChange={(e) => setSelectedSpeciality(e.target.value)}
              className='pl-10 w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] appearance-none bg-white'
            >
              <option value=''>Toutes les spécialités</option>
              {specialities.map((speciality) => (
                <option key={speciality.id} value={speciality.id}>
                  {speciality.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* City Filter */}
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FiMapPin className='text-gray-400' />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className='pl-10 w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-[#ff5a5f] appearance-none bg-white'
            >
              <option value=''>Toutes les villes</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          
          {/* Reset Filters */}
          <button
            onClick={() => {
              setSelectedSpeciality('');
              setSelectedCity('');
              setSearchQuery('');
            }}
            className='px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors'
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className='flex justify-center items-center py-16'>
          <FiLoader className='animate-spin h-12 w-12 text-[#ff5a5f]' />
        </div>
      ) : error ? (
        <div className='text-center py-16'>
          <div className='bg-red-50 border-l-4 border-red-500 p-4 max-w-md mx-auto'>
            <div className='flex items-center justify-center'>
              <FiAlertCircle className='h-5 w-5 text-red-500 mr-2' />
              <p className='text-red-700'>{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {filteredDoctors.length === 0 ? (
            <div className="text-center py-16">
              <div className='max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm'>
                <h3 className='text-xl font-semibold text-gray-800 mb-2'>Aucun médecin trouvé</h3>
                <p className='text-gray-600 mb-4'>Essayez de modifier vos critères de recherche</p>
                <button
                  onClick={() => {
                    setSelectedSpeciality('');
                    setSelectedCity('');
                    setSearchQuery('');
                  }}
                  className='px-6 py-2 bg-[#ff5a5f] text-white rounded-lg hover:bg-[#ff7a7f] transition-colors'
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col"
                >
                  <div className="relative pt-[75%] bg-gray-100">
                    <img
                      src={doctor.user?.profile_image || userIcon}
                      alt={`Dr. ${doctor.user?.full_name || 'Médecin'}`}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = userIcon;
                      }}
                    />
                  </div>
                  <div className="p-5 flex flex-col gap-3 flex-grow">
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-bold text-gray-800">
                        Dr. {doctor.user?.full_name || 'Nom non disponible'}
                      </h2>
                      {doctor.status === 'approved' && (
                        <FiCheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <FiBriefcase className="mr-2 text-gray-400" />
                      <span>{doctor.specialty || 'Médecin généraliste'}</span>
                    </div>
                    
                    {doctor.bio && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {doctor.bio}
                      </p>
                    )}
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <FiMapPin className="mr-2 text-gray-400" />
                        <span>{doctor.city || 'Emplacement non spécifié'}</span>
                      </div>
                      
                      {doctor.experience_years && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Expérience:</span> {doctor.experience_years} ans
                        </div>
                      )}
                      
                      {doctor.consultation_fee && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Tarif:</span> {doctor.consultation_fee}€
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-auto pt-4">
                      <button
                        onClick={() => handleBookAppointment(doctor.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#ff5a5f] text-white rounded-lg hover:bg-[#ff7a7f] transition-colors"
                      >
                        <FiCalendar />
                        Prendre Rendez-vous
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListOfDoctors;
