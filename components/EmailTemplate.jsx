'use client';

import { useState } from 'react';

const EmailTemplate = ({ isOpen, onClose, onSend, client, booking, payment }) => {
  // Debug logging
  console.log('EmailTemplate props:', { client, booking, payment });

  const [template, setTemplate] = useState({
    subject: `Payment Confirmation - Booking #${booking?.bookingNumber || ''}`,
    body: `Dear ${client?.firstName || ''} ${client?.surname || ''},

We are pleased to confirm that we have received your payment for the following booking:

Booking Details:
- Booking Number: ${booking?.bookingNumber || ''}
- E-Ticket: ${booking?.eTicket || ''}
- Travel Date: ${booking?.travelDate ? new Date(booking.travelDate).toLocaleDateString() : ''}
- Total Price: $${booking?.price?.toLocaleString() || '0'}

Payment Details:
- Amount Paid: $${payment?.amount?.toLocaleString() || '0'}
- Payment Date: ${payment?.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : ''}
- Payment Method: ${payment?.paymentMethod || ''}
- Reference: ${payment?.reference || 'N/A'}

Remaining Balance: $${booking?.remaining?.toLocaleString() || '0'}

Thank you for your business. If you have any questions, please don't hesitate to contact us.

Best regards,
Travel Agency Team`
  });

  const handleSend = () => {
    onSend(template);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Send Payment Confirmation Email</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To: {client?.contact?.email || 'No email address'}
              </label>

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                value={template.subject}
                onChange={(e) => setTemplate({...template, subject: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={template.body}
                onChange={(e) => setTemplate({...template, body: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                rows="15"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!client?.contact?.email}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplate;
