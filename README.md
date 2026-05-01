# 🏥 Your Doctor - Healthcare Management System

A full-stack healthcare management application built with **Laravel** (backend) and **React** (frontend), featuring admin dashboard, doctor management, appointment booking, and patient records.

---

## ✨ Features

- 🔐 **Authentication System** - Multi-role login (Admin, Doctor, Patient, Assistant)
- 👨‍💼 **Admin Dashboard** - Complete CRUD operations with bulk actions
- 👨‍⚕️ **Doctor Management** - Approve/reject doctors, manage profiles
- 📅 **Appointment System** - Book, manage, and track appointments
- 💳 **Payment Integration** - Payment status tracking
- 📊 **Analytics & Reports** - Charts and statistics
- 🔍 **Search & Filter** - Advanced filtering capabilities
- 📱 **Responsive Design** - Works on all devices

---

## 🚀 Quick Start

### For Windows Users

1. **Double-click `setup.bat`** - Automatic installation
2. **Double-click `start.bat`** - Run the application

That's it! The app will open in your browser.

### Manual Setup

See **[SETUP_GUIDE.md](SETUP_GUIDE.md)** for detailed instructions.

---

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Installation and configuration
- **[COLLABORATION_GUIDE.md](COLLABORATION_GUIDE.md)** - How to work together
- **[ADMIN_CRUD_PERMISSIONS.md](ADMIN_CRUD_PERMISSIONS.md)** - Admin features documentation
- **[ADMIN_DASHBOARD_FIXES.md](ADMIN_DASHBOARD_FIXES.md)** - Troubleshooting guide

---

## 🛠️ Tech Stack

### Backend
- **Laravel 9.x** - PHP Framework
- **SQLite/MySQL** - Database
- **Laravel Sanctum** - API Authentication
- **RESTful API** - Backend architecture

### Frontend
- **React 18** - JavaScript Library
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP Client
- **Recharts** - Data Visualization
- **React Icons** - Icon Library

---

## 📁 Project Structure

```
your-doctor/
├── backend/              # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   └── Middleware/
│   ├── routes/
│   │   └── api.php      # API endpoints
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── .env
│
├── frontend/            # React Application
│   ├── src/
│   │   ├── admin/       # Admin components
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   └── requests.js  # API configuration
│   └── .env
│
├── setup.bat            # Windows setup script
├── start.bat            # Windows start script
└── Documentation files
```

---

## 🔑 Default Credentials

**Admin Account:**
- Email: `admin@example.com`
- Password: `password123`

**⚠️ Change these immediately in production!**

---

## 🎯 Current Status

### ✅ Completed
- Admin authentication & authorization
- User management (CRUD + bulk actions)
- Doctor approval system
- Appointment management
- Dashboard with analytics
- Responsive UI
- API documentation

### 🚧 In Progress
- Video consultation integration
- Payment gateway integration
- Email notifications
- Mobile app version

### 📋 Planned
- Patient medical records
- Prescription management
- Appointment reminders
- Multi-language support
- Advanced reporting

---

## 🤝 Contributing

This is a collaborative project. See **[COLLABORATION_GUIDE.md](COLLABORATION_GUIDE.md)** for:
- Git workflow
- Task division
- Communication tips
- Code standards

---

## 🐛 Reporting Issues

Found a bug? Please:
1. Check existing issues
2. Provide error messages
3. Describe steps to reproduce
4. Include screenshots if helpful

---

## 📄 License

[Add your license here]

---

## 👥 Credits

Developed by:
- [Your Name]
- [Friend's Name]

---

## 📞 Support

For questions or help:
- Check documentation files
- Review error logs
- Contact project collaborators

---

**Made with ❤️ for better healthcare management**
