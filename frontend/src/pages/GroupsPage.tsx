import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import '../components/Table.css';

interface Group {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  userGroups?: Array<{
    user: {
      id: number;
      username: string;
      email: string;
    }
  }>;
}

interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
}

export const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupsData, usersData] = await Promise.all([
        api.groups.getAll(),
        api.users.getAll()
      ]);
      setGroups(groupsData);
      setUsers(usersData);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        name: formData.name,
        ...(formData.description && { description: formData.description })
      };

      if (editingGroup) {
        await api.groups.update(editingGroup.id, submitData);
      } else {
        await api.groups.create(submitData);
      }
      
      await fetchData();
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save group');
    }
  };

  const handleAssignUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !selectedUserId) return;

    try {
      await api.groups.assignUser(selectedGroup.id, parseInt(selectedUserId));
      await fetchData();
      setIsAssignModalOpen(false);
      setSelectedUserId('');
    } catch (err: any) {
      setError(err.message || 'Failed to assign user to group');
    }
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    
    try {
      await api.groups.delete(id);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete group');
    }
  };

  const openAssignModal = (group: Group) => {
    setSelectedGroup(group);
    setSelectedUserId('');
    setIsAssignModalOpen(true);
  };

  const resetForm = () => {
    setEditingGroup(null);
    setFormData({
      name: '',
      description: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const getAvailableUsers = () => {
    if (!selectedGroup) return users;
    const assignedUserIds = selectedGroup.userGroups?.map(ug => ug.user.id) || [];
    return users.filter(user => !assignedUserIds.includes(user.id));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Groups Management</h1>
        <div className="actions">
          <Button variant="primary" onClick={openCreateModal}>
            + Add Group
          </Button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <h3>Group Overview</h3>
        <p>Manage user groups. Groups can have users assigned to them and permissions granted for accessing resources.</p>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loader">
            <div className="loader-text">Loading groups...</div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Group Name</th>
                <th>Description</th>
                <th>Members</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.id}>
                  <td>{group.id}</td>
                  <td><strong>{group.name}</strong></td>
                  <td>{group.description || <span className="text-muted">No description</span>}</td>
                  <td>
                    <span className="badge badge-primary">
                      {group.userGroups?.length || 0} users
                    </span>
                  </td>
                  <td>{new Date(group.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="table-actions">
                      <Button variant="success" size="sm" onClick={() => openAssignModal(group)}>
                        👥 Assign
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleEdit(group)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(group.id)}>
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

      {/* Create/Edit Group Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGroup ? 'Edit Group' : 'Add New Group'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Group Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter group name"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter group description (optional)"
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
              {editingGroup ? 'Update Group' : 'Create Group'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign User to Group Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign User to ${selectedGroup?.name}`}
      >
        <form onSubmit={handleAssignUser}>
          <div className="card">
            <p>Select a user to assign to the group <strong>{selectedGroup?.name}</strong>.</p>
            {selectedGroup?.userGroups && selectedGroup.userGroups.length > 0 && (
              <div>
                <h4>Current Members:</h4>
                <ul>
                  {selectedGroup.userGroups.map(ug => (
                    <li key={ug.user.id}>{ug.user.username} ({ug.user.email})</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Select User *</label>
            <select
              className="form-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
            >
              <option value="">Choose a user to assign</option>
              {getAvailableUsers().map(user => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-actions">
            <Button 
              variant="secondary" 
              type="button" 
              onClick={() => setIsAssignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="success" type="submit" disabled={!selectedUserId}>
              Assign User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
