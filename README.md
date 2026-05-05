# YourDoctor (MediAI Concierge) 🏥

[![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Neon PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech)

**YourDoctor** is a comprehensive, modern healthcare management platform designed to bridge the gap between doctors, medical assistants, and patients. It features a robust multi-role dashboard system, AI-powered medical assistance, and real-time appointment management.

---

## 🌟 Key Features

### 👨‍⚕️ Doctor Dashboard
- **Advanced Scheduling**: Interactive calendar with FullCalendar integration.
- **Queue Management**: Real-time patient flow control (Today's Queue).
- **Medical Records**: Structured digital prescriptions with integrated medication search.
- **Assistant Management**: Delegate tasks and manage permissions for medical assistants.

### 📋 Assistant Dashboard
- **Patient Onboarding**: Streamlined registration and appointment booking.
- **Dynamic Queue**: Manage waiting rooms and update appointment statuses live.
- **Doctor Synchronization**: Real-time view of doctor availability and schedules.

### 🤖 MediAI Integration
- **Smart Assistance**: AI-powered clinical support and booking assistance.
- **Automated Workflows**: Intelligent parsing of medical queries.

### 🛡️ Admin Portal
- **Global Statistics**: Visual insights into clinic performance using Chart.js.
- **User Management**: Complete CRUD operations for all user roles.
- **System Verification**: Verification workflows for medical professionals.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Backend** | Laravel 10+, PHP 8.2 |
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Database** | Neon PostgreSQL (Serverless) |
| **State Management** | React Context API |
| **Animations** | Framer Motion |
| **Charts/Data** | Chart.js, Recharts |
| **Scheduling** | FullCalendar.js |
| **API Integration** | Medication Proxy API (Vercel) |

---

## 🚀 Installation & Setup

### Prerequisites
- PHP 8.2+ & Composer
- Node.js 18+ & NPM
- PostgreSQL (or Neon account)

### 1. Backend Setup
```bash
cd backend
composer install
cp .env.example .env
# Configure your DATABASE_URL in .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🛠️ Recent Improvements (Major Fixes)

- **Unified ID Resolution**: Fixed critical production bug where assistant accounts could not see patient data due to ID mismatch between User and Profile records.
- **Medication API Proxy**: Implemented a Laravel-based proxy for the `medicament-api` to bypass CORS issues and ensure 100% reliability for digital prescriptions.
- **Auto-healing Seeders**: Developed `FixAssistantDoctorIdSeeder` to automatically repair legacy data relationships during deployment.

---

## 👥 Development Team

- **Zoubaa** - [GitHub Profile](https://github.com/zoubaax)
- **Younes Basir** - [GitHub Profile](https://github.com/younes0basir)

---

## 📄 License
This project is for academic purposes. Distributed under the MIT License.

---

*Designed and Developed for Advanced Healthcare Management Systems.*
