import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import '../components/Table.css';

interface Permission {
  id: number;
  groupId: number;
  resourceId: number;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
}

interface Group {
  id: number;
  name: string;
  description?: string;
}

interface Resource {
  id: number;
  name: string;
  key: string;
  type?: string;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

type ActiveTab = 'users' | 'groups';

export const PermissionsPage: React.FC = () => {
  // Core data state
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  
  // Selection state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [userPermissions, setUserPermissions] = useState<any>(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('users');
  const [loading, setLoading] = useState(true);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Search and filter state
  const [userSearch, setUserSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [formData, setFormData] = useState({
    resourceId: '',
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false
  });

  // Filtered data using useMemo for performance
  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    return users.filter(user => 
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [users, userSearch]);

  const filteredGroups = useMemo(() => {
    if (!groupSearch) return groups;
    return groups.filter(group => 
      group.name.toLowerCase().includes(groupSearch.toLowerCase()) ||
      (group.description && group.description.toLowerCase().includes(groupSearch.toLowerCase()))
    );
  }, [groups, groupSearch]);

  const filteredPermissions = useMemo(() => {
    if (!resourceFilter) return permissions;
    return permissions.filter(permission => {
      const resource = resources.find(r => r.id === permission.resourceId);
      return resource && resource.name.toLowerCase().includes(resourceFilter.toLowerCase());
    });
  }, [permissions, resourceFilter, resources]);

  useEffect(() => {
    loadData();
  }, []);

  // Toast management
  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    const toast: Toast = { id, type, message };
    setToasts(prev => [...prev, toast]);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, groupsData, resourcesData] = await Promise.all([
        api.users.getAll(),
        api.groups.getAll(),
        api.resources.getAll()
      ]);
      console.log('Loaded data:', { users: usersData, groups: groupsData, resources: resourcesData }); // Debug log
      setUsers(usersData);
      setGroups(groupsData);
      setResources(resourcesData);
      addToast('success', 'Data loaded successfully');
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPermissions = async (userId: number) => {
    try {
      setLoadingPermissions(true);
      const data = await api.permissions.getUserPermissions(userId);
      setUserPermissions(data);
      console.log('User permissions data:', data); // Debug log to see the actual structure
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to load user permissions');
    } finally {
      setLoadingPermissions(false);
    }
  };

  const loadGroupPermissions = async (groupId: number) => {
    try {
      setLoadingPermissions(true);
      const data = await api.permissions.getGroupPermissions(groupId);
      setPermissions(data);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to load group permissions');
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) {
      addToast('error', 'Please select a group first');
      return;
    }

    try {
      setProcessingAction(true);
      const permissionData = {
        resourceId: parseInt(formData.resourceId),
        canRead: formData.canRead,
        canCreate: formData.canCreate,
        canUpdate: formData.canUpdate,
        canDelete: formData.canDelete
      };

      if (editingPermission) {
        await api.permissions.updateGroupPermission(selectedGroup.id, parseInt(formData.resourceId), permissionData);
        addToast('success', 'Permission updated successfully');
      } else {
        await api.permissions.createGroupPermission(selectedGroup.id, permissionData);
        addToast('success', 'Permission created successfully');
      }

      loadGroupPermissions(selectedGroup.id);
      setIsModalOpen(false);
      setEditingPermission(null);
      resetForm();
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to save permission');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDeletePermission = async (groupId: number, resourceId: number) => {
    if (!window.confirm('Are you sure you want to delete this permission?')) return;

    try {
      setProcessingAction(true);
      await api.permissions.deleteGroupPermission(groupId, resourceId);
      loadGroupPermissions(groupId);
      addToast('success', 'Permission deleted successfully');
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to delete permission');
    } finally {
      setProcessingAction(false);
    }
  };

  // Quick actions for bulk permission management
  const applyQuickPermission = async (type: 'all' | 'readonly' | 'clear') => {
    if (!selectedGroup) {
      addToast('error', 'Please select a group first');
      return;
    }

    try {
      setProcessingAction(true);
      const actions = [];

      for (const resource of resources) {
        const existingPermission = permissions.find(p => p.resourceId === resource.id);
        
        let permissionData;
        switch (type) {
          case 'all':
            permissionData = { canRead: true, canCreate: true, canUpdate: true, canDelete: true };
            break;
          case 'readonly':
            permissionData = { canRead: true, canCreate: false, canUpdate: false, canDelete: false };
            break;
          case 'clear':
            if (existingPermission) {
              actions.push(api.permissions.deleteGroupPermission(selectedGroup.id, resource.id));
            }
            continue;
        }

        if (existingPermission) {
          actions.push(api.permissions.updateGroupPermission(selectedGroup.id, resource.id, permissionData));
        } else {
          actions.push(api.permissions.createGroupPermission(selectedGroup.id, { 
            resourceId: resource.id, 
            ...permissionData 
          }));
        }
      }

      await Promise.all(actions);
      loadGroupPermissions(selectedGroup.id);
      addToast('success', `${type === 'all' ? 'Full' : type === 'readonly' ? 'Read-only' : 'All'} permissions ${type === 'clear' ? 'cleared' : 'applied'} successfully`);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to apply bulk permissions');
    } finally {
      setProcessingAction(false);
    }
  };

  const resetForm = () => {
    setFormData({
      resourceId: '',
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false
    });
  };

  const openCreateModal = () => {
    if (!selectedGroup) {
      addToast('error', 'Please select a group first');
      return;
    }
    resetForm();
    setEditingPermission(null);
    setIsModalOpen(true);
  };

  const openEditModal = (permission: Permission) => {
    setFormData({
      resourceId: permission.resourceId.toString(),
      canRead: permission.canRead,
      canCreate: permission.canCreate,
      canUpdate: permission.canUpdate,
      canDelete: permission.canDelete
    });
    setEditingPermission(permission);
    setIsModalOpen(true);
  };

  const getResourceName = (resourceId: number) => {
    // Check for valid resourceId (allow 0 as valid ID)
    if (resourceId === undefined || resourceId === null || isNaN(resourceId)) {
      console.log('Invalid resourceId provided:', resourceId);
      return 'Unknown Resource';
    }
    
    // Simple exact match first
    const resource = resources.find(r => r.id === resourceId);
    
    console.log('Looking for resource ID:', resourceId, 'Found:', resource, 'Total resources:', resources.length);
    
    if (!resource) {
      return `Resource ${resourceId}`;
    }
    
    return resource.name || resource.key || `Resource ${resourceId}`;
  };

  const handleUserSelect = (userId: string) => {
    const user = users.find(u => u.id === parseInt(userId));
    setSelectedUser(user || null);
    setUserPermissions(null);
    console.log('User selected:', user, 'Resources loaded:', resources.length);
    if (user && resources.length > 0) { // Make sure resources are loaded
      loadUserPermissions(parseInt(userId));
    } else if (user && resources.length === 0) {
      console.log('Resources not loaded yet, waiting...');
      // If resources aren't loaded yet, wait a bit and try again
      setTimeout(() => {
        if (resources.length > 0) {
          console.log('Resources now loaded, loading user permissions');
          loadUserPermissions(parseInt(userId));
        }
      }, 500);
    }
  };

  const handleGroupSelect = (groupId: string) => {
    const group = groups.find(g => g.id === parseInt(groupId));
    setSelectedGroup(group || null);
    setPermissions([]);
    if (group) {
      loadGroupPermissions(parseInt(groupId));
    }
  };

  // Helper function to normalize permission data from API
  const normalizePermissionData = (perm: any) => {
    // Handle different possible field names and formats
    const normalized = {
      canRead: perm.canRead || perm.read || perm.can_read || false,
      canCreate: perm.canCreate || perm.create || perm.can_create || false,
      canUpdate: perm.canUpdate || perm.update || perm.can_update || false,
      canDelete: perm.canDelete || perm.delete || perm.can_delete || false,
      resourceId: perm.resourceId || perm.resource_id || perm.resourceID,
      groupId: perm.groupId || perm.group_id || perm.groupID
    };
    
    // Convert string numbers to integers if needed
    if (typeof normalized.resourceId === 'string') {
      normalized.resourceId = parseInt(normalized.resourceId);
    }
    if (typeof normalized.groupId === 'string') {
      normalized.groupId = parseInt(normalized.groupId);
    }
    
    return normalized;
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="loading-skeleton">
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Permissions Management</h1>
            <p>Loading permissions data...</p>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="toast-close">×</button>
          </div>
        ))}
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Permissions Management</h1>
          <p>Manage group permissions and view user permissions</p>
        </div>
        <div className="page-actions">
          <Button onClick={loadData} variant="secondary" disabled={loading}>
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="permissions-tabs">
        <div className="tab-nav">
          <button 
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 User Permissions
          </button>
          <button 
            className={`tab-button ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            🏢 Group Permissions
          </button>
        </div>

        <div className="tab-content">
          {/* User Permissions Tab */}
          {activeTab === 'users' && (
            <div className="permissions-section">
              <div className="section-header">
                <h2>User Permissions Overview</h2>
                <p>View effective permissions for individual users</p>
              </div>

              <div className="controls-row">
                <div className="search-group">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="search-input"
                  />
                </div>
                <select 
                  value={selectedUser?.id || ''} 
                  onChange={(e) => handleUserSelect(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select a user...</option>
                  {filteredUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.username})
                    </option>
                  ))}
                </select>
              </div>

              {selectedUser && (
                <div className="user-permissions-display">
                  <div className="user-info-card">
                    <h3>
                      <span className="user-avatar">👤</span>
                      Permissions for {selectedUser.name}
                    </h3>
                    <p className="user-email">{selectedUser.email}</p>
                  </div>

                  {loadingPermissions ? (
                    <LoadingSkeleton />
                  ) : userPermissions ? (
                    <>
                      <div className="user-groups">
                        <h4>📋 Assigned Groups</h4>
                        {userPermissions.groups.length > 0 ? (
                          <div className="groups-grid">
                            {userPermissions.groups.map((group: any) => (
                              <div key={group.id} className="group-card">
                                {group.name}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="empty-state">
                            <p>👥 No groups assigned</p>
                          </div>
                        )}
                      </div>

                      <div className="user-permissions-list">
                        <h4>🔐 Effective Permissions</h4>
                        {resources.length === 0 && (
                          <div style={{background: '#fef3c7', padding: '1rem', borderRadius: '6px', marginBottom: '1rem'}}>
                            ⚠️ Resources are still loading. Please wait...
                          </div>
                        )}
                        {userPermissions.permissions.length > 0 ? (
                          <div className="table-container">
                            <table className="table">
                              <thead>
                                <tr>
                                  <th>Resource</th>
                                  <th>Permissions</th>
                                  <th>Source Group</th>
                                </tr>
                              </thead>
                              <tbody>
                                {userPermissions.permissions.map((permRaw: any) => {
                                  const perm = normalizePermissionData(permRaw);
                                  console.log('Processing permission - Resource ID:', perm.resourceId, 'Available resources:', resources.length);
                                  return (
                                    <tr key={`${perm.groupId}-${perm.resourceId}`}>
                                      <td>
                                        <div className="resource-cell">
                                          <span className="resource-name">{getResourceName(perm.resourceId)}</span>
                                          <span className="resource-key">
                                            {resources.find(r => r.id === perm.resourceId)?.key || 'N/A'}
                                          </span>
                                        </div>
                                      </td>
                                      <td>
                                        <div className="permission-badges">
                                          {perm.canRead && <span className="badge success">Read</span>}
                                          {perm.canCreate && <span className="badge primary">Create</span>}
                                          {perm.canUpdate && <span className="badge warning">Update</span>}
                                          {perm.canDelete && <span className="badge danger">Delete</span>}
                                          {!perm.canRead && !perm.canCreate && !perm.canUpdate && !perm.canDelete && (
                                            <span className="badge secondary">No permissions</span>
                                          )}
                                        </div>
                                      </td>
                                      <td>
                                        {groups.find(g => g.id === perm.groupId)?.name || `Group ${perm.groupId}`}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="empty-state">
                            <p>🔒 No permissions found</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="empty-state">
                      <p>Select a user to view their permissions</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Group Permissions Tab */}
          {activeTab === 'groups' && (
            <div className="permissions-section">
              <div className="section-header">
                <h2>Group Permissions Management</h2>
                <p>Configure permissions for groups and manage access control</p>
              </div>

              <div className="controls-row">
                <div className="search-group">
                  <input
                    type="text"
                    placeholder="Search groups..."
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                    className="search-input"
                  />
                </div>
                <select 
                  value={selectedGroup?.id || ''} 
                  onChange={(e) => handleGroupSelect(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select a group...</option>
                  {filteredGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedGroup && (
                <>
                  <div className="group-info-card">
                    <h3>
                      <span className="group-icon">🏢</span>
                      Permissions for {selectedGroup.name}
                    </h3>
                    {selectedGroup.description && (
                      <p className="group-description">{selectedGroup.description}</p>
                    )}
                  </div>

                  <div className="group-actions">
                    <div className="action-row">
                      <div className="quick-actions">
                        <span className="quick-actions-label">Quick Actions:</span>
                        <Button 
                          onClick={() => applyQuickPermission('all')} 
                          variant="primary" 
                          size="sm"
                          disabled={processingAction}
                        >
                          🔓 Grant All
                        </Button>
                        <Button 
                          onClick={() => applyQuickPermission('readonly')} 
                          variant="secondary" 
                          size="sm"
                          disabled={processingAction}
                        >
                          👁️ Read Only
                        </Button>
                        <Button 
                          onClick={() => applyQuickPermission('clear')} 
                          variant="danger" 
                          size="sm"
                          disabled={processingAction}
                        >
                          🗑️ Clear All
                        </Button>
                      </div>
                      <Button onClick={openCreateModal} variant="primary">
                        ➕ Add Permission
                      </Button>
                    </div>

                    {filteredPermissions.length > 0 && (
                      <div className="filter-row">
                        <input
                          type="text"
                          placeholder="Filter by resource..."
                          value={resourceFilter}
                          onChange={(e) => setResourceFilter(e.target.value)}
                          className="search-input"
                        />
                      </div>
                    )}
                  </div>

                  {loadingPermissions ? (
                    <LoadingSkeleton />
                  ) : (
                    <div className="group-permissions">
                      {filteredPermissions.length > 0 ? (
                        <div className="table-container">
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Resource</th>
                                <th>Permissions</th>
                                <th>Created</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredPermissions.map(permission => (
                                <tr key={permission.id}>
                                  <td>
                                    <div className="resource-cell">
                                      <span className="resource-name">{getResourceName(permission.resourceId)}</span>
                                      <span className="resource-key">
                                        {resources.find(r => r.id === permission.resourceId)?.key}
                                      </span>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="permission-badges">
                                      {permission.canRead && <span className="badge success">Read</span>}
                                      {permission.canCreate && <span className="badge primary">Create</span>}
                                      {permission.canUpdate && <span className="badge warning">Update</span>}
                                      {permission.canDelete && <span className="badge danger">Delete</span>}
                                      {!permission.canRead && !permission.canCreate && !permission.canUpdate && !permission.canDelete && (
                                        <span className="badge secondary">No permissions</span>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    {permission.createdAt ? new Date(permission.createdAt).toLocaleDateString() : 'N/A'}
                                  </td>
                                  <td>
                                    <div className="action-buttons">
                                      <Button
                                        onClick={() => openEditModal(permission)}
                                        variant="secondary"
                                        size="sm"
                                        disabled={processingAction}
                                      >
                                        ✏️ Edit
                                      </Button>
                                      <Button
                                        onClick={() => handleDeletePermission(permission.groupId, permission.resourceId)}
                                        variant="danger"
                                        size="sm"
                                        disabled={processingAction}
                                      >
                                        🗑️ Delete
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="empty-state">
                          <div className="empty-icon">🔐</div>
                          <h4>No permissions configured</h4>
                          <p>Start by adding permissions for this group</p>
                          <Button onClick={openCreateModal} variant="primary">
                            Add First Permission
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {!selectedGroup && (
                <div className="empty-state">
                  <div className="empty-icon">🏢</div>
                  <h4>Select a group to manage permissions</h4>
                  <p>Choose a group from the dropdown above to view and manage its permissions</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Permission Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPermission(null);
          resetForm();
        }}
        title={editingPermission ? '✏️ Edit Permission' : '➕ Create Permission'}
      >
        <form onSubmit={handleSubmit} className="enhanced-form">
          <div className="form-group">
            <label htmlFor="resourceId">
              <span className="label-icon">📦</span>
              Resource *
            </label>
            <select
              id="resourceId"
              value={formData.resourceId}
              onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
              required
              className="form-select"
              disabled={!!editingPermission}
            >
              <option value="">Select a resource...</option>
              {resources.map(resource => (
                <option key={resource.id} value={resource.id}>
                  {resource.name} ({resource.key})
                </option>
              ))}
            </select>
            {editingPermission && (
              <small className="form-help">Resource cannot be changed when editing</small>
            )}
          </div>

          <div className="form-group">
            <label>
              <span className="label-icon">🔐</span>
              Permissions
            </label>
            <div className="permission-checkboxes">
              <label className="permission-checkbox">
                <input
                  type="checkbox"
                  checked={formData.canRead}
                  onChange={(e) => setFormData({ ...formData, canRead: e.target.checked })}
                />
                <span className="checkbox-custom"></span>
                <span className="permission-label">
                  <span className="permission-icon">👁️</span>
                  Can Read
                  <span className="permission-desc">View and retrieve data</span>
                </span>
              </label>
              <label className="permission-checkbox">
                <input
                  type="checkbox"
                  checked={formData.canCreate}
                  onChange={(e) => setFormData({ ...formData, canCreate: e.target.checked })}
                />
                <span className="checkbox-custom"></span>
                <span className="permission-label">
                  <span className="permission-icon">➕</span>
                  Can Create
                  <span className="permission-desc">Add new records</span>
                </span>
              </label>
              <label className="permission-checkbox">
                <input
                  type="checkbox"
                  checked={formData.canUpdate}
                  onChange={(e) => setFormData({ ...formData, canUpdate: e.target.checked })}
                />
                <span className="checkbox-custom"></span>
                <span className="permission-label">
                  <span className="permission-icon">✏️</span>
                  Can Update
                  <span className="permission-desc">Modify existing records</span>
                </span>
              </label>
              <label className="permission-checkbox">
                <input
                  type="checkbox"
                  checked={formData.canDelete}
                  onChange={(e) => setFormData({ ...formData, canDelete: e.target.checked })}
                />
                <span className="checkbox-custom"></span>
                <span className="permission-label">
                  <span className="permission-icon">🗑️</span>
                  Can Delete
                  <span className="permission-desc">Remove records permanently</span>
                </span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <Button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingPermission(null);
                resetForm();
              }}
              variant="secondary"
              disabled={processingAction}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={processingAction}
            >
              {processingAction ? '⏳ Saving...' : (editingPermission ? 'Update Permission' : 'Create Permission')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
