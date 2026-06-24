# FiltTech

A full-stack educational platform connecting students with experts through courses, appointments, and interactive learning experiences.

## Tech Stack

### Backend (`filttech_be/`)

| Technology | Version | Purpose |
|------------|---------|---------|
| PHP | ^8.2 | Runtime |
| Laravel | ^12.0 | Framework |
| Filament | ^4.2 | Admin Panel |
| Livewire | ^3.6 | Reactive UI Components |
| Laravel Sanctum | ^4.0 | API Token Authentication |
| JWT Auth (tymon) | ^2.2 | JWT Authentication |
| Spatie Permission | ^6.23 | Role & Permission Management |
| Spatie Media Library | ^11.17 | File/Media Management |
| Spatie Activity Log | ^4.10 | Audit Logging |
| MySQL | 8.x | Database |
| Pest | ^4.1 | Testing |

### Frontend (`filttech_fe/`)

| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | ^20.3 | Framework |
| Tailwind CSS | ^4.1 | Styling |
| RxJS | ~7.8 | Reactive Programming |
| SweetAlert2 | ^11.26 | Notifications/Dialogs |
| date-fns | ^4.1 | Date Utilities |
| TypeScript | ~5.9 | Type Safety |

## Project Structure

```
filttech/
├── filttech_be/                 # Laravel Backend
│   ├── app/
│   │   ├── Actions/            # Action classes
│   │   ├── Filament/           # Admin panel resources & widgets
│   │   │   ├── Resources/      # CRUD resources (Users, Courses, Books, etc.)
│   │   │   └── Widgets/        # Dashboard widgets (charts, stats)
│   │   ├── Http/Controllers/   # API Controllers
│   │   ├── Models/             # Eloquent Models
│   │   ├── Notifications/      # Notification classes
│   │   ├── Observers/          # Model observers
│   │   ├── Services/           # Business logic services
│   │   └── Rules/              # Custom validation rules
│   ├── config/                 # Configuration files
│   ├── database/
│   │   ├── migrations/         # Database migrations
│   │   └── seeders/            # Database seeders
│   ├── k8s/                    # Kubernetes deployment manifests
│   ├── routes/                 # API routes
│   ├── Dockerfile              # Multi-stage Docker build
│   ├── Jenkinsfile             # CI/CD pipeline
│   └── docker-entrypoint.sh    # Container entrypoint script
│
├── filttech_fe/                # Angular Frontend
│   ├── src/app/
│   │   ├── auth/               # Authentication (login modal)
│   │   ├── core/               # Core services & interceptors
│   │   ├── features/
│   │   │   ├── admin/          # Admin dashboard
│   │   │   ├── expert/         # Expert features (dashboard, schedule, requests, rating, profile)
│   │   │   └── student/        # Student features (courses, books, blogs, experts, profile)
│   │   ├── landing/            # Landing page
│   │   ├── layouts/            # Layout components
│   │   └── shared/             # Shared components
│   ├── Dockerfile              # Multi-stage Docker build
│   └── nginx.conf              # Nginx configuration
│
└── README.md
```

## Features

### Authentication & Authorization
- JWT-based authentication with OTP verification
- Social login (Google, Facebook)
- Role-based access control: **Admin**, **Expert**, **Student**
- Password reset and change functionality

### Student Features
- Browse courses by category with ratings and favorites
- Course detail pages with about and comments tabs
- Browse and read blog posts
- Browse books library
- View expert profiles and schedules
- Request appointments with experts
- Track accepted appointments
- User profile management

### Expert Features
- Dashboard with status overview, upcoming/new appointments, and recent activity
- Manage availability schedules
- View and respond to appointment requests
- Rating system with student feedback
- Profile management

### Admin Features (Filament Panel)
- **User Management** — CRUD operations, view user status
- **Course Management** — Create, edit, and organize courses with sections
- **Book Management** — Manage the books library
- **Category Management** — Organize content by categories
- **Post Management** — Manage blog posts
- **Section Management** — Manage course sections
- **Feedback Management** — View and manage user feedback
- **Dashboard Widgets** — User growth charts, appointment growth charts, content status overview, user status overview

