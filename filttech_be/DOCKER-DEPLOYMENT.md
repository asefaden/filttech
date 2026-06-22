# Docker Deployment Guide

This Dockerfile is a standalone, production-ready configuration for your Laravel Filtech application.

## Features

- ✅ **Multi-stage build** - Optimized image size
- ✅ **PHP 8.2 FPM** - With all required extensions (intl, redis, gd, etc.)
- ✅ **Nginx** - Built-in web server
- ✅ **Supervisor** - Process management for PHP-FPM, Nginx, and Queue Worker
- ✅ **Queue Worker** - Background job processing
- ✅ **Health Check** - Built-in health monitoring
- ✅ **Production optimized** - Composer autoload optimization, asset compilation

## Build the Image

```bash
docker build -t filtech-app:latest .
```

## Run the Container

### Basic Run (for testing)
```bash
docker run -d \
  --name filtech \
  -p 8000:80 \
  -e DB_HOST=your-db-host \
  -e DB_DATABASE=fintech \
  -e DB_USERNAME=systemadmin \
  -e DB_PASSWORD=9055word1! \
  filtech-app:latest
```

### Production Run (with all environment variables)
```bash
docker run -d \
  --name filtech \
  -p 80:80 \
  -e APP_NAME=Filtech \
  -e APP_ENV=production \
  -e APP_KEY=base64:KXrBuf+R0XeqX/ETwZjgVEL+hxUvcObwxFxwfFRWfQg= \
  -e APP_DEBUG=false \
  -e APP_URL=https://your-domain.com \
  -e DB_CONNECTION=mysql \
  -e DB_HOST=your-db-host \
  -e DB_PORT=3306 \
  -e DB_DATABASE=fintech \
  -e DB_USERNAME=systemadmin \
  -e DB_PASSWORD=9055word1! \
  -e SESSION_DRIVER=database \
  -e CACHE_STORE=database \
  -e QUEUE_CONNECTION=database \
  -v /path/to/storage:/var/www/html/storage \
  filtech-app:latest
```

## Jenkins Pipeline Example

```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'filtech-app'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                    docker.build("${DOCKER_IMAGE}:latest")
                }
            }
        }
        
        stage('Run Migrations') {
            steps {
                script {
                    sh """
                        docker run --rm \
                          -e DB_HOST=${DB_HOST} \
                          -e DB_DATABASE=${DB_DATABASE} \
                          -e DB_USERNAME=${DB_USERNAME} \
                          -e DB_PASSWORD=${DB_PASSWORD} \
                          ${DOCKER_IMAGE}:${DOCKER_TAG} \
                          php artisan migrate --force
                    """
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    sh """
                        docker stop filtech || true
                        docker rm filtech || true
                        docker run -d \
                          --name filtech \
                          -p 80:80 \
                          -e APP_ENV=production \
                          -e APP_KEY=${APP_KEY} \
                          -e DB_HOST=${DB_HOST} \
                          -e DB_DATABASE=${DB_DATABASE} \
                          -e DB_USERNAME=${DB_USERNAME} \
                          -e DB_PASSWORD=${DB_PASSWORD} \
                          -v /var/filtech/storage:/var/www/html/storage \
                          ${DOCKER_IMAGE}:${DOCKER_TAG}
                    """
                }
            }
        }
    }
}
```

## Post-Deployment Commands

### Run Migrations
```bash
docker exec filtech php artisan migrate --force
```

### Clear Cache
```bash
docker exec filtech php artisan cache:clear
docker exec filtech php artisan config:clear
docker exec filtech php artisan route:clear
docker exec filtech php artisan view:clear
```

### Create Storage Link
```bash
docker exec filtech php artisan storage:link
```

### View Logs
```bash
docker logs -f filtech
```

## Environment Variables

Required environment variables:
- `APP_KEY` - Laravel application key
- `DB_HOST` - Database host
- `DB_DATABASE` - Database name
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password

Optional environment variables:
- `APP_ENV` - Application environment (default: production)
- `APP_DEBUG` - Debug mode (default: false)
- `APP_URL` - Application URL
- `SESSION_DRIVER` - Session driver (default: database)
- `CACHE_STORE` - Cache store (default: database)
- `QUEUE_CONNECTION` - Queue connection (default: database)

## Notes

1. **Database**: This container does NOT include a database. You need to provide an external MySQL database.
2. **Storage**: Mount a volume to `/var/www/html/storage` for persistent file storage.
3. **Port**: The container exposes port 80. Map it to your desired host port.
4. **Health Check**: The container includes a health check endpoint at `/up`.
5. **Queue Worker**: A queue worker is automatically started via Supervisor.

## Troubleshooting

### Check if services are running
```bash
docker exec filtech supervisorctl status
```

### Restart a service
```bash
docker exec filtech supervisorctl restart php-fpm
docker exec filtech supervisorctl restart nginx
docker exec filtech supervisorctl restart queue-worker
```

### Access container shell
```bash
docker exec -it filtech sh
```

