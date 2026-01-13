'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { paymentsApi } from '@/lib/api/payments';

function ReportsPage() {
  const [reports, setReports] = useState({
    paymentsByMethod: [],
    monthlyPayments: [],
    summary: { totalPaid: 0, totalRemaining: 0, totalBookingValue: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await paymentsApi.getReports();
      setReports(data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading reports...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <p className="text-sm font-medium text-gray-500">Total Booking Value</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">
                    ${reports.summary.totalBookingValue.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <p className="text-sm font-medium text-gray-500">Total Paid</p>
                  <p className="mt-1 text-3xl font-semibold text-green-600">
                    ${reports.summary.totalPaid.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {reports.summary.totalBookingValue > 0
                      ? ((reports.summary.totalPaid / reports.summary.totalBookingValue) * 100).toFixed(1)
                      : 0}
                    % collected
                  </p>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <p className="text-sm font-medium text-gray-500">Total Remaining</p>
                  <p className="mt-1 text-3xl font-semibold text-orange-600">
                    ${reports.summary.totalRemaining.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {reports.summary.totalBookingValue > 0
                      ? ((reports.summary.totalRemaining / reports.summary.totalBookingValue) * 100).toFixed(1)
                      : 0}
                    % outstanding
                  </p>
                </div>
              </div>
            </div>

            {/* Payments by Method */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Payments by Method</h2>
              <div className="space-y-4">
                {reports.paymentsByMethod.map((method) => (
                  <div key={method._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{method._id}</p>
                      <p className="text-sm text-gray-500">{method.count} transactions</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      ${method.total.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Payments */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Payments</h2>
              <div className="space-y-4">
                {reports.monthlyPayments.map((month) => (
                  <div key={`${month._id.year}-${month._id.month}`} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </p>
                      <p className="text-sm text-gray-500">{month.count} payments</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      ${month.total.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default function Reports() {
  return (
    <ProtectedRoute>
      <ReportsPage />
    </ProtectedRoute>
  );
}
