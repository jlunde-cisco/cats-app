import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Save, Edit2, Trash2 } from 'lucide-react';

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

// Multi-select with custom input
const MultiSelectBubbles = ({ items, selected, field, getLabel, onToggle, customValue, onCustomChange, onCustomAdd, placeholder }) => (
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
            onClick={() => onToggle(field, value)}
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
    <div className="flex gap-2">
      <input
        type="text"
        value={customValue}
        onChange={onCustomChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onCustomAdd();
          }
        }}
        placeholder={placeholder || 'Add custom option...'}
        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        type="button"
        onClick={onCustomAdd}
        className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
      >
        Add
      </button>
    </div>
  </div>
);

const CustomerLookup = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [applications, setApplications] = useState([]);
  const [editingApp, setEditingApp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [customInputs, setCustomInputs] = useState({
    model: '',
    modality: '',
    cloudService: ''
  });

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
    setDeleteConfirm(false);
    setAddingNote(false);
    setNewNoteText('');
    setCustomInputs({ model: '', modality: '', cloudService: '' });
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

  const deleteCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setCustomers(customers.filter(c => c.id !== selectedCustomer.id));
        setSelectedCustomer(null);
        setApplications([]);
        setDeleteConfirm(false);
      } else {
        alert('Failed to delete customer.');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer.');
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startNewApp = () => {
    setEditingApp({
      id: null,
      application_name: '',
      modalities: [],
      models: [],
      cloudServices: []
    });
    setCustomInputs({ model: '', modality: '', cloudService: '' });
  };

  const saveApp = async () => {
    if (!editingApp.application_name) return;
    try {
      let response;
      if (editingApp.id) {
        response = await fetch(`/api/applications/${editingApp.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            application_name: editingApp.application_name,
            modalities: editingApp.modalities,
            models: editingApp.models,
            cloudServices: editingApp.cloudServices
          })
        });
        if (response.ok) {
          const updated = await response.json();
          setApplications(applications.map(a => a.id === updated.id ? updated : a));
          setEditingApp(null);
        } else {
          alert("Failed to update application.");
        }
      } else {
        response = await fetch(`/api/customers/${selectedCustomer.id}/applications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            application_name: editingApp.application_name,
            modalities: editingApp.modalities,
            models: editingApp.models,
            cloudServices: editingApp.cloudServices
          })
        });
        if (response.ok) {
          const newApp = await response.json();
          setApplications([...applications, newApp]);
          setEditingApp(null);
        } else {
          alert("Failed to save application.");
        }
      }
    } catch (error) {
      console.error("Error saving application:", error);
      alert("Failed to save application.");
    }
  };

  const deleteApp = async (id) => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setApplications(applications.filter(app => app.id !== id));
      } else {
        alert('Failed to delete application.');
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Failed to delete application.');
    }
  };

  const editApp = (app) => {
    setEditingApp({...app});
    setCustomInputs({ model: '', modality: '', cloudService: '' });
  };

  const toggleSelection = (field, value) => {
    if (!editingApp) return;
    const current = editingApp[field];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setEditingApp({...editingApp, [field]: updated});
  };

  const addCustomItem = (field, inputKey) => {
    const value = customInputs[inputKey].trim();
    if (value && !editingApp[field].includes(value)) {
      setEditingApp({
        ...editingApp,
        [field]: [...editingApp[field], value]
      });
      setCustomInputs({ ...customInputs, [inputKey]: '' });
    }
  };

  const addMeetingNote = async () => {
    if (!newNoteText.trim()) return;
    try {
      const response = await fetch(`/api/customers/${selectedCustomer.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_text: newNoteText })
      });
      if (response.ok) {
        const newNote = await response.json();
        setSelectedCustomer(prev => ({
          ...prev,
          meetingNotes: [...(prev.meetingNotes || []), newNote]
        }));
        setNewNoteText('');
        setAddingNote(false);
      } else {
        alert('Failed to save note.');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to save note.');
    }
  };

  const deleteMeetingNote = async (noteId) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSelectedCustomer(prev => ({
          ...prev,
          meetingNotes: (prev.meetingNotes || []).filter(n => n.id !== noteId)
        }));
      } else {
        alert('Failed to delete note.');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      <p className="text-gray-600">{selectedCustomer.industry}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!deleteConfirm ? (
                        <button
                          onClick={() => setDeleteConfirm(true)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                          Delete Customer
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-300 rounded-lg p-2">
                          <span className="text-sm text-red-700 font-medium">Are you sure?</span>
                          <button
                            onClick={deleteCustomer}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Yes, Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(false)}
                            className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-6 mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">Applications</h3>
                      <button
                        onClick={startNewApp}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus size={18} />
                        New Application
                      </button>
                    </div>

                    {applications.length === 0 && !editingApp && (
                      <p className="text-sm text-gray-500 italic">No applications on file.</p>
                    )}

                    <div className="space-y-4">
                      {applications.map(app => (
                        <div key={app.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-lg font-semibold text-gray-800">{app.application_name}</h4>
                            <div className="flex gap-2">
                              <button onClick={() => editApp(app)} className="text-blue-600 hover:text-blue-800">
                                <Edit2 size={18} />
                              </button>
                              <button onClick={() => deleteApp(app.id)} className="text-red-600 hover:text-red-800">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div><span className="font-medium text-gray-700">Modalities: </span><span className="text-gray-600">{app.modalities?.join(', ') || 'None'}</span></div>
                            <div><span className="font-medium text-gray-700">Models: </span><span className="text-gray-600">{app.models?.join(', ') || 'None'}</span></div>
                            <div><span className="font-medium text-gray-700">Cloud Services: </span><span className="text-gray-600">{app.cloudServices?.join(', ') || 'None'}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {editingApp && (
                      <div className="border-2 border-blue-500 rounded-lg p-6 bg-blue-50 mt-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-semibold text-gray-800">
                            {editingApp.id ? 'Edit Application' : 'New Application'}
                          </h4>
                          <button onClick={() => setEditingApp(null)} className="text-gray-600 hover:text-gray-800">
                            <X size={20} />
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Application Name</label>
                            <input
                              type="text"
                              value={editingApp.application_name}
                              onChange={(e) => setEditingApp({...editingApp, application_name: e.target.value})}
                              placeholder="Enter application name..."
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Modalities</label>
                            <MultiSelectBubbles 
                              items={modalities} 
                              selected={editingApp.modalities} 
                              field="modalities" 
                              onToggle={toggleSelection}
                              customValue={customInputs.modality}
                              onCustomChange={(e) => setCustomInputs({...customInputs, modality: e.target.value})}
                              onCustomAdd={() => addCustomItem('modalities', 'modality')}
                              placeholder="Add custom modality..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Foundational Models</label>
                            <MultiSelectBubbles 
                              items={foundationalModels} 
                              selected={editingApp.models} 
                              field="models" 
                              onToggle={toggleSelection}
                              customValue={customInputs.model}
                              onCustomChange={(e) => setCustomInputs({...customInputs, model: e.target.value})}
                              onCustomAdd={() => addCustomItem('models', 'model')}
                              placeholder="Add custom model (e.g., Mistral7b)..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cloud AI Services</label>
                            <MultiSelectBubbles 
                              items={cloudServices} 
                              selected={editingApp.cloudServices} 
                              field="cloudServices" 
                              getLabel={(item) => item.name} 
                              onToggle={toggleSelection}
                              customValue={customInputs.cloudService}
                              onCustomChange={(e) => setCustomInputs({...customInputs, cloudService: e.target.value})}
                              onCustomAdd={() => addCustomItem('cloudServices', 'cloudService')}
                              placeholder="Add custom cloud service..."
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
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
                  </div>

                  <div className="border-b border-gray-200 pb-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Compute Vendors</h3>
                    {selectedCustomer.computeVendors && selectedCustomer.computeVendors.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedCustomer.computeVendors.map((vendor) => (
                          <span key={vendor} className="px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            {vendor}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No compute vendors on file.</p>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">Meeting Notes</h3>
                      <button
                        onClick={() => setAddingNote(true)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Plus size={16} />
                        Add Note
                      </button>
                    </div>

                    {addingNote && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                        <textarea
                          value={newNoteText}
                          onChange={(e) => setNewNoteText(e.target.value)}
                          placeholder="Enter meeting notes..."
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => { setAddingNote(false); setNewNoteText(''); }}
                            className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={addMeetingNote}
                            disabled={!newNoteText.trim()}
                            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedCustomer.meetingNotes && selectedCustomer.meetingNotes.length > 0 ? (
                      <div className="space-y-3">
                        {selectedCustomer.meetingNotes.map(note => {
                          const noteDate = new Date(note.created_at);
                          return (
                            <div key={note.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                  <span>{noteDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                  <span>{noteDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                                </div>
                                <button onClick={() => deleteMeetingNote(note.id)} className="text-red-500 hover:text-red-700">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                              <p className="text-gray-800 whitespace-pre-wrap">{note.note_text}</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No meeting notes on file.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg">Select a customer to view their details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerLookup;
