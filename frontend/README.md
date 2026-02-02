# CATS - Customer AI Tracking System

A web-based application for System Engineers to track and manage customer AI deployments, including foundational models, cloud services, and compute infrastructure.

## Features

- 🔍 **Customer Search** - Quick lookup and management of customer accounts
- 📝 **Application Tracking** - Document AI applications with modalities, models, and services
- 💬 **Meeting Notes** - Auto-timestamped notes for customer interactions
- 🎯 **Multi-select Interface** - Easy selection of models, services, and vendors
- 🔧 **Custom Entries** - Add custom options for any category
- 💾 **PostgreSQL Database** - Robust relational data storage
- 🌐 **REST API** - Clean backend API for all operations

## Repository Structure

```
cats-app/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── cats-ui.jsx           # Customer lookup interface
│   │   ├── cats-input-form.jsx   # Customer input form
│   │   └── ...
│   ├── package.json
│   └── public/
├── backend/               # Node.js/Express API
│   ├── server.js                 # Main API server
│   ├── package.json
│   └── .env.example             # Environment variables template
├── database/              # Database schemas and scripts
│   └── schema.sql               # PostgreSQL database schema
├── scripts/
│   └── update-cats.sh           # Deployment update script
└── README.md
```

## Tech Stack

### Frontend
- **React** - UI framework
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **pg** - PostgreSQL client

### Deployment
- **AWS EC2** - Hosting
- **Nginx** - Web server & reverse proxy
- **PM2** - Process manager
- **pgAdmin** - Database management UI

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/cats-app.git
cd cats-app
```

### 2. Setup Database
```bash
# Create database
sudo -u postgres psql
CREATE DATABASE cats_db;
CREATE USER cats_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE cats_db TO cats_user;
\q

# Load schema
psql -U cats_user -d cats_db -f database/schema.sql
```

### 3. Setup Backend
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Start backend
npm start
```

Backend will run on `http://localhost:3001`

### 4. Setup Frontend
```bash
cd frontend
npm install

# Start development server
npm start
```

Frontend will run on `http://localhost:3000`

## Production Deployment

See [DEPLOYMENT_GUIDE_GITHUB.md](./DEPLOYMENT_GUIDE_GITHUB.md) for complete AWS EC2 deployment instructions.

### Quick Deployment Summary:
1. Launch Ubuntu EC2 instance
2. Install PostgreSQL, Node.js, Nginx
3. Clone this repository
4. Setup database schema
5. Configure backend with PM2
6. Build and deploy frontend with Nginx
7. Optional: Setup SSL with Let's Encrypt

## API Endpoints

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer with all details
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/search/:query` - Search customers

### Meeting Notes
- `POST /api/customers/:id/notes` - Add meeting note
- `DELETE /api/notes/:id` - Delete meeting note

### Health Check
- `GET /api/health` - API health status

## Database Schema

### Tables
- **customers** - Customer information
- **applications** - AI applications per customer
- **modalities** - Application modalities (Text, Image, etc.)
- **foundational_models** - AI models used
- **cloud_services** - Cloud AI services used
- **compute_vendors** - Hardware vendors
- **meeting_notes** - Customer meeting notes

See `database/schema.sql` for complete schema.

## Environment Variables

Create `.env` file in backend directory:

```env
DB_USER=cats_user
DB_HOST=localhost
DB_NAME=cats_db
DB_PASSWORD=your_secure_password
DB_PORT=5432
PORT=3001
```

## Updating Production

After pushing changes to GitHub:

```bash
ssh ubuntu@your-ec2-ip
cd /home/ubuntu/cats-app
./scripts/update-cats.sh
```

Or manually:
```bash
git pull origin main
cd backend && npm install && pm2 restart cats-api
cd ../frontend && npm install && npm run build
sudo cp -r build/* /var/www/cats/
```

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## Security Notes

- Never commit `.env` files
- Use strong database passwords
- Enable SSL in production
- Restrict EC2 security groups
- Regular security updates
- Backup database regularly

## License

MIT License - feel free to use this for your organization

## Support

For issues and questions:
- Check deployment guide
- Review server logs: `pm2 logs cats-api`
- Check database with pgAdmin
- Review Nginx logs: `/var/log/nginx/`

## Roadmap

- [ ] User authentication
- [ ] Role-based access control
- [ ] Export to CSV/Excel
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] API rate limiting
- [ ] Automated backups to S3
- [ ] Multi-tenancy support

---

Built for System Engineers tracking customer AI deployments 🚀