### API Endpoints

**Public Routes:**
- `POST /api/login` — User login
- `POST /api/subscribe` — User registration
- `GET /api/top-categories` — Top categories
- `GET /api/popular-courses` — Popular courses
- `GET /api/popular-experts` — Popular experts
- `GET /api/latest-posts` — Latest posts

**Authenticated Routes:**
- Course, Book, Post, Category, Expert, Section CRUD
- User interactions (rate courses, favorite courses, expert interactions)
- Appointment scheduling and management
- Notifications management
- Activity logs
- Profile management

## Prerequisites

- **PHP** >= 8.2
- **Composer** >= 2.x
- **Node.js** >= 20.x
- **MySQL** >= 8.x
- **Docker** (optional, for containerized deployment)

## Local Development Setup

### Backend

```bash
cd filttech_be

# Install PHP dependencies
composer install

# Copy environment file and generate app key
cp .env.example .env
php artisan key:generate

# Configure database in .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=filttech
# DB_USERNAME=your_username
# DB_PASSWORD=your_password

# Run migrations and seeders
php artisan migrate --seed

# Start the development server
php artisan serve
```

### Frontend

```bash
cd filttech_fe

# Install dependencies
npm install

# Start the development server
ng serve
```

The frontend will be available at `http://localhost:4200` and the backend API at `http://localhost:8000`.

### Quick Setup (Backend)

```bash
cd filttech_be
composer setup
```

This runs `composer install`, copies `.env`, generates the app key, runs migrations, and builds frontend assets.

### Full Stack Development

```bash
cd filttech_be
composer dev
```

This starts the Laravel server, queue worker, and Vite dev server concurrently.

## Docker Deployment

### Build and Run Backend

```bash
cd filttech_be

# Build the image
docker build -t filtech-be:latest .

# Run the container
docker run -d \
  --name filtech-be \
  -p 8000:80 \
  -e APP_KEY=your-app-key \
  -e DB_HOST=your-db-host \
  -e DB_DATABASE=filttech \
  -e DB_USERNAME=your-db-user \
  -e DB_PASSWORD=your-db-password \
  filtech-be:latest
```

### Build and Run Frontend

```bash
cd filttech_fe

# Build the image
docker build -t filtech-fe:latest .

# Run the container
docker run -d \
  --name filtech-fe \
  -p 4200:80 \
  filtech-fe:latest
```

### Post-Deployment

```bash
# Run migrations
docker exec filtech-be php artisan migrate --force

# Clear caches
docker exec filtech-be php artisan cache:clear
docker exec filtech-be php artisan config:clear
docker exec filtech-be php artisan route:clear

# Create storage link
docker exec filtech-be php artisan storage:link

# Check service status
docker exec filtech-be supervisorctl status
```

## Kubernetes Deployment

Kubernetes manifests are available in `filttech_be/k8s/`:

```bash
kubectl apply -f filttech_be/k8s/deploy.yaml
```

## CI/CD

Jenkins pipelines are configured for both backend and frontend:

- `filttech_be/Jenkinsfile` — Builds and pushes the backend Docker image to a local registry
- `filttech_fe/Jenkinsfile` — Builds and pushes the frontend Docker image

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `APP_KEY` | Yes | Laravel application key |
| `DB_HOST` | Yes | MySQL database host |
| `DB_PORT` | No | MySQL port (default: 3306) |
| `DB_DATABASE` | Yes | Database name |
| `DB_USERNAME` | Yes | Database username |
| `DB_PASSWORD` | Yes | Database password |
| `APP_ENV` | No | Environment (default: local) |
| `APP_DEBUG` | No | Debug mode (default: true) |
| `APP_URL` | No | Application URL |
| `SESSION_DRIVER` | No | Session driver (default: database) |
| `CACHE_STORE` | No | Cache store (default: database) |
| `QUEUE_CONNECTION` | No | Queue connection (default: database) |

## Testing

```bash
# Backend tests
cd filttech_be
composer test

# Frontend tests
cd filttech_fe
ng test
```

## License

This project is licensed under the MIT License.