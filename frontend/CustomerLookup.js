import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Save, Edit2, Trash2 } from 'lucide-react';

const CustomerLookup = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [applications, setApplications] = useState([]);
  const [editingApp, setEditingApp] = useState(null);
  const [loading, setLoading] = useState(false);

  const foundationalModels = [
    'GPT-4', 'GPT-3.5', 'Claude 3.5', 'Claude 3', 'Gemini Pro', 'Gemini Ultra',
    'Llama 3', 'Llama 2', 'Mistral', 'Command R+', 'PaLM 2'
  ];

  const cloudServices = [
    { name: 'AWS Bedrock', provider: 'AWS' },
    { name: 'Azure OpenAI', provider: 'Azure' },
    { name: 'Google Vertex AI', provider: 'GCP' },
    { name: 'Palantir Foundry', provider: 'Palantir' },
    { name: 'AWS SageMaker', provider: 'AWS' },
    { name: 'Azure ML', provider: 'Azure' }
  ];

  const modalities = ['Text', 'Image', 'Audio', 'Video', 'Code', 'Multimodal'];

  // Fetch all customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const selectCustomer = async (customer) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/customers/${customer.id}`);
      const data = await response.json();
      setSelectedCustomer(data);
      setApplications(data.applications || []);
      setEditingApp(null);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startNewApp = () => {
    setEditingApp({
      id: Date.now(),
      application_name: '',
      modalities: [],
      models: [],
      cloudServices: []
    });
  };

  const saveApp = async () => {
    if (!editingApp.application_name) return;

    // This would call an API to save the application
    // For now, we'll just update the local state
    const existingIndex = applications.findIndex(app => app.id === editingApp.id);
    if (existingIndex >= 0) {
      const updated = [...applications];
      updated[existingIndex] = editingApp;
      setApplications(updated);
    } else {
      setApplications([...applications, editingApp]);
    }
    setEditingApp(null);
  };

  const deleteApp = (id) => {
    setApplications(applications.filter(app => app.id !== id));
  };

  const editApp = (app) => {
    setEditingApp({...app});
  };

  const toggleSelection = (field, value) => {
    if (!editingApp) return;
    const current = editingApp[field];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setEditingApp({...editingApp, [field]: updated});
  };

  const MultiSelectBubbles = ({ items, selected, field, getLabel }) => (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const value = typeof item === 'string' ? item : item.name;
        const label = getLabel ? getLabel(item) : value;
        const isSelected = selected.includes(value);
        return (
          <button
            key={value}
            onClick={() => toggleSelection(field, value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              isSelected
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Search Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Customer Search</h2>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredCustomers.map(customer => (
                <button
                  key={customer.id}
                  onClick={() => selectCustomer(customer)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCustomer?.id === customer.id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="font-semibold text-gray-800">{customer.customer_name}</div>
                  <div className="text-sm text-gray-600">{customer.industry}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Applications Panel */}
        <div className="lg:col-span-2">
          {selectedCustomer ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading...</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">{selectedCustomer.customer_name}</h2>
                      <p className="text-gray-600">AI Applications</p>
                    </div>
                    <button
                      onClick={startNewApp}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={20} />
                      New Application
                    </button>
                  </div>

                  {/* Existing Applications */}
                  <div className="space-y-4 mb-6">
                    {applications.map(app => (
                      <div key={app.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-semibold text-gray-800">{app.application_name}</h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => editApp(app)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => deleteApp(app.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Modalities: </span>
                            <span className="text-sm text-gray-600">{app.modalities?.join(', ') || 'None'}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Models: </span>
                            <span className="text-sm text-gray-600">{app.models?.join(', ') || 'None'}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Cloud Services: </span>
                            <span className="text-sm text-gray-600">{app.cloudServices?.join(', ') || 'None'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Edit/New Application Form */}
                  {editingApp && (
                    <div className="border-2 border-blue-500 rounded-lg p-6 bg-blue-50">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {applications.find(a => a.id === editingApp.id) ? 'Edit Application' : 'New Application'}
                        </h3>
                        <button
                          onClick={() => setEditingApp(null)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Application Name
                          </label>
                          <input
                            type="text"
                            value={editingApp.application_name}
                            onChange={(e) => setEditingApp({...editingApp, application_name: e.target.value})}
                            placeholder="Enter application name..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Modalities
                          </label>
                          <MultiSelectBubbles
                            items={modalities}
                            selected={editingApp.modalities}
                            field="modalities"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Foundational Models
                          </label>
                          <MultiSelectBubbles
                            items={foundationalModels}
                            selected={editingApp.models}
                            field="models"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cloud AI Services
                          </label>
                          <MultiSelectBubbles
                            items={cloudServices}
                            selected={editingApp.cloudServices}
                            field="cloudServices"
                            getLabel={(item) => item.name}
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                          <button
                            onClick={() => setEditingApp(null)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={saveApp}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Save size={18} />
                            Save Application
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg">Select a customer to view their AI applications</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerLookup;
