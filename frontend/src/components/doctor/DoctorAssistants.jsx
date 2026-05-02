import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../requests';
import { FiUser, FiMail, FiPhone, FiPlus, FiSearch, FiXCircle } from 'react-icons/fi';
import AssistantRegister from '../assistant/AssistantRegister';
import DoctorSidebar from './DoctorSidebar';

const DoctorAssistants = () => {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users?role=assistant');
      setAssistants(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Error fetching assistants:', err);
      toast.error('Error fetching assistants');
    } finally {
      setLoading(false);
    }
  };

  const filteredAssistants = assistants.filter(assistant => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      assistant.first_name?.toLowerCase().includes(query) ||
      assistant.last_name?.toLowerCase().includes(query) ||
      assistant.email?.toLowerCase().includes(query)
    );
  });

  if (showCreate) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DoctorSidebar activeTab="assistants" />
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">Add New Assistant</h1>
          <button 
            onClick={() => setShowCreate(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Back to List
          </button>
        </div>
        <AssistantRegister onRegistered={() => {
          setShowCreate(false);
          fetchAssistants();
        }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorSidebar activeTab="assistants" />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Assistants</h1>
            <p className="text-gray-600">View and manage your medical assistants</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button 
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-xs flex items-center text-sm font-medium hover:bg-blue-700"
            >
              <FiPlus className="mr-2" />
              Add Assistant
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search assistants by name or email..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <FiXCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredAssistants.length === 0 ? (
              <div className="text-center p-12">
                <FiUser className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No assistants found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search ? "Try adjusting your search" : "You haven't added any assistants yet."}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assistant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssistants.map((assistant) => (
                    <tr key={assistant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FiUser className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {assistant.first_name} {assistant.last_name}
                            </div>
                            <div className="text-sm text-gray-500">Assistant ID: #{assistant.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FiMail className="mr-2 text-gray-400" /> {assistant.email}
                        </div>
                        {assistant.phone && (
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <FiPhone className="mr-2 text-gray-400" /> {assistant.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${assistant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {assistant.status || 'Active'}
                        </span>
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
    </div>
  );
};

export default DoctorAssistants;
