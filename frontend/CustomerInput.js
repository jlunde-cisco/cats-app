import React, { useState } from 'react';
import { Save, Plus, X, Calendar, Clock, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CustomerInput = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerName: '',
    industry: '',
    applications: [],
    computeVendors: [],
    meetingNotes: []
  });

  const [currentApp, setCurrentApp] = useState({
    name: '',
    modalities: [],
    models: [],
    cloudServices: []
  });

  const [noteText, setNoteText] = useState('');
  const [customInputs, setCustomInputs] = useState({
    model: '',
    modality: '',
    cloudService: '',
    computeVendor: ''
  });

  const foundationalModels = [
    'GPT-4', 'GPT-3.5', 'Claude 3.5', 'Claude 3', 'Gemini Pro', 'Gemini Ultra',
    'Llama 3', 'Llama 2', 'Mistral', 'Command R+', 'PaLM 2', 'Cohere'
  ];

  const cloudServices = [
    { name: 'AWS Bedrock', provider: 'AWS' },
    { name: 'Azure OpenAI', provider: 'Azure' },
    { name: 'Google Vertex AI', provider: 'GCP' },
    { name: 'Palantir Foundry', provider: 'Palantir' },
    { name: 'AWS SageMaker', provider: 'AWS' },
    { name: 'Azure ML', provider: 'Azure' },
    { name: 'IBM watsonx', provider: 'IBM' }
  ];

  const modalities = ['Text', 'Image', 'Audio', 'Video', 'Code', 'Multimodal'];

  const computeVendors = [
    'NVIDIA', 'Cisco', 'Dell', 'HPE', 'Supermicro', 'Lenovo', 
    'IBM', 'Fujitsu', 'Inspur', 'Huawei'
  ];

  const industries = [
    'Technology', 'Financial Services', 'Healthcare', 'Manufacturing',
    'Retail', 'Energy', 'Telecommunications', 'Government', 'Education', 'Other'
  ];

  const toggleSelection = (field, value) => {
    const current = currentApp[field];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setCurrentApp({...currentApp, [field]: updated});
  };

  const addCustomItem = (listType, field, inputField) => {
    const value = customInputs[inputField].trim();
    if (value && !currentApp[field].includes(value)) {
      setCurrentApp({
        ...currentApp,
        [field]: [...currentApp[field], value]
      });
      setCustomInputs({...customInputs, [inputField]: ''});
    }
  };

  const addCustomComputeVendor = () => {
    const value = customInputs.computeVendor.trim();
    if (value && !formData.computeVendors?.includes(value)) {
      setFormData({
        ...formData,
        computeVendors: [...(formData.computeVendors || []), value]
      });
      setCustomInputs({...customInputs, computeVendor: ''});
    }
  };

  const toggleComputeVendor = (vendor) => {
    const current = formData.computeVendors || [];
    const updated = current.includes(vendor)
      ? current.filter(v => v !== vendor)
      : [...current, vendor];
    setFormData({...formData, computeVendors: updated});
  };

  const addApplication = () => {
    if (currentApp.name.trim()) {
      setFormData({
        ...formData,
        applications: [...formData.applications, {...currentApp, id: Date.now()}]
      });
      setCurrentApp({
        name: '',
        modalities: [],
        models: [],
        cloudServices: []
      });
    }
  };

  const removeApplication = (id) => {
    setFormData({
      ...formData,
      applications: formData.applications.filter(app => app.id !== id)
    });
  };

  const addMeetingNote = () => {
    if (noteText.trim()) {
      const now = new Date();
      setFormData({
        ...formData,
        meetingNotes: [
          ...formData.meetingNotes,
          {
            id: Date.now(),
            text: noteText,
            timestamp: now.toISOString(),
            dateDisplay: now.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }),
            timeDisplay: now.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })
          }
        ]
      });
      setNoteText('');
    }
  };

  const removeMeetingNote = (id) => {
    setFormData({
      ...formData,
      meetingNotes: formData.meetingNotes.filter(note => note.id !== id)
    });
  };

  const handleSubmit = async () => {
    try {
      // Prepare data in format expected by backend
      const submitData = {
        customerName: formData.customerName,
        industry: formData.industry,
        applications: formData.applications.map(app => ({
          name: app.name,
          modalities: app.modalities,
          models: app.models,
          cloudServices: app.cloudServices
        })),
        computeVendors: formData.computeVendors,
        meetingNotes: formData.meetingNotes
      };

      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        alert('Customer saved successfully!');
        // Navigate to lookup page
        navigate('/');
      } else {
        const error = await response.json();
        alert(`Error saving customer: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting customer:', error);
      alert('Failed to save customer. Please try again.');
    }
  };

  const MultiSelectBubbles = ({ items, selected, field, getLabel, customInputField, placeholder }) => (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const value = typeof item === 'string' ? item : item.name;
          const label = getLabel ? getLabel(item) : value;
          const isSelected = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
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
      {customInputField && (
        <div className="flex gap-2">
          <input
            type="text"
            value={customInputs[customInputField]}
            onChange={(e) => setCustomInputs({...customInputs, [customInputField]: e.target.value})}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomItem(items, field, customInputField);
              }
            }}
            placeholder={placeholder || "Add custom option..."}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => addCustomItem(items, field, customInputField)}
            className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">CATS - New Customer Entry</h1>
          <p className="text-gray-600">Customer AI Tracking System</p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-8">
            {/* Customer Information Section */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    placeholder="Enter customer name..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select industry...</option>
                    {industries.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* AI Applications Section */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
                AI Applications
              </h2>

              {/* Current Application Form */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Application</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Name
                    </label>
                    <input
                      type="text"
                      value={currentApp.name}
                      onChange={(e) => setCurrentApp({...currentApp, name: e.target.value})}
                      placeholder="e.g., Customer Support Chatbot"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Modalities
                    </label>
                    <MultiSelectBubbles
                      items={modalities}
                      selected={currentApp.modalities}
                      field="modalities"
                      customInputField="modality"
                      placeholder="Add custom modality (e.g., 3D, Haptic)..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Foundational Models
                    </label>
                    <MultiSelectBubbles
                      items={foundationalModels}
                      selected={currentApp.models}
                      field="models"
                      customInputField="model"
                      placeholder="Add custom model (e.g., Custom Fine-tuned Model)..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cloud AI Services
                    </label>
                    <MultiSelectBubbles
                      items={cloudServices}
                      selected={currentApp.cloudServices}
                      field="cloudServices"
                      getLabel={(item) => item.name}
                      customInputField="cloudService"
                      placeholder="Add custom cloud service..."
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={addApplication}
                      disabled={!currentApp.name.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <Plus size={18} />
                      Add Application
                    </button>
                  </div>
                </div>
              </div>

              {/* Added Applications List */}
              {formData.applications.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800">Added Applications ({formData.applications.length})</h3>
                  {formData.applications.map(app => (
                    <div key={app.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-800 text-lg">{app.name}</h4>
                        <button
                          type="button"
                          onClick={() => removeApplication(app.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Modalities: </span>
                          <span className="text-gray-600">{app.modalities.join(', ') || 'None selected'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Models: </span>
                          <span className="text-gray-600">{app.models.join(', ') || 'None selected'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Cloud Services: </span>
                          <span className="text-gray-600">{app.cloudServices.join(', ') || 'None selected'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Compute Vendors Section */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
                Compute Vendors
              </h2>
              
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {computeVendors.map((vendor) => {
                    const isSelected = formData.computeVendors?.includes(vendor);
                    return (
                      <button
                        key={vendor}
                        type="button"
                        onClick={() => toggleComputeVendor(vendor)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {vendor}
                      </button>
                    );
                  })}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customInputs.computeVendor}
                    onChange={(e) => setCustomInputs({...customInputs, computeVendor: e.target.value})}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomComputeVendor();
                      }
                    }}
                    placeholder="Add custom compute vendor..."
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addCustomComputeVendor}
                    className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add
                  </button>
                </div>

                {formData.computeVendors && formData.computeVendors.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Selected Vendors:</p>
                    <p className="text-sm text-gray-600">{formData.computeVendors.join(', ')}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Meeting Notes Section */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
                Meeting Notes
              </h2>

              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Note
                    </label>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Enter meeting notes, key discussion points, next steps..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={addMeetingNote}
                      disabled={!noteText.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <Plus size={18} />
                      Add Note
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes List */}
              {formData.meetingNotes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800">Notes History ({formData.meetingNotes.length})</h3>
                  {formData.meetingNotes.map(note => (
                    <div key={note.id} className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            <span>{note.dateDisplay}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={16} />
                            <span>{note.timeDisplay}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMeetingNote(note.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap">{note.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!formData.customerName || !formData.industry}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                <Save size={20} />
                Save Customer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInput;
