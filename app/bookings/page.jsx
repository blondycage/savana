'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

function BookingsTable() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('travelDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [hasRemaining, setHasRemaining] = useState('');
  const [hasUmrahFee, setHasUmrahFee] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importName, setImportName] = useState('');
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, message: '' });
  const [notification, setNotification] = useState({ show: false, type: '', title: '', message: '' });
  const [confirmDialog, setConfirmDialog] = useState({ show: false, title: '', message: '', onConfirm: null });

  const router = useRouter();
  const searchParams = useSearchParams();
  const batchId = searchParams.get('batchId');

  // Auto-dismiss success notifications after 3 seconds
  useEffect(() => {
    if (notification.show && notification.type === 'success') {
      const timer = setTimeout(() => {
        setNotification({ show: false, type: '', title: '', message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const [formData, setFormData] = useState({
    groupName: '',
    eTicket: '',
    bookingNumber: '',
    surname: '',
    firstName: '',
    passport: '',
    travelDate: '',
    returnDate: '',
    visa: '',
    dateOfBirth: '',
    nationality: '',
    packagePrice: 0,
    deposit: 0,
    remaining: 0,
    umraVisaFee: 0,
    privateRoom: '',
    status: 'Pending',
    notes: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchBookings();
  }, [batchId, search, status, sortBy, sortOrder, hasRemaining, hasUmrahFee, page]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page,
        limit: 50,
        sortBy,
        sortOrder
      });

      if (batchId) params.append('importBatchId', batchId);
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (hasRemaining) params.append('hasRemaining', hasRemaining);
      if (hasUmrahFee) params.append('hasUmrahFee', hasUmrahFee);

      const response = await fetch(`/api/bookings?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setBookings(data.bookings || data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset file input
    e.target.value = '';

    setImporting(true);
    setImportProgress({ current: 0, total: 0, message: 'Reading file...' });

    try {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const base64 = event.target.result.split(',')[1];
          const token = localStorage.getItem('token');

          setImportProgress({ current: 0, total: 0, message: 'Uploading and processing Excel file...' });

          const response = await fetch('/api/bookings/import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              data: base64,
              fileName: file.name,
              importName: importName || file.name
            })
          });

          const result = await response.json();

          if (response.ok) {
            const successCount = result.importBatch?.successCount || result.bookingsCreated || 0;
            const errorCount = result.importBatch?.errorCount || (result.errors?.length || 0);
            const totalRecords = result.importBatch?.totalRecords || 0;

            // Show success notification
            setNotification({
              show: true,
              type: successCount > 0 ? 'success' : 'error',
              title: successCount > 0 ? 'Import Complete' : 'Import Failed',
              message: `Successfully imported ${successCount} of ${totalRecords} bookings${errorCount > 0 ? `\n${errorCount} errors occurred` : ''}`
            });

            setImportName('');
            setImportProgress({ current: 0, total: 0, message: '' });
            fetchBookings();
          } else {
            setImportProgress({ current: 0, total: 0, message: '' });
            setNotification({
              show: true,
              type: 'error',
              title: 'Import Failed',
              message: result.message || 'An error occurred during import'
            });
          }
        } catch (error) {
          setImportProgress({ current: 0, total: 0, message: '' });
          setNotification({
            show: true,
            type: 'error',
            title: 'Import Error',
            message: error.message || 'An unexpected error occurred'
          });
        } finally {
          setImporting(false);
        }
      };

      reader.onerror = () => {
        setImportProgress({ current: 0, total: 0, message: '' });
        setNotification({
          show: true,
          type: 'error',
          title: 'File Read Error',
          message: 'Failed to read the selected file'
        });
        setImporting(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setImportProgress({ current: 0, total: 0, message: '' });
      setNotification({
        show: true,
        type: 'error',
        title: 'Import Error',
        message: error.message || 'An unexpected error occurred'
      });
      setImporting(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookings/export', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      setNotification({
        show: true,
        type: 'success',
        title: 'Export Successful',
        message: 'Bookings exported successfully'
      });
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Export Failed',
        message: error.message || 'Failed to export bookings'
      });
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookings/template', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'booking_template.xlsx';
      a.click();
      setNotification({
        show: true,
        type: 'success',
        title: 'Download Successful',
        message: 'Template downloaded successfully'
      });
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Download Failed',
        message: error.message || 'Failed to download template'
      });
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingBooking
        ? `/api/bookings/${editingBooking._id}`
        : '/api/bookings';

      const response = await fetch(url, {
        method: editingBooking ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setNotification({
          show: true,
          type: 'success',
          title: editingBooking ? 'Booking Updated' : 'Booking Created',
          message: editingBooking ? 'Booking updated successfully' : 'Booking created successfully'
        });
        setShowModal(false);
        setEditingBooking(null);
        setFormData({
          groupName: '', eTicket: '', bookingNumber: '', surname: '', firstName: '',
          passport: '', travelDate: '', returnDate: '', visa: '', dateOfBirth: '',
          nationality: '', packagePrice: 0, deposit: 0, remaining: 0, umraVisaFee: 0,
          privateRoom: '', status: 'Pending', notes: '', email: '', phone: ''
        });
        fetchBookings();
      } else {
        const errorData = await response.json();
        setNotification({
          show: true,
          type: 'error',
          title: 'Save Failed',
          message: errorData.message || 'Failed to save booking'
        });
      }
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'An unexpected error occurred'
      });
    }
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    setFormData({
      groupName: booking.importBatch?.name || '',
      eTicket: booking.eTicket || '',
      bookingNumber: booking.bookingNumber || '',
      surname: booking.surname || '',
      firstName: booking.firstName || '',
      passport: booking.passport || '',
      travelDate: booking.travelDate || '',
      returnDate: booking.returnDate || '',
      visa: booking.visa || '',
      dateOfBirth: booking.dateOfBirth || '',
      nationality: booking.nationality || '',
      packagePrice: booking.packagePrice || 0,
      deposit: booking.deposit || 0,
      remaining: booking.remaining || 0,
      umraVisaFee: booking.umraVisaFee || 0,
      privateRoom: booking.privateRoom || '',
      status: booking.status || 'Pending',
      notes: booking.notes || '',
      email: booking.email || '',
      phone: booking.phone || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setConfirmDialog({
      show: true,
      title: 'Delete Booking',
      message: 'Are you sure you want to delete this booking? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`/api/bookings/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            setNotification({
              show: true,
              type: 'success',
              title: 'Booking Deleted',
              message: 'Booking deleted successfully'
            });
            fetchBookings();
          } else {
            setNotification({
              show: true,
              type: 'error',
              title: 'Delete Failed',
              message: 'Failed to delete booking'
            });
          }
        } catch (error) {
          setNotification({
            show: true,
            type: 'error',
            title: 'Error',
            message: error.message || 'An unexpected error occurred'
          });
        }
        setConfirmDialog({ show: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Bookings</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Manage your travel bookings</p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3 items-center">
          <button
            onClick={() => {
              setEditingBooking(null);
              setFormData({
                groupName: '', eTicket: '', bookingNumber: '', surname: '', firstName: '',
                passport: '', travelDate: '', returnDate: '', visa: '', dateOfBirth: '',
                nationality: '', packagePrice: 0, deposit: 0, remaining: 0, umraVisaFee: 0,
                privateRoom: '', status: 'Pending', notes: '', email: '', phone: ''
              });
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            + Add Booking
          </button>

          <div className="relative flex items-center gap-2">
            <input
              type="text"
              placeholder="Import Name (optional)"
              value={importName}
              onChange={(e) => setImportName(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2"
              disabled={importing}
            />
            <label className={`${importing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 cursor-pointer'} text-white px-4 py-2 rounded-md font-medium`}>
              {importing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importing...
                </span>
              ) : (
                'Import Excel'
              )}
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImport}
                className="hidden"
                disabled={importing}
              />
            </label>
          </div>

          <button
            onClick={handleExport}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Export Excel
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Download Template
          </button>

          {/* Import Progress */}
          {importing && importProgress.message && (
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md px-4 py-2">
              <svg className="animate-spin h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                {importProgress.message}
                {importProgress.total > 0 && ` (${importProgress.current}/${importProgress.total})`}
              </span>
            </div>
          )}
        </div>

        {/* Filters & Search */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={hasRemaining}
            onChange={(e) => setHasRemaining(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2"
          >
            <option value="">All Payments</option>
            <option value="true">Has Remaining</option>
            <option value="false">Fully Paid</option>
          </select>

          <select
            value={hasUmrahFee}
            onChange={(e) => setHasUmrahFee(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2"
          >
            <option value="">All Umrah Fees</option>
            <option value="true">Has Umrah Fee</option>
            <option value="false">No Umrah Fee</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2"
          >
            <option value="travelDate">Travel Date</option>
            <option value="remaining">Remaining</option>
            <option value="umraVisaFee">Umrah Fee</option>
            <option value="packagePrice">Package Price</option>
            <option value="surname">Surname</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b-2 border-gray-300 dark:border-gray-600">Booking #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b-2 border-gray-300 dark:border-gray-600">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b-2 border-gray-300 dark:border-gray-600">Passport</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b-2 border-gray-300 dark:border-gray-600">Travel Date</th>
                
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b-2 border-gray-300 dark:border-gray-600">Deposit</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b-2 border-gray-300 dark:border-gray-600">Remaining</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b-2 border-gray-300 dark:border-gray-600">Umrah Fee</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b-2 border-gray-300 dark:border-gray-600">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-b-2 border-gray-300 dark:border-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading bookings...
                      </div>
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No bookings found</td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
                        {booking.bookingNumber !== 'Not Assigned' ? booking.bookingNumber : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col">
                          <span className="font-medium">{booking.firstName !== 'Not Assigned' ? booking.firstName : '-'}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{booking.surname !== 'Not Assigned' ? booking.surname : '-'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                        {booking.passport !== 'Not Assigned' ? booking.passport : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                        {booking.travelDate !== 'Not Assigned' ? (
                          <span className="whitespace-nowrap">{booking.travelDate.split('T')[0]}</span>
                        ) : '-'}
                      </td>
                     
                      <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                        £{booking.deposit?.toLocaleString() || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold border-b border-gray-200 dark:border-gray-700">
                        <span className={booking.remaining > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}>
                          £{booking.remaining?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                        £{booking.umraVisaFee?.toLocaleString() || 0}
                      </td>
                      <td className="px-4 py-3 text-center border-b border-gray-200 dark:border-gray-700">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          booking.status === 'Confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          booking.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => router.push(`/payments?bookingId=${booking._id}`)}
                            className="p-1.5 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 rounded transition-colors"
                            title="Payments"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(booking)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(booking._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">{editingBooking ? 'Edit Booking' : 'Add Booking'}</h2>
            <form onSubmit={handleCreateOrUpdate} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Group Name *</label>
                <input
                  type="text"
                  value={formData.groupName}
                  onChange={(e) => setFormData({...formData, groupName: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">E-Ticket</label>
                <input
                  type="text"
                  value={formData.eTicket}
                  onChange={(e) => setFormData({...formData, eTicket: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Booking Number</label>
                <input
                  type="text"
                  value={formData.bookingNumber}
                  onChange={(e) => setFormData({...formData, bookingNumber: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Surname</label>
                <input
                  type="text"
                  value={formData.surname}
                  onChange={(e) => setFormData({...formData, surname: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Passport</label>
                <input
                  type="text"
                  value={formData.passport}
                  onChange={(e) => setFormData({...formData, passport: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Travel Date</label>
                <input
                  type="date"
                  value={formData.travelDate}
                  onChange={(e) => setFormData({...formData, travelDate: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Return Date</label>
                <input
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => setFormData({...formData, returnDate: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nationality</label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Package Price (£)</label>
                <input
                  type="number"
                  value={formData.packagePrice}
                  onChange={(e) => setFormData({...formData, packagePrice: parseFloat(e.target.value) || 0})}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Deposit (£)</label>
                <input
                  type="number"
                  value={formData.deposit}
                  onChange={(e) => setFormData({...formData, deposit: parseFloat(e.target.value) || 0})}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Remaining (£)</label>
                <input
                  type="number"
                  value={formData.remaining}
                  onChange={(e) => setFormData({...formData, remaining: parseFloat(e.target.value) || 0})}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Umrah Visa Fee (£)</label>
                <input
                  type="number"
                  value={formData.umraVisaFee}
                  onChange={(e) => setFormData({...formData, umraVisaFee: parseFloat(e.target.value) || 0})}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Visa</label>
                <input
                  type="text"
                  value={formData.visa}
                  onChange={(e) => setFormData({...formData, visa: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Private Room</label>
                <input
                  type="text"
                  value={formData.privateRoom}
                  onChange={(e) => setFormData({...formData, privateRoom: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-3 py-2"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-3 py-2"
                  rows="3"
                />
              </div>

              <div className="col-span-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  {editingBooking ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {notification.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-start gap-4">
              {notification.type === 'success' ? (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {notification.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {notification.message}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setNotification({ show: false, type: '', title: '', message: '' })}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 font-medium"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {confirmDialog.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {confirmDialog.message}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialog({ show: false, title: '', message: '', onConfirm: null })}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Import Loading Overlay */}
      {importing && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-16 w-16 text-blue-600 dark:text-blue-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Importing Bookings
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                {importProgress.message || 'Processing your Excel file...'}
              </p>
              {importProgress.total > 0 && (
                <div className="w-full">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{importProgress.current} / {importProgress.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                Please wait, do not close this window...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingsPage() {
  return (
    <Layout>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <BookingsTable />
      </Suspense>
    </Layout>
  );
}

export default function Bookings() {
  return (
    <ProtectedRoute>
      <BookingsPage />
    </ProtectedRoute>
  );
}
