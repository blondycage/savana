# Travel Agency Management System - Next.js

A complete travel agency management system built with Next.js, combining frontend and backend in a single application.

## Features

- **Authentication**: Login, password reset, and change password
- **Client Management**: CRUD operations for managing clients
- **Booking Management**: Create, update, and track bookings with payment status
- **Payment Tracking**: Record and manage payments for bookings
- **Email Notifications**: Send payment confirmations to clients
- **Excel Import/Export**: Import bookings from Excel and export data
- **Dashboard**: View statistics and quick actions
- **Reports**: Analytics and payment reports

## Technology Stack

- **Next.js 14+** - React framework with App Router
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Nodemailer** - Email notifications
- **XLSX** - Excel file handling

## Project Structure

```
nextjs-app/
├── app/                      # Next.js App Router pages
│   ├── api/                 # API routes (backend)
│   │   ├── auth/           # Authentication endpoints
│   │   ├── clients/        # Client endpoints
│   │   ├── bookings/       # Booking endpoints
│   │   └── payments/       # Payment endpoints
│   ├── dashboard/          # Dashboard page
│   ├── clients/            # Clients page
│   ├── bookings/           # Bookings page
│   ├── reports/            # Reports page
│   ├── login/              # Login page
│   ├── forgot-password/    # Password reset request
│   ├── reset-password/     # Password reset confirmation
│   ├── layout.jsx          # Root layout
│   └── globals.css         # Global styles
├── components/              # React components
│   ├── Navbar.jsx
│   ├── Layout.jsx
│   ├── ProtectedRoute.jsx
│   ├── Toast.jsx
│   └── EmailTemplate.jsx
├── lib/                     # Utilities and configs
│   ├── api/                # API client layer
│   │   ├── client.js
│   │   ├── bookings.js
│   │   ├── clients.js
│   │   └── payments.js
│   ├── store/              # Zustand stores
│   │   └── authStore.js
│   └── db.js               # MongoDB connection
├── models/                  # Mongoose models
│   ├── User.js
│   ├── Client.js
│   ├── Booking.js
│   └── Payment.js
├── utils/                   # Utility functions
│   ├── excel.js
│   └── mailer.js
└── middleware/              # Custom middleware
    └── auth.js

```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud)
- Gmail account for SMTP (or other email service)

### Installation

1. Clone or navigate to the project directory:
```bash
cd /Users/macbook/Documents/travel/nextjs-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env.local`
   - Update the values with your credentials:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
SMTP_USER=your_gmail_address
SMTP_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## API Routes

All API routes are available at `/api/*`:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `PATCH /api/auth/change-password` - Change password (authenticated)

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create client
- `GET /api/clients/[id]` - Get client by ID
- `PUT /api/clients/[id]` - Update client
- `DELETE /api/clients/[id]` - Delete client

### Bookings
- `GET /api/bookings` - Get all bookings (with filters)
- `POST /api/bookings` - Create booking
- `GET /api/bookings/[id]` - Get booking by ID
- `PUT /api/bookings/[id]` - Update booking
- `DELETE /api/bookings/[id]` - Delete booking
- `GET /api/bookings/stats` - Get statistics
- `GET /api/bookings/export` - Export to Excel
- `POST /api/bookings/import` - Import from Excel
- `GET /api/bookings/template` - Download Excel template

### Payments
- `GET /api/payments/[bookingId]` - Get payments for booking
- `POST /api/payments/[bookingId]` - Create payment
- `PUT /api/payments/update/[id]` - Update payment
- `DELETE /api/payments/delete/[id]` - Delete payment
- `POST /api/payments/send-email/[paymentId]` - Send payment confirmation
- `GET /api/payments/reports/summary` - Get payment reports

## Features Details

### Authentication
- Secure JWT-based authentication
- Password reset via email
- Protected routes with middleware

### Client Management
- Add, edit, delete clients
- Search functionality
- Unique passport number validation

### Booking Management
- Create bookings with client association
- Track booking status (pending, confirmed, completed, cancelled)
- Automatic remaining balance calculation
- Payment tracking integration

### Payment System
- Record payments against bookings
- Multiple payment methods (cash, bank transfer, credit card, etc.)
- Send payment confirmation emails
- Payment restrictions (can't add payments to completed bookings)

### Excel Integration
- Download template with sample data
- Import bookings with automatic client creation
- Export bookings data

### Dashboard
- View key statistics (total bookings, clients, revenue)
- Quick search functionality
- Quick action buttons

## Migration from MERN Stack

This application was converted from a separate backend (Express.js) and frontend (React + Vite) to a unified Next.js application:

- ✅ Backend API routes → Next.js API routes
- ✅ React pages → Next.js pages with App Router
- ✅ React Router → Next.js file-based routing
- ✅ Separate servers → Single Next.js server
- ✅ All features preserved and working

## Default Credentials

Use the seed data script from the original backend to create a default admin user, or create one manually in MongoDB.

## Support

For issues or questions, refer to the original `CONVERSATION_CONTEXT.md` file in the parent directory.

## License

ISC
