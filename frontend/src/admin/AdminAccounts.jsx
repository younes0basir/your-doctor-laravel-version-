import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { 
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiCheckCircle,
  FiEyeOff,
  FiTrash2,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiXCircle,
  FiClock,
  FiEdit,
  FiPlus
} from 'react-icons/fi';
import api from '../requests';

const AdminAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      console.log('Fetching admin accounts...');
      const response = await api.get('/admin/accounts');
      
      // Handle paginated response
      const accountsData = response.data?.data || response.data || [];
      setAccounts(Array.isArray(accountsData) ? accountsData : []);
      setFilteredAccounts(Array.isArray(accountsData) ? accountsData : []);
      
      console.log('Loaded', accountsData.length, 'accounts');
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to fetch accounts');
      setAccounts([]);
      setFilteredAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filterAccounts = () => {
      let filtered = [...accounts];

      // Apply search filter
      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(account => {
          const firstName = account.firstName?.toLowerCase() || '';
          const lastName = account.lastName?.toLowerCase() || '';
          const email = account.email?.toLowerCase() || '';
          return (
            firstName.includes(query) ||
            lastName.includes(query) ||
            email.includes(query)
          );
        });
      }

      // Filter by account type
      if (accountTypeFilter !== 'all') {
        filtered = filtered.filter(account => account.type === accountTypeFilter);
      }

      // Filter by status
      if (statusFilter !== 'all') {
        filtered = filtered.filter(account => account.status === statusFilter);
      }

      setFilteredAccounts(filtered);
    };

    filterAccounts();
  }, [search, accountTypeFilter, statusFilter, accounts]);

  const handleApproveDoctor = async (doctorId) => {
    try {
      await api.put(`/admin/doctors/${doctorId}/approve`);
      setAccounts(accounts => accounts.map(acc =>
        acc.type === 'doctor' && acc.id === doctorId ? { ...acc, status: 'approved' } : acc
      ));
      toast.success('Doctor approved successfully');
    } catch (error) {
      console.error('Error approving doctor:', error);
      toast.error('Error approving doctor');
    }
  };

  const handleHideDoctor = async (doctorId) => {
    try {
      await api.put(`/admin/doctors/${doctorId}/hide`);
      setAccounts(accounts => accounts.map(acc =>
        acc.type === 'doctor' && acc.id === doctorId ? { ...acc, status: 'hidden' } : acc
      ));
      toast.success('Doctor hidden successfully');
    } catch (error) {
      console.error('Error hiding doctor:', error);
      toast.error('Error hiding doctor');
    }
  };

  const handleUnhideDoctor = async (doctorId) => {
    try {
      await api.put(`/admin/doctors/${doctorId}/unhide`);
      setAccounts(accounts => accounts.map(acc =>
        acc.type === 'doctor' && acc.id === doctorId ? { ...acc, status: 'approved' } : acc
      ));
      toast.success('Doctor unhidden successfully');
    } catch (error) {
      console.error('Error unhiding doctor:', error);
      toast.error('Error unhiding doctor');
    }
  };

  const handleDelete = (type, id) => {
    setDeleteTarget({ type, id });
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/accounts/${deleteTarget.type}/${deleteTarget.id}`);
      setAccounts(accounts => accounts.filter(acc => !(acc.type === deleteTarget.type && acc.id === deleteTarget.id)));
      toast.success('Account deleted successfully');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Error deleting account');
    } finally {
      setShowConfirm(false);
      setDeleteTarget(null);
    }
  };

  // Toggle account selection for bulk actions
  const toggleSelectAccount = (accountId) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  // Select all accounts
  const toggleSelectAll = () => {
    if (selectedAccounts.length === filteredAccounts.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(filteredAccounts.map(acc => acc.id));
    }
  };

  // Bulk action handler
  const handleBulkAction = async (action) => {
    if (selectedAccounts.length === 0) {
      toast.warning('Please select at least one account');
      return;
    }

    try {
      await api.post('/admin/accounts/bulk-action', {
        action,
        user_ids: selectedAccounts
      });
      
      toast.success(`Bulk ${action} completed successfully`);
      setSelectedAccounts([]);
      fetchAccounts(); // Refresh the list
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error(error.response?.data?.message || 'Bulk action failed');
    }
  };

  // Open edit modal
  const handleEdit = (user) => {
    setEditUser(user);
    setShowEditModal(true);
  };

  // Handle edit form submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const updateData = {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        status: formData.get('status'),
      };

      const password = formData.get('password');
      if (password) {
        updateData.password = password;
      }

      await api.put(`/admin/accounts/${editUser.id}`, updateData);
      toast.success('User updated successfully');
      setShowEditModal(false);
      setEditUser(null);
      fetchAccounts();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  // Handle create user
  const handleCreateUser = async (userData) => {
    try {
      await api.post('/admin/accounts', userData);
      toast.success('User created successfully');
      setShowCreateModal(false);
      fetchAccounts();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.message || 'Creation failed');
    }
  };

  const getStatusBadge = (status) => {
    // Handle undefined/null status
    if (!status) {
      return (
        <span className="px-3 py-1 text-xs font-medium rounded-full inline-flex items-center bg-gray-100 text-gray-800">
          <FiClock className="mr-1" /> Unknown
        </span>
      );
    }

    const statusString = status.toString().toLowerCase();
    const statusMap = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <FiClock className="mr-1" /> },
      approved: { color: 'bg-green-100 text-green-800', icon: <FiCheckCircle className="mr-1" /> },
      hidden: { color: 'bg-red-100 text-red-800', icon: <FiEyeOff className="mr-1" /> },
      active: { color: 'bg-blue-100 text-blue-800', icon: <FiCheckCircle className="mr-1" /> }
    };

    const statusConfig = statusMap[statusString] || { 
      color: 'bg-gray-100 text-gray-800', 
      icon: <FiClock className="mr-1" /> 
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full inline-flex items-center ${statusConfig.color}`}>
        {statusConfig.icon}
        {status}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    // Handle undefined/null type
    if (!type) {
      return (
        <span className="px-3 py-1 text-xs font-medium rounded-full inline-flex items-center bg-gray-100 text-gray-800">
          <FiUser className="mr-1" /> Unknown
        </span>
      );
    }

    const typeString = type.toString().toLowerCase();
    const typeMap = {
      doctor: { color: 'bg-purple-100 text-purple-800', icon: <FiBriefcase className="mr-1" /> },
      assistant: { color: 'bg-indigo-100 text-indigo-800', icon: <FiUser className="mr-1" /> },
      admin: { color: 'bg-amber-100 text-amber-800', icon: <FiUser className="mr-1" /> }
    };

    const typeConfig = typeMap[typeString] || { 
      color: 'bg-gray-100 text-gray-800', 
      icon: <FiUser className="mr-1" /> 
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full inline-flex items-center ${typeConfig.color}`}>
        {typeConfig.icon}
        {type}
      </span>
    );
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manage Accounts</h1>
            <p className="text-gray-600">View and manage all system accounts</p>
          </div>
          <button 
            onClick={fetchAccounts}
            className="mt-4 md:mt-0 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-xs flex items-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FiRefreshCw className="mr-2" />
            Refresh
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 mb-6">
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search accounts by name or email..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* Account Type Filter */}
              <div className="flex items-center">
                <FiFilter className="text-gray-400 mr-2" />
                <label className="text-sm font-medium text-gray-700 mr-2">Type:</label>
                <select
                  value={accountTypeFilter}
                  onChange={(e) => setAccountTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="doctor">Doctors</option>
                  <option value="assistant">Assistants</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
              {/* Status Filter */}
              <div className="flex items-center">
                <FiFilter className="text-gray-400 mr-2" />
                <label className="text-sm font-medium text-gray-700 mr-2">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="hidden">Hidden</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="text-center p-12">
                <FiUser className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No accounts found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || accountTypeFilter !== 'all' || statusFilter !== 'all' 
                    ? "Try adjusting your search or filters" 
                    : "No accounts available"}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAccounts.map((account) => (
                    <tr key={`${account.type}-${account.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FiUser className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {account.firstName} {account.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {account.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{account.email}</div>
                        <div className="text-sm text-gray-500">
                          <span className="inline-flex items-center">
                            <FiPhone className="mr-1" /> {account.phone || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeBadge(account.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(account.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {account.type === 'doctor' && account.status === 'pending' && (
                            <button
                              onClick={() => handleApproveDoctor(account.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                            >
                              <FiCheckCircle className="mr-1" /> Approve
                            </button>
                          )}
                          {account.type === 'doctor' && account.status === 'approved' && (
                            <button
                              onClick={() => handleHideDoctor(account.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none"
                            >
                              <FiEyeOff className="mr-1" /> Hide
                            </button>
                          )}
                          {account.type === 'doctor' && account.status === 'hidden' && (
                            <button
                              onClick={() => handleUnhideDoctor(account.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                            >
                              <FiCheckCircle className="mr-1" /> Unhide
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(account.type, account.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                          >
                            <FiTrash2 className="mr-1" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-red-600">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete this account? This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                onClick={confirmDelete}
              >
                Delete
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccounts;
