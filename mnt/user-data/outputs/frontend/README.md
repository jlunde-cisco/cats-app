# CATS Frontend

React-based frontend for the Customer AI Tracking System.

## Structure

```
frontend/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/
│   │   ├── CustomerLookup.js    # Customer search and view
│   │   └── CustomerInput.js     # New customer form
│   ├── App.js              # Main app with routing
│   ├── index.js            # Entry point
│   └── index.css           # Tailwind CSS
├── package.json
├── tailwind.config.js      # Tailwind configuration
└── postcss.config.js       # PostCSS configuration
```

## Development

### Install dependencies:
```bash
npm install
```

### Start development server:
```bash
npm start
```

Runs on `http://localhost:3000`

The app will automatically proxy API requests to `http://localhost:3001` (the backend).

### Build for production:
```bash
npm run build
```

Creates optimized production build in the `build/` directory.

## Features

### Customer Lookup (`/`)
- Search and filter customers
- View customer details
- See all AI applications
- Edit/delete applications
- View compute vendors
- Review meeting notes

### New Customer (`/new-customer`)
- Add customer information
- Define AI applications with:
  - Custom application names
  - Modalities (Text, Image, Audio, etc.)
  - Foundational models (GPT, Claude, etc.)
  - Cloud services (AWS Bedrock, Azure OpenAI, etc.)
- Select compute vendors
- Add timestamped meeting notes
- Custom input for unlisted options

## API Integration

The frontend expects the backend API to be available at `/api/*` endpoints:

- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

The proxy configuration in `package.json` handles forwarding requests during development.

## Styling

Uses Tailwind CSS for all styling. Main design elements:
- Blue/indigo gradient background
- Card-based layouts
- Multi-select bubble buttons
- Responsive design (mobile-friendly)

## Environment

No environment variables needed. API URL is handled by the proxy configuration.

For production, ensure your Nginx configuration proxies `/api` requests to the backend server.
