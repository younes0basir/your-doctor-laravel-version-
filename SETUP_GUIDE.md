# Your Doctor - Project Setup Guide

## 📋 Prerequisites

Before starting, make sure you have installed:
- **PHP 8.0+** (for Laravel backend)
- **Composer** (PHP dependency manager)
- **Node.js 16+** (for React frontend)
- **npm** or **yarn** (JavaScript package manager)
- **Git** (version control)

---

## 🚀 Quick Start

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd "your-doctor-source-code"
```

### Step 2: Backend Setup (Laravel)

```bash
# Navigate to backend directory
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Create database (SQLite is default, or configure MySQL/PostgreSQL in .env)
touch database/database.sqlite

# Run migrations
php artisan migrate

# Seed database with sample data (optional but recommended)
php artisan db:seed

# Start Laravel development server
php artisan serve
```

The backend will run on: `http://localhost:8000`

### Step 3: Frontend Setup (React)

Open a **new terminal** and navigate to frontend:

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Copy environment file (if exists)
cp .env.example .env

# Start React development server
npm run dev
```

The frontend will run on: `http://localhost:5173` (or similar)

---

## ⚙️ Configuration

### Backend (.env)

Edit `backend/.env`:

```env
APP_NAME="Your Doctor"
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database Configuration
DB_CONNECTION=sqlite
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=your_doctor
# DB_USERNAME=root
# DB_PASSWORD=

# Mail Configuration (optional)
MAIL_MAILER=log
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"
```

### Frontend (.env)

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
VITE_BACKEND_URL=http://localhost:8000
```

---

## 👤 Default Admin Credentials

After seeding the database, use these credentials to login as admin:

- **Email:** `admin@example.com`
- **Password:** `password123`

**⚠️ IMPORTANT:** Change these credentials immediately in production!

---

## 📁 Project Structure

```
your-doctor-source-code/
├── backend/                 # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   └── ...
│   ├── routes/
│   │   └── api.php         # API routes
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── .env
│   └── composer.json
│
├── frontend/               # React Application
│   ├── src/
│   │   ├── admin/          # Admin dashboard components
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   └── requests.js     # Axios configuration
│   ├── .env
│   └── package.json
│
├── ADMIN_CRUD_PERMISSIONS.md    # Admin features documentation
├── ADMIN_DASHBOARD_FIXES.md     # Dashboard troubleshooting
└── README.md                    # This file
```

---

## 🔧 Common Issues & Solutions

### Issue 1: Composer Install Fails

```bash
# Clear composer cache
composer clear-cache

# Try again
composer install --no-dev
```

### Issue 2: npm Install Fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 3: Database Migration Errors

```bash
# Fresh migration (WARNING: Deletes all data)
php artisan migrate:fresh --seed

# Or rollback and re-migrate
php artisan migrate:rollback
php artisan migrate
```

### Issue 4: CORS Errors

Backend already configured for CORS. If issues persist:

```bash
# Clear Laravel cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### Issue 5: Port Already in Use

```bash
# Backend: Use different port
php artisan serve --port=8001

# Frontend: Edit vite.config.js or package.json to change port
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
php artisan test
```

### Frontend Tests

```bash
cd frontend
npm run test
```

---

## 📝 Development Workflow

### Adding New Features

1. **Backend (Laravel):**
   - Create migration: `php artisan make:migration create_table_name`
   - Create model: `php artisan make:model ModelName`
   - Create controller: `php artisan make:controller Api/ControllerName`
   - Add routes in `routes/api.php`
   - Test with Postman or Thunder Client

2. **Frontend (React):**
   - Create component in appropriate folder
   - Add route in `src/App.jsx`
   - Use centralized `api` instance from `requests.js`
   - Test in browser

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add: your feature description"

# Push to repository
git push origin feature/your-feature-name

# Create pull request on GitHub/GitLab
```

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change default admin password
- [ ] Set `APP_DEBUG=false` in `.env`
- [ ] Set `APP_ENV=production`
- [ ] Generate new `APP_KEY`
- [ ] Configure proper database credentials
- [ ] Set up SSL/HTTPS
- [ ] Configure mail settings
- [ ] Enable rate limiting
- [ ] Review CORS settings
- [ ] Remove debug endpoints

---

## 📚 Documentation

- **Admin CRUD & Permissions:** See `ADMIN_CRUD_PERMISSIONS.md`
- **Dashboard Fixes:** See `ADMIN_DASHBOARD_FIXES.md`
- **API Documentation:** Visit `http://localhost:8000/api-docs` when backend is running

---

## 🤝 Contributing

When collaborating:

1. **Communicate:** Discuss features before implementing
2. **Branch Strategy:** Use feature branches, not main/master
3. **Code Style:** Follow existing patterns
4. **Testing:** Test your changes thoroughly
5. **Documentation:** Update docs for new features
6. **Commits:** Write clear commit messages

---

## 📞 Support

If you encounter issues:

1. Check the error logs:
   - Backend: `backend/storage/logs/laravel.log`
   - Frontend: Browser console (F12)

2. Search existing issues in repository

3. Contact your collaborator

---

## 🎯 Next Steps for Development

Priority tasks to complete:

1. ✅ Admin dashboard - **DONE**
2. ✅ User management CRUD - **DONE**
3. ⏳ Replace remaining axios calls with centralized API
4. ⏳ Add assistant management features
5. ⏳ Implement video consultation
6. ⏳ Add payment integration
7. ⏳ Create mobile responsive design
8. ⏳ Add email notifications
9. ⏳ Implement appointment reminders
10. ⏳ Add patient medical records

---

## 📄 License

[Add your license information here]

---

**Happy Coding! 🚀**
