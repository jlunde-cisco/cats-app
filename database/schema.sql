-- CATS Database Schema
-- Customer AI Tracking System

-- Create database
CREATE DATABASE cats_db;

-- Connect to the database
\c cats_db;

-- Customers table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications table
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    application_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modalities table (many-to-many with applications)
CREATE TABLE modalities (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    modality VARCHAR(100) NOT NULL
);

-- Foundational Models table (many-to-many with applications)
CREATE TABLE foundational_models (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL
);

-- Cloud Services table (many-to-many with applications)
CREATE TABLE cloud_services (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    service_name VARCHAR(100) NOT NULL
);

-- Compute Vendors table (many-to-many with customers)
CREATE TABLE compute_vendors (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    vendor_name VARCHAR(100) NOT NULL
);

-- Meeting Notes table
CREATE TABLE meeting_notes (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_applications_customer_id ON applications(customer_id);
CREATE INDEX idx_modalities_application_id ON modalities(application_id);
CREATE INDEX idx_models_application_id ON foundational_models(application_id);
CREATE INDEX idx_cloud_services_application_id ON cloud_services(application_id);
CREATE INDEX idx_compute_vendors_customer_id ON compute_vendors(customer_id);
CREATE INDEX idx_meeting_notes_customer_id ON meeting_notes(customer_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update updated_at timestamp
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing
INSERT INTO customers (customer_name, industry) VALUES 
    ('Acme Corporation', 'Manufacturing'),
    ('TechStart Inc', 'Technology'),
    ('Global Finance Group', 'Financial Services'),
    ('HealthCare Plus', 'Healthcare');

INSERT INTO applications (customer_id, application_name) VALUES 
    (1, 'Customer Support Chatbot'),
    (1, 'Document Analysis'),
    (2, 'Code Assistant');

INSERT INTO modalities (application_id, modality) VALUES 
    (1, 'Text'),
    (2, 'Text'),
    (2, 'Image'),
    (3, 'Code');

INSERT INTO foundational_models (application_id, model_name) VALUES 
    (1, 'GPT-4'),
    (1, 'Claude 3.5'),
    (2, 'Claude 3.5'),
    (3, 'GPT-4');

INSERT INTO cloud_services (application_id, service_name) VALUES 
    (1, 'AWS Bedrock'),
    (1, 'Azure OpenAI'),
    (2, 'AWS Bedrock'),
    (3, 'Azure OpenAI');

INSERT INTO compute_vendors (customer_id, vendor_name) VALUES 
    (1, 'Dell'),
    (1, 'NVIDIA'),
    (2, 'Supermicro');

INSERT INTO meeting_notes (customer_id, note_text) VALUES 
    (1, 'Initial discovery call. Customer interested in deploying chatbot for customer support.'),
    (1, 'Follow-up: Discussed integration with existing CRM system.'),
    (2, 'Demo scheduled for next week. Focus on code generation capabilities.');
