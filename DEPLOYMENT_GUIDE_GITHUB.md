# CATS Deployment Guide - AWS EC2 (GitHub Method)

## Architecture Overview

### Single VM Setup (Recommended for Getting Started)
- 1 EC2 Instance running:
  - Frontend (React - served via Nginx)
  - Backend API (Node.js/Express)
  - PostgreSQL Database

---

## Prerequisites
- AWS Account
- SSH key pair for EC2 access
- GitHub account with your CATS repository
- Domain name (optional, for custom URL)

---

## GitHub Repository Structure

Your repository should look like this:
```
cats-app/
├── frontend/
│   ├── src/
│   │   ├── cats-ui.jsx
│   │   ├── cats-input-form.jsx
│   │   └── ... (other React files)
│   ├── package.json
│   └── public/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── database/
│   └── schema.sql
└── README.md
```

---

## STEP 1: Prepare Your GitHub Repository

### On your local machine:

```bash
# Create the repository structure
mkdir cats-app
cd cats-app

# Create directories
mkdir frontend backend database

# Move your files into the structure
# frontend/ - Your React app files
# backend/ - server.js, package.json, .env.example
# database/ - database-schema.sql

# Initialize git
git init
git add .
git commit -m "Initial CATS application"

# Create .gitignore
cat > .gitignore << EOF
# Dependencies
node_modules/
frontend/node_modules/
backend/node_modules/

# Environment variables
.env
backend/.env
frontend/.env

# Build files
frontend/build/
frontend/dist/

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
EOF

git add .gitignore
git commit -m "Add gitignore"

# Push to GitHub
git remote add origin https://github.com/yourusername/cats-app.git
git branch -M main
git push -u origin main
```

---

## STEP 2: Launch EC2 Instance

### EC2 Configuration:
- **AMI**: Ubuntu 22.04 LTS
- **Instance Type**: t3.medium (2 vCPU, 4GB RAM)
- **Storage**: 30GB SSD
- **Security Group Rules**:
  ```
  SSH (22) - Your IP only
  HTTP (80) - 0.0.0.0/0
  HTTPS (443) - 0.0.0.0/0
  API (3001) - 0.0.0.0/0 (for testing, remove in production)
  ```

---

## STEP 3: Initial Server Setup

### SSH into your EC2 instance:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Update system:
```bash
sudo apt update
sudo apt upgrade -y
```

### Install Git:
```bash
sudo apt install git -y
```

---

## STEP 4: Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE cats_db;
CREATE USER cats_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE cats_db TO cats_user;
ALTER DATABASE cats_db OWNER TO cats_user;
\q
EOF
```

---

## STEP 5: Clone Repository and Setup Database

```bash
# Clone your repository
cd /home/ubuntu
git clone https://github.com/yourusername/cats-app.git
cd cats-app

# Load database schema
sudo -u postgres psql -d cats_db -f database/schema.sql

# Or if you need to use the cats_user:
psql -U cats_user -d cats_db -h localhost -f database/schema.sql
# (Enter password when prompted)
```

---

## STEP 6: Install pgAdmin (Database Management UI)

```bash
# Add pgAdmin repository
curl -fsS https://www.pgadmin.org/static/packages_pgadmin_org.pub | sudo gpg --dearmor -o /usr/share/keyrings/packages-pgadmin-org.gpg

sudo sh -c 'echo "deb [signed-by=/usr/share/keyrings/packages-pgadmin-org.gpg] https://ftp.postgresql.org/pub/pgadmin/pgadmin4/apt/$(lsb_release -cs) pgadmin4 main" > /etc/apt/sources.list.d/pgadmin4.list'

# Install pgAdmin
sudo apt update
sudo apt install pgadmin4-web -y

# Configure pgAdmin (will prompt for email and password)
sudo /usr/pgadmin4/bin/setup-web.sh
```

**Access pgAdmin**: `http://your-ec2-ip/pgadmin4`

### Connect to Database in pgAdmin:
1. Login to pgAdmin web interface
2. Add New Server:
   - **Name**: CATS Database
   - **Host**: localhost
   - **Port**: 5432
   - **Database**: cats_db
   - **Username**: cats_user
   - **Password**: your_secure_password

---

## STEP 7: Install Node.js and Setup Backend

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y

# Verify installation
node --version
npm --version

# Navigate to backend directory
cd /home/ubuntu/cats-app/backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env
nano .env
```

**Configure .env**:
```env
DB_USER=cats_user
DB_HOST=localhost
DB_NAME=cats_db
DB_PASSWORD=your_secure_password
DB_PORT=5432
PORT=3001
```

### Test the backend:
```bash
npm start
```

Visit: `http://your-ec2-ip:3001/api/health`

Should return: `{"status":"OK","message":"CATS API is running"}`

Press `Ctrl+C` to stop.

---

## STEP 8: Setup Backend as Service with PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start backend with PM2
cd /home/ubuntu/cats-app/backend
pm2 start server.js --name cats-api

