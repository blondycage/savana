'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

function DashboardPage() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalOutstanding: 0,
  });
  const [importBatches, setImportBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchStats();
    fetchImportBatches();
  }, []);

  const handleDeleteBatch = async (batchId, batchName) => {
    if (!confirm(`Are you sure you want to delete batch "${batchName}" and all its bookings? This cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/import-batches/${batchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Batch deleted successfully!\n${result.deletedBookings} bookings and ${result.deletedPayments} payments removed.`);
        fetchImportBatches();
        fetchStats();
      } else {
        const error = await response.json();
        alert('Failed to delete batch: ' + error.message);
      }
    } catch (error) {
      console.error('Delete batch error:', error);
      alert('Error deleting batch: ' + error.message);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookings/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchImportBatches = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/import-batches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setImportBatches(data);
    } catch (error) {
      console.error('Failed to fetch import batches:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Welcome to your travel agency management system</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden shadow-xl rounded-xl">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-blue-100 text-sm font-medium">Total Bookings</p>
                    <p className="mt-2 text-4xl font-bold text-white">
                      {loading ? '...' : stats.totalBookings}
                    </p>
                    <p className="mt-1 text-blue-100 text-sm">All time bookings</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 overflow-hidden shadow-xl rounded-xl">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                    <p className="mt-2 text-4xl font-bold text-white">
                      {loading ? '...' : `£${stats.totalRevenue?.toLocaleString() || 0}`}
                    </p>
                    <p className="mt-1 text-green-100 text-sm">Revenue collected</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 overflow-hidden shadow-xl rounded-xl">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-orange-100 text-sm font-medium">Outstanding</p>
                    <p className="mt-2 text-4xl font-bold text-white">
                      {loading ? '...' : `£${stats.totalOutstanding?.toLocaleString() || 0}`}
                    </p>
                    <p className="mt-1 text-orange-100 text-sm">Remaining balance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Import Batches */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Import Batches</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">View bookings grouped by import file</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Batch Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">File Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Upload Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bookings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">Loading...</td>
                    </tr>
                  ) : importBatches.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No import batches found</td>
                    </tr>
                  ) : (
                    importBatches.map((batch) => (
                      <tr key={batch._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{batch.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{batch.fileName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(batch.uploadedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {batch.bookingCount || batch.successCount} bookings
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                          <button
                            onClick={() => router.push(`/bookings?batchId=${batch._id}`)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                          >
                            View Bookings
                          </button>
                          <button
                            onClick={() => handleDeleteBatch(batch._id, batch.name)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}
