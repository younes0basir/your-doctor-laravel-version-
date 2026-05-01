# Your Doctor - Laravel Backend with Neon PostgreSQL

## Requirements

- PHP 8.1+
- Composer
- Neon PostgreSQL account (https://neon.tech)

## Setup

### 1. Install Dependencies

```bash
composer install
```

### 2. Configure Environment

Copy the environment file:

```bash
cp .env.example .env
```

Edit `.env` with your Neon PostgreSQL credentials:

```env
DB_CONNECTION=pgsql
DB_HOST=your-project-id.aws.neon.tech
DB_PORT=5432
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

Or use the Neon connection string:

```env
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"
```

### 3. Generate Application Key

```bash
php artisan key:generate
```

### 4. Run Migrations

```bash
php artisan migrate
```

### 5. Seed Database (Optional)

```bash
php artisan db:seed
```

This creates:
- Admin user: `admin@yourdoctor.com` / `password`
- Sample doctors and patients

### 6. Start Development Server

```bash
php artisan serve
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user (authenticated)
- `GET /api/user` - Get current user (authenticated)

### Users (Authenticated)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/{id}` - Get user details
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Doctors (Authenticated)
- `GET /api/doctors` - List doctors
- `POST /api/doctors` - Create doctor
- `GET /api/doctors/{id}` - Get doctor details
- `PUT /api/doctors/{id}` - Update doctor
- `DELETE /api/doctors/{id}` - Delete doctor
- `GET /api/doctors/specialty/{specialty}` - Get doctors by specialty

### Appointments (Authenticated)
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Book appointment
- `GET /api/appointments/{id}` - Get appointment details
- `PUT /api/appointments/{id}` - Update appointment
- `PATCH /api/appointments/{id}/status` - Update appointment status
- `DELETE /api/appointments/{id}` - Cancel appointment
- `GET /api/my-appointments` - Get current user's appointments

### Admin Routes (Admin only)
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/accounts` - List all accounts
- `GET /api/admin/appointments` - List all appointments
- `GET /api/admin/statistics` - Get detailed statistics

## Neon PostgreSQL Features

This backend is optimized for Neon PostgreSQL:

- **Serverless Scaling**: Auto-scales with your traffic
- **Branching**: Create database branches for development
- **Point-in-time Restore**: Built-in backup/restore
- **Connection Pooling**: Efficient connection management
- **SSL Required**: Secure connections by default

## Project Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/   # API Controllers
│   │   └── Middleware/        # Custom Middleware
│   └── Models/                # Eloquent Models
├── config/                    # Configuration files
├── database/
│   └── migrations/           # Database migrations
├── routes/
│   ├── api.php               # API routes
│   └── web.php               # Web routes
├── .env.example              # Environment template
├── composer.json             # PHP dependencies
└── README.md                 # This file
```

## License

MIT
