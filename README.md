# 3D Printer Management System

A full-stack web application for managing 3D printers, repairs, inventory, and technicians.

## Tech Stack

- **Frontend:** React 18, Tailwind CSS, React Router 6, Recharts, Axios
- **Backend:** Node.js, Express.js, MongoDB (Mongoose)
- **Exports:** PDFKit (PDF), ExcelJS (Excel)

## Features

- Authentication (register/login with JWT)
- Dashboard with charts (repairs by status, printers by brand)
- Printer management (CRUD) - Bambu Lab P1S, Bambu Lab A1, Anycubic, etc.
- Repair tracking with full fields (printer name, number, date, technician, problem, status, cost)
- Inventory management (spare parts with quantity, compatible printers, price, supplier)
- Technician management
- PDF and Excel export for all modules
- Responsive UI with sidebar navigation

## Project Structure

```
3d-printer-management/
├── backend/
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── models/         # User, Printer, Repair, Inventory, Technician
│   ├── controllers/    # Auth, Printer, Repair, Inventory, Technician, Export
│   ├── routes/         # API route definitions
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/        # Axios client with interceptors
│   │   ├── components/ # Layout, Sidebar, Navbar, Charts
│   │   └── pages/      # Login, Dashboard, CRUD pages for all modules
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)

## Setup & Installation

### 1. Clone and install backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/3d_printer_management
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=7d
```

Start backend:

```bash
npm run dev
```

### 2. Install and run frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:5000`.

### 3. Open the app

Navigate to `http://localhost:3000` and register a new account.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET/POST | /api/printers | List/Create printers |
| GET/PUT/DELETE | /api/printers/:id | Single printer CRUD |
| GET/POST | /api/repairs | List/Create repairs |
| GET/PUT/DELETE | /api/repairs/:id | Single repair CRUD |
| GET/POST | /api/inventory | List/Create inventory |
| GET/PUT/DELETE | /api/inventory/:id | Single item CRUD |
| GET/POST | /api/technicians | List/Create technicians |
| GET/PUT/DELETE | /api/technicians/:id | Single technician CRUD |
| GET | /api/export/dashboard | Dashboard stats |
| GET | /api/export/pdf/:resource | Export PDF |
| GET | /api/export/excel/:resource | Export Excel |
