// CATS Backend API
// server.js

require('dotenv').config();

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
    const customerResult = await pool.query(
      'SELECT * FROM customers WHERE id = $1',
      [id]
    );
    
    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const customer = customerResult.rows[0];
    
    const appsResult = await pool.query(
      'SELECT * FROM applications WHERE customer_id = $1',
      [id]
    );
    
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
    
    const vendorsResult = await pool.query(
      'SELECT vendor_name FROM compute_vendors WHERE customer_id = $1',
      [id]
    );
    
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
    
    const customerResult = await client.query(
      'INSERT INTO customers (customer_name, industry) VALUES ($1, $2) RETURNING *',
      [customerName, industry]
    );
    
    const customerId = customerResult.rows[0].id;
    
    if (applications && applications.length > 0) {
      for (const app of applications) {
        const appResult = await client.query(
          'INSERT INTO applications (customer_id, application_name) VALUES ($1, $2) RETURNING id',
          [customerId, app.name]
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
    
    if (computeVendors && computeVendors.length > 0) {
      for (const vendor of computeVendors) {
        await client.query(
          'INSERT INTO compute_vendors (customer_id, vendor_name) VALUES ($1, $2)',
          [customerId, vendor]
        );
      }
    }
    
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
  const { customerName, industry, applications, computeVendors } = req.body;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    await client.query(
      'UPDATE customers SET customer_name = $1, industry = $2 WHERE id = $3',
      [customerName, industry, id]
    );
    
    await client.query('DELETE FROM applications WHERE customer_id = $1', [id]);
    await client.query('DELETE FROM compute_vendors WHERE customer_id = $1', [id]);
    
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

// ===== APPLICATION ENDPOINTS =====

// Add application to a customer
app.post('/api/customers/:id/applications', async (req, res) => {
  const { id } = req.params;
  const { application_name, modalities, models, cloudServices } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const appResult = await client.query(
      'INSERT INTO applications (customer_id, application_name) VALUES ($1, $2) RETURNING *',
      [id, application_name]
    );
    const appId = appResult.rows[0].id;

    if (modalities && modalities.length > 0) {
      for (const m of modalities) {
        await client.query('INSERT INTO modalities (application_id, modality) VALUES ($1, $2)', [appId, m]);
      }
    }
    if (models && models.length > 0) {
      for (const m of models) {
        await client.query('INSERT INTO foundational_models (application_id, model_name) VALUES ($1, $2)', [appId, m]);
      }
    }
    if (cloudServices && cloudServices.length > 0) {
      for (const s of cloudServices) {
        await client.query('INSERT INTO cloud_services (application_id, service_name) VALUES ($1, $2)', [appId, s]);
      }
    }

    await client.query('COMMIT');
    res.status(201).json({
      ...appResult.rows[0],
      modalities: modalities || [],
      models: models || [],
      cloudServices: cloudServices || []
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Delete a single application (CASCADE handles modalities/models/services)
app.delete('/api/applications/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM applications WHERE id = $1', [id]);
    res.json({ message: 'Application deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Update an existing application
app.put('/api/applications/:id', async (req, res) => {
  const { id } = req.params;
  const { application_name, modalities, models, cloudServices } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    await client.query(
      'UPDATE applications SET application_name = $1 WHERE id = $2',
      [application_name, id]
    );
    
    await client.query('DELETE FROM modalities WHERE application_id = $1', [id]);
    await client.query('DELETE FROM foundational_models WHERE application_id = $1', [id]);
    await client.query('DELETE FROM cloud_services WHERE application_id = $1', [id]);
    
    if (modalities && modalities.length > 0) {
      for (const m of modalities) {
        await client.query('INSERT INTO modalities (application_id, modality) VALUES ($1, $2)', [id, m]);
      }
    }
    if (models && models.length > 0) {
      for (const m of models) {
        await client.query('INSERT INTO foundational_models (application_id, model_name) VALUES ($1, $2)', [id, m]);
      }
    }
    if (cloudServices && cloudServices.length > 0) {
      for (const s of cloudServices) {
        await client.query('INSERT INTO cloud_services (application_id, service_name) VALUES ($1, $2)', [id, s]);
      }
    }
    
    await client.query('COMMIT');
    
    res.json({
      id: parseInt(id),
      application_name,
      modalities: modalities || [],
      models: models || [],
      cloudServices: cloudServices || []
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});
// ===== MEETING NOTES ENDPOINTS =====

// Add meeting note
app.post('/api/customers/:id/notes', async (req, res) => {
  const { id } = req.params;
  const noteText = req.body.note_text || req.body.text;
  
  try {
    const result = await pool.query(
      'INSERT INTO meeting_notes (customer_id, note_text) VALUES ($1, $2) RETURNING *',
      [id, noteText]
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
