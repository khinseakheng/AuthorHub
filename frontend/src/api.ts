const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `HTTP error! status: ${res.status}`);
  }
  
  return res.json();
}

// API based on actual backend specification
export const api = {
  // Users - id, username, email, name, createdAt, updatedAt
  users: {
    getAll: () => apiFetch('/api/users'),
    getById: (id: number) => apiFetch(`/api/users/${id}`),
    create: (data: { username: string; email: string; name?: string }) => 
      apiFetch('/api/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: { username?: string; email?: string; name?: string }) => 
      apiFetch(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => apiFetch(`/api/users/${id}`, { method: 'DELETE' }),
  },
  
  // Groups - id, name, description, createdAt, updatedAt
  groups: {
    getAll: () => apiFetch('/api/groups'),
    getById: (id: number) => apiFetch(`/api/groups/${id}`),
    create: (data: { name: string; description?: string }) => 
      apiFetch('/api/groups', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: { name?: string; description?: string }) => 
      apiFetch(`/api/groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => apiFetch(`/api/groups/${id}`, { method: 'DELETE' }),
    assignUser: (groupId: number, userId: number) => 
      apiFetch(`/api/groups/${groupId}/users`, { method: 'POST', body: JSON.stringify({ userId }) }),
    removeUser: (groupId: number, userId: number) => 
      apiFetch(`/api/groups/${groupId}/users/${userId}`, { method: 'DELETE' }),
  },
  
  // Resources - id, key, name, description, createdAt, updatedAt
  resources: {
    getAll: () => apiFetch('/api/resources'),
    getById: (id: number) => apiFetch(`/api/resources/${id}`),
    create: (data: { key: string; name?: string; description?: string }) => 
      apiFetch('/api/resources', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: { key?: string; name?: string; description?: string }) => 
      apiFetch(`/api/resources/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => apiFetch(`/api/resources/${id}`, { method: 'DELETE' }),
  },
  
  // Permissions - group-centric permission management
  permissions: {
    getUserPermissions: (userId: number) => apiFetch(`/api/permissions/user/${userId}`),
    getGroupPermissions: (groupId: number) => apiFetch(`/api/permissions/groups/${groupId}`),
    createGroupPermission: (groupId: number, data: { resourceId: number; canRead?: boolean; canCreate?: boolean; canUpdate?: boolean; canDelete?: boolean }) => 
      apiFetch(`/api/permissions/groups/${groupId}`, { method: 'POST', body: JSON.stringify(data) }),
    updateGroupPermission: (groupId: number, resourceId: number, data: { canRead?: boolean; canCreate?: boolean; canUpdate?: boolean; canDelete?: boolean }) => 
      apiFetch(`/api/permissions/groups/${groupId}/resources/${resourceId}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteGroupPermission: (groupId: number, resourceId: number) => 
      apiFetch(`/api/permissions/groups/${groupId}/resources/${resourceId}`, { method: 'DELETE' }),
    checkPermission: (userId: number, resource: string, action: 'read' | 'create' | 'update' | 'delete') => 
      apiFetch(`/api/permissions/check?user_id=${userId}&resource=${resource}&action=${action}`),
  },
};
