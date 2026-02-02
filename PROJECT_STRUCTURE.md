# CATS Application - Complete Project Structure

This document shows the complete file structure for the CATS (Customer AI Tracking System) application.

## Project Structure

```
cats-app/
├── .gitignore                          # Git ignore file
├── README.md                           # Main project README
├── DEPLOYMENT_GUIDE_GITHUB.md          # Deployment instructions
│
├── frontend/                           # React frontend application
│   ├── public/
│   │   └── index.html                  # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── CustomerLookup.js       # Customer search and view UI
│   │   │   └── CustomerInput.js        # New customer input form
│   │   ├── App.js                      # Main app with routing
│   │   ├── index.js                    # React entry point
│   │   └── index.css                   # Tailwind CSS
│   ├── package.json                    # Frontend dependencies
│   ├── tailwind.config.js              # Tailwind configuration
│   ├── postcss.config.js               # PostCSS configuration
│   └── README.md                       # Frontend README
│
├── backend/                            # Node.js/Express backend
│   ├── server.js                       # Main API server
│   ├── package.json                    # Backend dependencies
│   ├── .env.example                    # Environment variables template
│   └── (create .env here)              # Your actual .env (not in git)
│
├── database/                           # Database schemas
│   └── schema.sql                      # PostgreSQL database schema
│
└── scripts/                            # Utility scripts
    └── update-cats.sh                  # Deployment update script
```

## File Descriptions

### Root Level Files

**`.gitignore`**
- Prevents sensitive files from being committed to Git
- Excludes: node_modules, .env files, build artifacts, logs, etc.

**`README.md`**
- Main project documentation
- Features overview
- Tech stack details
- Quick start guide
- API endpoint documentation

**`DEPLOYMENT_GUIDE_GITHUB.md`**
- Complete AWS EC2 deployment instructions
- Step-by-step setup guide
- PostgreSQL and pgAdmin installation
- Nginx configuration
- SSL setup with Let's Encrypt

### Frontend Directory

**`frontend/package.json`**
- React dependencies
- Scripts: start, build, test
- Proxy configuration for API calls

**`frontend/src/App.js`**
- Main application component
- React Router setup
- Navigation between Customer Lookup and New Customer pages

**`frontend/src/components/CustomerLookup.js`**
- Customer search interface
- View customer details and applications
- Edit/delete applications
- API integration for fetching customer data

**`frontend/src/components/CustomerInput.js`**
- New customer form
- Multi-select bubbles for models, services, vendors
- Custom input capability
- Meeting notes with auto timestamps
- API integration for creating customers

**`frontend/tailwind.config.js` & `postcss.config.js`**
- Tailwind CSS configuration
- Enables utility-first CSS styling

### Backend Directory

**`backend/server.js`**
- Express.js API server
- Database connection pooling
- REST API endpoints:
  - GET/POST/PUT/DELETE for customers
  - Meeting notes management
  - Customer search
- Transaction support for data integrity

**`backend/package.json`**
- Node.js dependencies: express, pg, cors, dotenv
- Scripts: start, dev (with nodemon)

**`backend/.env.example`**
- Template for environment variables
- Copy to `.env` and fill in your values:
  - Database credentials
  - Server port

### Database Directory

**`database/schema.sql`**
- Complete PostgreSQL schema
- Tables: customers, applications, modalities, foundational_models, cloud_services, compute_vendors, meeting_notes
- Indexes for performance
- Triggers for updated_at timestamps
- Sample data for testing

### Scripts Directory

**`scripts/update-cats.sh`**
- Automated deployment update script
- Pulls latest code from GitHub
- Installs dependencies
- Rebuilds frontend
- Restarts backend
- Optional database schema updates

## How Files Work Together

### Development Flow:
1. **Frontend** (React) runs on `localhost:3000`
2. **Backend** (Express) runs on `localhost:3001`
3. Frontend proxies API calls to backend via `package.json` proxy setting
4. **Database** (PostgreSQL) runs locally
5. Frontend components call backend API endpoints
6. Backend queries PostgreSQL and returns JSON

### Production Flow:
1. Frontend built to static files (`npm run build`)
2. Static files served by **Nginx** from `/var/www/cats`
3. Backend runs as PM2 service on port 3001
4. Nginx proxies `/api/*` requests to backend
5. PostgreSQL runs as system service
6. Everything accessible via `http://your-domain.com`

## Setting Up the Project

### 1. Clone from GitHub:
```bash
git clone https://github.com/yourusername/cats-app.git
cd cats-app
```

### 2. Setup Backend:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm start
```

### 3. Setup Database:
```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE cats_db;
CREATE USER cats_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE cats_db TO cats_user;
\q

# Load schema
psql -U cats_user -d cats_db -f database/schema.sql
```

### 4. Setup Frontend:
```bash
cd frontend
npm install
npm start
```

### 5. Access the Application:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001/api/health`

## Deploying to Production

Follow the complete guide in `DEPLOYMENT_GUIDE_GITHUB.md`

Quick summary:
1. Push code to GitHub
2. Launch EC2 instance
3. Clone repository
4. Install PostgreSQL, Node.js, Nginx
5. Setup database, backend, frontend
6. Configure Nginx to serve frontend and proxy API
7. (Optional) Setup SSL with Let's Encrypt

## Updating Production

After making changes and pushing to GitHub:

```bash
ssh ubuntu@your-ec2-ip
cd cats-app
./scripts/update-cats.sh
```

## Technology Choices

### Why PostgreSQL?
- Free and open source
- Robust relational database
- Excellent for structured data with relationships
- pgAdmin provides great visual management
- Easy to backup and restore

### Why Node.js + Express?
- JavaScript on both frontend and backend
- Large ecosystem of packages
- Easy to learn and maintain
- Great for REST APIs
- Excellent PostgreSQL support with `pg` library

### Why React?
- Component-based architecture
- Easy state management
- Large community and resources
- Works well with Tailwind CSS
- Fast development with hot reloading

### Why Nginx?
- Fast static file serving
- Excellent reverse proxy
- Easy SSL setup
- Industry standard
- Low resource usage

## Security Considerations

✅ `.env` files excluded from Git
✅ Database credentials stored in environment variables
✅ CORS configured in backend
✅ SSL recommended for production (via Let's Encrypt)
✅ PostgreSQL user has limited permissions
✅ PM2 handles process crashes and restarts

## Cost Estimate

Running on AWS EC2:
- **t3.medium instance**: ~$30-35/month
- **30GB storage**: ~$3/month
- **Total**: ~$35-40/month

Can use t3.small (~$15/month) for lighter workloads.

## Future Enhancements

Potential additions:
- User authentication (JWT)
- Role-based access control
- Export to CSV/Excel
- Analytics dashboard
- Email notifications
- Automated S3 backups
- Docker containerization
- CI/CD with GitHub Actions

---

**Questions?** Refer to:
- `README.md` - General information
- `DEPLOYMENT_GUIDE_GITHUB.md` - Deployment steps
- `frontend/README.md` - Frontend specifics
- Backend API endpoint documentation in main README
