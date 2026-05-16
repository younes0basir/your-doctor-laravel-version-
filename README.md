# YourDoctor (MediAI Concierge) 🏥

[![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Neon PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech)

**YourDoctor** est une plateforme de gestion de soins de santé moderne qui connecte médecins, assistants médicaux et patients. Elle propose une interface multi-rôles, la gestion des rendez-vous et un tableau de bord administratif.

Ce projet inclut :
- un backend Laravel avec API REST sécurisée pour l’authentification, la gestion des rendez-vous, des médecins, des patients et des reviews ;
- un frontend React/Vite avec Tailwind CSS pour une interface réactive et conviviale ;
- une organisation de rôles complète (admin, médecin, patient) avec contrôles d’accès et vues adaptées ;
- des pages de consultation et de gestion des dossiers médicaux, des plannings et des statuts de file d’attente.

---
## 👥 Development Team

- **Zoubaa** - [GitHub Profile](https://github.com/zoubaax)
- **Younes Basir** - [GitHub Profile](https://github.com/younes0basir)


---

## 🚀 Installation et démarrage

### Prérequis
- PHP 8.2 ou supérieur
- Composer
- Node.js 18 ou supérieur
- NPM
- PostgreSQL local ou Neon PostgreSQL

### 1. Installation du backend
```bash
cd backend
composer install
cp .env.example .env
```

- Ouvrez `backend/.env`
- Configurez `DATABASE_URL` ou les variables :
  - `DB_HOST`
  - `DB_PORT`
  - `DB_DATABASE`
  - `DB_USERNAME`
  - `DB_PASSWORD`

```bash
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

Le backend sera disponible sur `http://127.0.0.1:8000`.

### 2. Installation du frontend
```bash
cd frontend
npm install
npm run dev
```

Le frontend sera disponible sur l’adresse affichée par Vite, généralement `http://127.0.0.1:5173`.

### 3. Utilisation
- Lancez d’abord le backend.
- Ensuite lancez le frontend.
- Connectez-vous avec un compte de test.

---

## 👤 Comptes de test

| Rôle | Email | Mot de passe |
| --- | --- | --- |
| Administrateur | `admin@yourdoctor.com` | `password` |
| Médecin | `dr.dupont@yourdoctor.com` | `password` |
| Médecin | `dr.martin@yourdoctor.com` | `password` |
| Médecin | `dr.bernard@yourdoctor.com` | `password` |
| Patient | `itsmezoubaa@gmail.com` | `itsmezoubaa@gmail.com` |
| Patient | `sophie@email.com` | `password` |
| Patient | `lucas@email.com` | `password` |
| Patient | `emma@email.com` | `password` |

> Les médecins et patients sont créés avec le mot de passe `password` par défaut.

---

## 🧩 Fonctionnalités principales

- Tableau de bord médecin avec gestion des rendez-vous et file d’attente.
- Portail assistant pour la prise en charge des patients.
- Console administrateur pour la gestion des comptes et des statistiques.
- Intégration d’API médicales et planification en temps réel.

---

## 🛠️ Stack technique

| Composant | Technologie |
| :--- | :--- |
| Backend | Laravel 10+, PHP 8.2 |
| Frontend | React 18, Vite, Tailwind CSS |
| Base de données | PostgreSQL / Neon |
| Gestion d’état | React Context API |
| Animations | Framer Motion |
| Graphiques | Chart.js, Recharts |
| Planning | FullCalendar.js |

---

## 📄 Licence
Ce projet est destiné à un usage académique et est distribué sous licence MIT.


