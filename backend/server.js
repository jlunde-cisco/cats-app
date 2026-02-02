// CATS Backend API
// server.js

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'cats_db',
  password: process.env.DB_PASSWORD || 'your_password',
  port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

// ===== CUSTOMER ENDPOINTS =====

// Get all customers
app.get('/api/customers', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM customers ORDER BY customer_name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single customer with all related data
app.get('/api/customers/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get customer
    const customerResult = await pool.query(
      'SELECT * FROM customers WHERE id = $1',
      [id]
    );
    
    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const customer = customerResult.rows[0];
    
    // Get applications
    const appsResult = await pool.query(
      'SELECT * FROM applications WHERE customer_id = $1',
      [id]
    );
    
    // For each application, get modalities, models, and cloud services
    const applications = await Promise.all(
      appsResult.rows.map(async (app) => {
        const [modalities, models, cloudServices] = await Promise.all([
          pool.query('SELECT modality FROM modalities WHERE application_id = $1', [app.id]),
          pool.query('SELECT model_name FROM foundational_models WHERE application_id = $1', [app.id]),
          pool.query('SELECT service_name FROM cloud_services WHERE application_id = $1', [app.id])
        ]);
        
        return {
          ...app,
          modalities: modalities.rows.map(m => m.modality),
          models: models.rows.map(m => m.model_name),
          cloudServices: cloudServices.rows.map(c => c.service_name)
        };
      })
    );
    
    // Get compute vendors
    const vendorsResult = await pool.query(
      'SELECT vendor_name FROM compute_vendors WHERE customer_id = $1',
      [id]
    );
    
    // Get meeting notes
    const notesResult = await pool.query(
      'SELECT * FROM meeting_notes WHERE customer_id = $1 ORDER BY created_at DESC',
      [id]
    );
    
    res.json({
      ...customer,
      applications,
      computeVendors: vendorsResult.rows.map(v => v.vendor_name),
      meetingNotes: notesResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new customer with all related data
app.post('/api/customers', async (req, res) => {
  const { customerName, industry, applications, computeVendors, meetingNotes } = req.body;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Insert customer
    const customerResult = await client.query(
      'INSERT INTO customers (customer_name, industry) VALUES ($1, $2) RETURNING *',
      [customerName, industry]
    );
    
    const customerId = customerResult.rows[0].id;
    
    // Insert applications and their related data
    if (applications && applications.length > 0) {
      for (const app of applications) {
        const appResult = await client.query(
          'INSERT INTO applications (customer_id, application_name) VALUES ($1, $2) RETURNING id',
          [customerId, app.name]
        );
        
        const appId = appResult.rows[0].id;
        
        // Insert modalities
        if (app.modalities && app.modalities.length > 0) {
          for (const modality of app.modalities) {
            await client.query(
              'INSERT INTO modalities (application_id, modality) VALUES ($1, $2)',
              [appId, modality]
            );
          }
        }
        
        // Insert models
        if (app.models && app.models.length > 0) {
          for (const model of app.models) {
            await client.query(
              'INSERT INTO foundational_models (application_id, model_name) VALUES ($1, $2)',
              [appId, model]
            );
          }
        }
        
        // Insert cloud services
        if (app.cloudServices && app.cloudServices.length > 0) {
          for (const service of app.cloudServices) {
            await client.query(
              'INSERT INTO cloud_services (application_id, service_name) VALUES ($1, $2)',
              [appId, service]
            );
          }
        }
      }
    }
    
    // Insert compute vendors
    if (computeVendors && computeVendors.length > 0) {
      for (const vendor of computeVendors) {
        await client.query(
          'INSERT INTO compute_vendors (customer_id, vendor_name) VALUES ($1, $2)',
          [customerId, vendor]
        );
      }
    }
    
    // Insert meeting notes
    if (meetingNotes && meetingNotes.length > 0) {
      for (const note of meetingNotes) {
        await client.query(
          'INSERT INTO meeting_notes (customer_id, note_text, created_at) VALUES ($1, $2, $3)',
          [customerId, note.text, note.timestamp]
        );
      }
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({ 
      message: 'Customer created successfully',
      customerId: customerId 
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Update customer
app.put('/api/customers/:id', async (req, res) => {
  const { id } = req.params;
  const { customerName, industry, applications, computeVendors, meetingNotes } = req.body;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Update customer basic info
    await client.query(
      'UPDATE customers SET customer_name = $1, industry = $2 WHERE id = $3',
      [customerName, industry, id]
    );
    
    // Delete existing applications and related data (CASCADE will handle related tables)
    await client.query('DELETE FROM applications WHERE customer_id = $1', [id]);
    
    // Delete existing compute vendors
    await client.query('DELETE FROM compute_vendors WHERE customer_id = $1', [id]);
    
    // Re-insert applications (same logic as create)
    if (applications && applications.length > 0) {
      for (const app of applications) {
        const appResult = await client.query(
          'INSERT INTO applications (customer_id, application_name) VALUES ($1, $2) RETURNING id',
          [id, app.name]
        );
        
        const appId = appResult.rows[0].id;
        
        if (app.modalities && app.modalities.length > 0) {
          for (const modality of app.modalities) {
            await client.query(
              'INSERT INTO modalities (application_id, modality) VALUES ($1, $2)',
              [appId, modality]
            );
          }
        }
        
        if (app.models && app.models.length > 0) {
          for (const model of app.models) {
            await client.query(
              'INSERT INTO foundational_models (application_id, model_name) VALUES ($1, $2)',
              [appId, model]
            );
          }
        }
        
        if (app.cloudServices && app.cloudServices.length > 0) {
          for (const service of app.cloudServices) {
            await client.query(
              'INSERT INTO cloud_services (application_id, service_name) VALUES ($1, $2)',
              [appId, service]
            );
          }
        }
      }
    }
    
    // Re-insert compute vendors
    if (computeVendors && computeVendors.length > 0) {
      for (const vendor of computeVendors) {
        await client.query(
          'INSERT INTO compute_vendors (customer_id, vendor_name) VALUES ($1, $2)',
          [id, vendor]
        );
      }
    }
    
    await client.query('COMMIT');
    
    res.json({ message: 'Customer updated successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Delete customer
app.delete('/api/customers/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('DELETE FROM customers WHERE id = $1', [id]);
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== MEETING NOTES ENDPOINTS =====

// Add meeting note
app.post('/api/customers/:id/notes', async (req, res) => {
  const { id } = req.params;
  const { text, timestamp } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO meeting_notes (customer_id, note_text, created_at) VALUES ($1, $2, $3) RETURNING *',
      [id, text, timestamp]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete meeting note
app.delete('/api/notes/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('DELETE FROM meeting_notes WHERE id = $1', [id]);
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== SEARCH ENDPOINT =====

// Search customers by name
app.get('/api/customers/search/:query', async (req, res) => {
  const { query } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT * FROM customers WHERE customer_name ILIKE $1 ORDER BY customer_name',
      [`%${query}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CATS API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`CATS API server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end();
  process.exit(0);
});
