# Quick Start - Setting Up Your GitHub Repository

This guide will help you organize the CATS files and push them to GitHub.

## Step 1: Organize Your Files

Create this directory structure on your local machine:

```
cats-app/
├── .gitignore
├── README.md
├── DEPLOYMENT_GUIDE_GITHUB.md
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── CustomerLookup.js
│   │   │   └── CustomerInput.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── README.md
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── database/
│   └── schema.sql
└── scripts/
    └── update-cats.sh
```

## Step 2: Create GitHub Repository

1. Go to https://github.com
2. Click "New repository"
3. Name it: `cats-app` (or whatever you prefer)
4. Don't initialize with README (we already have one)
5. Click "Create repository"

## Step 3: Initialize Git and Push

Open terminal in your `cats-app` directory:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - CATS application"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/cats-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Verify on GitHub

Go to your repository on GitHub and verify all files are there:
- ✅ frontend/ directory with all React files
- ✅ backend/ directory with server.js
- ✅ database/ directory with schema.sql
- ✅ scripts/ directory with update-cats.sh
- ✅ Root files: README.md, .gitignore, DEPLOYMENT_GUIDE_GITHUB.md

## Step 5: Deploy to AWS EC2

Now you can follow the `DEPLOYMENT_GUIDE_GITHUB.md` instructions:

```bash
# On your EC2 instance
git clone https://github.com/YOUR_USERNAME/cats-app.git
cd cats-app
# Follow the deployment guide...
```

## Important Notes

### ⚠️ Before Pushing to GitHub:

1. **Never commit .env files!**
   - Your `.gitignore` already prevents this
   - But double-check: `git status` should NOT show `.env` files

2. **Update the README**
   - Replace `yourusername` with your actual GitHub username
   - Update any project-specific details

3. **Make update-cats.sh executable**
   ```bash
   chmod +x scripts/update-cats.sh
   ```

### 🔐 Security Checklist:

- ✅ `.env` files in `.gitignore`
- ✅ No hardcoded passwords in any files
- ✅ `.env.example` only has placeholder values
- ✅ Database credentials will be configured on the server

## What Each Directory Contains

### `frontend/`
Your React application with two main pages:
- **CustomerLookup** - Search and view customers
- **CustomerInput** - Add new customers

### `backend/`
Your Node.js/Express API server that connects to PostgreSQL

### `database/`
PostgreSQL schema with all tables and sample data

### `scripts/`
Helper scripts for deployment and updates

## After Deployment

Once deployed, you can update your application by:

```bash
# On your local machine, make changes and push:
git add .
git commit -m "Your change description"
git push origin main

# On your EC2 instance:
ssh ubuntu@your-ec2-ip
cd cats-app
./scripts/update-cats.sh
```

## Testing Locally Before Deployment

Before deploying to AWS, test everything locally:

### 1. Start PostgreSQL locally
```bash
# Install PostgreSQL on your machine
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql

# Create database
psql postgres
CREATE DATABASE cats_db;
CREATE USER cats_user WITH PASSWORD 'testpassword';
GRANT ALL PRIVILEGES ON DATABASE cats_db TO cats_user;
\q

# Load schema
psql -U cats_user -d cats_db -f database/schema.sql
```

### 2. Start Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with local database credentials
npm start
# Backend should run on http://localhost:3001
```

### 3. Start Frontend
```bash
cd frontend
npm install
npm start
# Frontend should open at http://localhost:3000
```

### 4. Test the Application
- Open http://localhost:3000
- Try creating a new customer
- Try searching for customers
- Verify data is saved to PostgreSQL

## Troubleshooting

### "permission denied" when running update-cats.sh
```bash
chmod +x scripts/update-cats.sh
```

### Frontend can't connect to backend
- Check backend is running: `curl http://localhost:3001/api/health`
- Verify proxy setting in frontend/package.json

### Database connection errors
- Check PostgreSQL is running
- Verify credentials in backend/.env
- Test connection: `psql -U cats_user -d cats_db -h localhost`

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Follow deployment guide
3. ✅ Access your application
4. 🎉 Start tracking customer AI deployments!

## Getting Help

- Check `README.md` for general info
- See `DEPLOYMENT_GUIDE_GITHUB.md` for deployment
- Review `PROJECT_STRUCTURE.md` for file organization
- Backend logs: `pm2 logs cats-api`
- Frontend build errors: Check browser console

---

**Ready to deploy?** Head to `DEPLOYMENT_GUIDE_GITHUB.md`!
