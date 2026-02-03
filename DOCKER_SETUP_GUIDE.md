# CATS Docker Setup - Complete Guide

## Directory Structure

Your final cats-app directory should look like this:

```
cats-app/
├── docker-compose.yml          ← Goes in ROOT
├── DOCKER_README.md           ← Goes in ROOT (optional)
├── .gitignore                 ← Already exists
├── README.md                  ← Already exists
│
├── database/
│   └── schema.sql             ← Already exists
│
├── frontend/
│   ├── Dockerfile             ← NEW FILE (download FRONTEND-Dockerfile, rename to Dockerfile)
│   ├── nginx.conf             ← NEW FILE (download FRONTEND-nginx.conf)
│   ├── .dockerignore          ← NEW FILE (download FRONTEND-dockerignore, rename to .dockerignore)
│   ├── package.json           ← Already exists
│   ├── package-lock.json      ← Already exists
│   ├── tailwind.config.js     ← Already exists
│   ├── postcss.config.js      ← Already exists
│   ├── public/
│   │   └── index.html         ← Already exists
│   └── src/
│       ├── App.js             ← Already exists
│       ├── index.js           ← Already exists
│       ├── index.css          ← Already exists
│       └── components/
│           ├── CustomerLookup.js  ← Already exists
│           └── CustomerInput.js   ← Already exists
│
└── backend/
    ├── Dockerfile             ← NEW FILE (download BACKEND-Dockerfile, rename to Dockerfile)
    ├── .dockerignore          ← NEW FILE (download BACKEND-dockerignore, rename to .dockerignore)
    ├── server.js              ← Already exists
    ├── package.json           ← Already exists
    ├── package-lock.json      ← Already exists
    └── .env.example           ← Already exists
```

## Step-by-Step Setup

### 1. Clone your GitHub repo (if you haven't already on your local machine)

```bash
cd ~/
git clone https://github.com/jlunde-cisco/cats-app.git
cd cats-app
```

### 2. Download the 7 Docker files from Claude

You'll download these files:
- ROOT-docker-compose.yml
- FRONTEND-Dockerfile
- FRONTEND-nginx.conf
- FRONTEND-dockerignore
- BACKEND-Dockerfile
- BACKEND-dockerignore
- DOCKER_SETUP_GUIDE.md (this file)

### 3. Place files in correct locations

```bash
# From your cats-app directory:

# ROOT files (rename when copying)
cp ~/Downloads/ROOT-docker-compose.yml ./docker-compose.yml

# FRONTEND files (rename when copying)
cp ~/Downloads/FRONTEND-Dockerfile ./frontend/Dockerfile
cp ~/Downloads/FRONTEND-nginx.conf ./frontend/nginx.conf
cp ~/Downloads/FRONTEND-dockerignore ./frontend/.dockerignore

# BACKEND files (rename when copying)
cp ~/Downloads/BACKEND-Dockerfile ./backend/Dockerfile
cp ~/Downloads/BACKEND-dockerignore ./backend/.dockerignore
```

### 4. Start Docker Desktop

Make sure Docker Desktop is running (check for whale icon in menu bar)

### 5. Build and run

```bash
cd ~/cats-app
docker-compose up -d
```

This will:
1. Pull PostgreSQL image
2. Build frontend image (takes ~2-3 min first time)
3. Build backend image (takes ~1 min first time)
4. Start all containers
5. Initialize database with schema.sql

### 6. Access the application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3001/api/health
- **Database**: localhost:5432 (user: cats_user, password: Cisco123#)

### 7. Monitor logs

```bash
# All services
docker-compose logs -f

# Just backend
docker-compose logs -f backend

# Just frontend
docker-compose logs -f frontend

# Just database
docker-compose logs -f postgres
```

### 8. Stop everything

```bash
docker-compose down
```

### 9. Stop and delete all data (fresh start)

```bash
docker-compose down -v
```

## Troubleshooting

### "unable to prepare context: path not found"
You're in the wrong directory or files aren't placed correctly. Run:
```bash
ls -la
# Should see docker-compose.yml, frontend/, backend/, database/
```

### Backend can't connect to database
```bash
# Check database is healthy
docker-compose ps

# View database logs
docker-compose logs postgres

# Grant permissions manually if needed
docker exec -it cats-db psql -U postgres -d cats_db -c "
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cats_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cats_user;
"
```

### Frontend shows blank page
```bash
# Check nginx is running
docker-compose ps

# View frontend logs
docker-compose logs frontend

# Check nginx config loaded correctly
docker exec -it cats-frontend cat /etc/nginx/conf.d/default.conf
```

### Need to rebuild after code changes
```bash
# Rebuild specific service
docker-compose up -d --build backend

# Rebuild everything
docker-compose up -d --build
```

## Next Steps

Once this works locally:
1. Push code + Docker files to GitHub
2. Create Kubernetes manifests
3. Build Helm chart
4. Deploy to EKS/GKE/local cluster

## File Download Checklist

- [ ] ROOT-docker-compose.yml → docker-compose.yml (root)
- [ ] FRONTEND-Dockerfile → frontend/Dockerfile
- [ ] FRONTEND-nginx.conf → frontend/nginx.conf
- [ ] FRONTEND-dockerignore → frontend/.dockerignore
- [ ] BACKEND-Dockerfile → backend/Dockerfile
- [ ] BACKEND-dockerignore → backend/.dockerignore
- [ ] Existing code already in place (src/, server.js, schema.sql, etc.)