# Configure PM2 to start on system boot
pm2 startup
# Copy and run the command it outputs

# Save PM2 configuration
pm2 save

# Check status
pm2 status
pm2 logs cats-api
```

---

## STEP 9: Build and Deploy Frontend

```bash
# Navigate to frontend directory
cd /home/ubuntu/cats-app/frontend

# Install dependencies
npm install

# Update API endpoints in your React code if needed
# Make sure you're using relative URLs like '/api/customers'
# instead of 'http://localhost:3001/api/customers'

# Build for production
npm run build

# Create web directory
sudo mkdir -p /var/www/cats

# Copy build files to web directory
sudo cp -r build/* /var/www/cats/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/cats
```

---

## STEP 10: Install and Configure Nginx

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/cats
```

**Add this configuration**:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # or use your EC2 public IP

    # Frontend
    root /var/www/cats;
    index index.html;

    # Serve frontend files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable the site**:
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/cats /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## STEP 11: Verify Everything Works

### Test Backend API:
```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/customers
```

### Test Frontend:
Open browser: `http://your-ec2-ip`

You should see your CATS application!

---

## STEP 12: SSL Certificate (Optional but Recommended)

### Using Let's Encrypt (Free):
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Follow the prompts
# Certbot will automatically configure HTTPS
```

**Auto-renewal** is configured automatically. Test it:
```bash
sudo certbot renew --dry-run
```

---

## Updating Your Application (After Code Changes)

### When you make changes to your code:

```bash
# SSH into your EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Navigate to app directory
cd /home/ubuntu/cats-app

# Pull latest changes
git pull origin main

# Update Backend (if changed)
cd backend
npm install  # if package.json changed
pm2 restart cats-api

# Update Frontend (if changed)
cd ../frontend
npm install  # if package.json changed
npm run build
sudo cp -r build/* /var/www/cats/

# Update Database (if schema changed)
cd ../database
sudo -u postgres psql -d cats_db -f schema.sql
```

### Create an update script:
```bash
nano /home/ubuntu/update-cats.sh
```

Add:
```bash
#!/bin/bash
cd /home/ubuntu/cats-app
git pull origin main

# Backend
cd backend
npm install
pm2 restart cats-api

# Frontend
cd ../frontend
npm install
npm run build
sudo cp -r build/* /var/www/cats/

echo "CATS application updated successfully!"
```

Make executable:
```bash
chmod +x /home/ubuntu/update-cats.sh
```

**To update in the future**:
```bash
./update-cats.sh
```

---

## Useful Commands

### View Application Logs:
```bash
# Backend logs
pm2 logs cats-api

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Restart Services:
```bash
# Restart backend
pm2 restart cats-api

# Restart Nginx
sudo systemctl restart nginx

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Database Backup:
```bash
# Create backup
pg_dump -U cats_user -h localhost cats_db > ~/backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -U cats_user -h localhost cats_db < ~/backup_20240101_120000.sql
```

### Monitor System:
```bash
# Check disk space
df -h

# Check memory
free -h

# Check running processes
pm2 status
sudo systemctl status nginx
sudo systemctl status postgresql
```

---

## Troubleshooting

### Backend not connecting to database:
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check backend logs
pm2 logs cats-api

# Verify .env file
cat /home/ubuntu/cats-app/backend/.env
```

### Frontend not loading:
```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx configuration
sudo nginx -t

# Check if files exist
ls -la /var/www/cats/
```

### API calls failing:
```bash
# Check if backend is running
pm2 status

# Test API directly
curl http://localhost:3001/api/health

# Check Nginx proxy configuration
sudo nano /etc/nginx/sites-available/cats
```

---

## Security Checklist

- [ ] Change PostgreSQL password from default
- [ ] Don't commit .env files to GitHub
- [ ] Set up firewall rules (only open necessary ports)
- [ ] Enable SSL with Let's Encrypt
- [ ] Regularly update system packages
- [ ] Set up regular database backups
- [ ] Use SSH keys (not passwords) for server access
- [ ] Consider using AWS Security Groups to limit access

---

## Cost Estimate

**Single t3.medium EC2 Instance**: ~$30-35/month  
**Storage (30GB)**: ~$3/month  
**Total**: ~$35-40/month

**Savings Tips**:
- Use Reserved Instances for ~40% discount
- Start with t3.small if budget is tight
- Stop instance when not in use (dev environment)

---

## Next Steps / Future Improvements

1. **Automated Backups**: Set up cron job for daily DB backups
2. **Monitoring**: Add CloudWatch or similar monitoring
3. **CI/CD**: Set up GitHub Actions for automatic deployment
4. **Separate Database**: Move PostgreSQL to RDS for better reliability
5. **Load Balancer**: Add if you need high availability
6. **Docker**: Containerize for easier deployment

But for now, you have a fully functional production system! 🎉
