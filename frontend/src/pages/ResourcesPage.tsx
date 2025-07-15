import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import '../components/Table.css';

interface Resource {
  id: number;
  key: string;
  name?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await api.resources.getAll();
      setResources(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        key: formData.key,
        ...(formData.name && { name: formData.name }),
        ...(formData.description && { description: formData.description })
      };

      if (editingResource) {
        await api.resources.update(editingResource.id, submitData);
      } else {
        await api.resources.create(submitData);
      }
      
      await fetchResources();
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save resource');
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      key: resource.key,
      name: resource.name || '',
      description: resource.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      await api.resources.delete(id);
      await fetchResources();
    } catch (err: any) {
      setError(err.message || 'Failed to delete resource');
    }
  };

  const resetForm = () => {
    setEditingResource(null);
    setFormData({
      key: '',
      name: '',
      description: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const getResourceIcon = (key: string) => {
    if (key.includes('user') || key.includes('account')) return '👤';
    if (key.includes('admin') || key.includes('system')) return '⚙️';
    if (key.includes('data') || key.includes('database')) return '🗄️';
    if (key.includes('api') || key.includes('service')) return '🔌';
    if (key.includes('file') || key.includes('document')) return '📄';
    if (key.includes('report') || key.includes('analytics')) return '�';
    return '📋';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Resources Management</h1>
        <div className="actions">
          <Button variant="primary" onClick={openCreateModal}>
            + Add Resource
          </Button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <h3>Resource Overview</h3>
        <p>Manage system resources that can be protected by permissions. Resources are identified by unique keys (e.g., "user/profile", "admin/settings").</p>
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
          <h4>Key Format Examples:</h4>
          <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
            <li><code>user/profile</code> - User profile management</li>
            <li><code>admin/settings</code> - System administration</li>
            <li><code>reports/sales</code> - Sales reporting access</li>
            <li><code>data/export</code> - Data export functionality</li>
          </ul>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loader">
            <div className="loader-text">Loading resources...</div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Resource Key</th>
                <th>Display Name</th>
                <th>Description</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource.id}>
                  <td>{resource.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{getResourceIcon(resource.key)}</span>
                      <code style={{ background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                        {resource.key}
                      </code>
                    </div>
                  </td>
                  <td>
                    {resource.name ? (
                      <strong>{resource.name}</strong>
                    ) : (
                      <span className="text-muted">No display name</span>
                    )}
                  </td>
                  <td>{resource.description || <span className="text-muted">No description</span>}</td>
                  <td>{new Date(resource.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="table-actions">
                      <Button variant="secondary" size="sm" onClick={() => handleEdit(resource)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(resource.id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingResource ? 'Edit Resource' : 'Add New Resource'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Resource Key *</label>
            <input
              type="text"
              className="form-input"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              required
              placeholder="e.g., user/profile, admin/settings"
              pattern="^[a-zA-Z0-9/_-]+$"
              title="Use letters, numbers, slashes, underscores, and hyphens only"
            />
            <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Unique identifier for this resource (e.g., "user/profile", "admin/settings")
            </small>
          </div>
          
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Human-readable name for this resource"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this resource controls access to..."
            />
          </div>
          
          <div className="form-actions">
            <Button 
              variant="secondary" 
              type="button" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingResource ? 'Update Resource' : 'Create Resource'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
