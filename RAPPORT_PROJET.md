# Rapport Projet "Your Doctor"

## Vue d'ensemble
Plateforme de télémédecine complète avec backend Laravel et frontend React, utilisant Neon PostgreSQL et IA NVIDIA.

## Architecture

### Backend (Laravel 8.83)
- **PHP**: 7.4+
- **Base de données**: Neon PostgreSQL (serverless)
- **Authentification**: Laravel Sanctum
- **Images**: Cloudinary
- **Déploiement**: Render

### Frontend (React 18.3)
- **Build**: Vite 5.3
- **UI**: Material UI 6.4 + TailwindCSS 3.4
- **Routing**: React Router 6.24
- **Vidéo**: Agora RTC SDK
- **Déploiement**: Vercel

## Structure Base de Données

### Tables Principales
- **users**: id, name, email, role (patient/doctor/admin/assistant), status, doctor_id
- **doctors**: user_id, specialty, license_number, consultation_fee, available_days, status
- **appointments**: patient_id, doctor_id, date, time, status, type, amount, payment_status, queue_status
- **medical_records**: patient_id, doctor_id, appointment_id, diagnosis, treatment, vitals (JSON)
- **reviews**: patient_id, doctor_id, appointment_id, rating (1-5), comment
- **doctor_availabilities**: doctor_id, date, start_time, end_time, is_available

### Migrations (14 fichiers)
- Users, doctors, appointments, reviews, medical_records
- Ajouts: waiting room, images, prescriptions, city, doctor_id to users

## API Routes

### Publiques
- POST /register, /login
- GET /doctors, /doctors/specialty/{specialty}, /doctors/{id}
- POST /ai/chat

### Protégées (auth:sanctum)
- User: GET /user, POST /logout
- Doctors: profile, stats, upload-image, availabilities, medical-records
- Appointments: CRUD, status updates, queue management
- Medical Records: CRUD, patient history
- AI: POST /ai/book

### Admin (middleware: admin)
- GET /admin/dashboard, /statistics, /users, /appointments
- POST/PUT/DELETE /admin/users
- PATCH /admin/doctors/{id}

## Fonctionnalités Clés

### Rôles
- **Patient**: Recherche médecins, réservation, historique
- **Médecin**: Profil, disponibilités, patients, rendez-vous, dossiers
- **Assistant**: File d'attente, patients, rendez-vous
- **Admin**: Gestion complète (users, doctors, appointments, stats)

### Rendez-vous
- Types: consultation, follow-up, emergency
- Statuts: pending, confirmed, completed, cancelled
- File d'attente avec tracking temps
- Paiement intégré

### IA (MediAI)
- **Backend**: AiController.php (15 KB)
- **Frontend**: MediAI.jsx (22 KB)
- **Model**: NVIDIA Llama 3.1-8B
- **Fonctions**:
  - Analyse symptômes → recommandation spécialité
  - Détection intention réservation (locale, sans appel IA)
  - Parsing dates/heures naturelles
  - Réservation interactive multilingue (FR/EN/AR)
  - Support: "book with Dr. X tomorrow at 11 AM"

## Frontend Structure

### Pages (16)
- Publiques: Home, Login, Register, ListOfDoctors, Appointment, About, Contact
- Patient: MyAppointments
- Admin: Dashboard, Accounts, Appointments, Assistants
- Médecin: Dashboard, Appointments, Patients, Assistants, Settings, Queue, Schedule
- Assistant: Dashboard, Appointments, Patients, Queue

### Composants (40+)
- **IA**: MediAI (chatbot flottant)
- **Assistant**: 11 composants
- **Médecin**: 15 composants
- **UI**: Header, Footer, Navbar, ProtectedRoute
- **Vidéo**: Intégration Agora

## Sécurité
- Laravel Sanctum (tokens API)
- Rôles et permissions
- Middleware personnalisés (admin, admin.or.assistant)
- SSL PostgreSQL
- Validation backend

## Déploiement

### Render (Backend)
- Procfile: `php artisan serve --host 0.0.0.0 --port $PORT`
- Build script: composer install, migrate, cache

### Vercel (Frontend)
- Build: Vite
- Routes: SPA (toutes vers index.html)

## Variables d'Environnement
- DB_CONNECTION=pgsql (Neon)
- NVIDIA_API_KEY
- APP_KEY, APP_URL
- Cloudinary credentials

## Points Forts
1. Architecture moderne (Laravel + React + Neon)
2. IA intégrée avec réservation intelligente
3. Multi-rôles complets
4. Téléconsultation (Agora)
5. Interface moderne (MUI + Tailwind)
6. Sécurité robuste
7. Performance (caching, indexes)
8. Internationalisation (FR/EN/AR)
