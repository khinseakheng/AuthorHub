import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
  userGroups?: UserGroup[];
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  userGroups?: UserGroup[];
  permissions?: Permission[];
}

export interface Resource {
  id: number;
  key: string;
  name?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  groupId: number;
  resourceId: number;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
  group?: Group;
  resource?: Resource;
}

export interface UserGroup {
  id: number;
  userId: number;
  groupId: number;
  user?: User;
  group?: Group;
}

export interface CreateUserData {
  username: string;
  email: string;
  name?: string;
}

export interface CreateGroupData {
  name: string;
  description?: string;
}

export interface CreateResourceData {
  key: string;
  name?: string;
  description?: string;
}

export interface CreatePermissionData {
  resourceId: number;
  canRead?: boolean;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

// API functions
export const api_service = {
  // Users
  getUsers: () => api.get<User[]>('/api/users'),
  getUser: (id: number) => api.get<User>(`/api/users/${id}`),
  createUser: (data: CreateUserData) => api.post<User>('/api/users', data),
  updateUser: (id: number, data: Partial<CreateUserData>) => api.put<User>(`/api/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/api/users/${id}`),

  // Groups
  getGroups: () => api.get<Group[]>('/api/groups'),
  getGroup: (id: number) => api.get<Group>(`/api/groups/${id}`),
  createGroup: (data: CreateGroupData) => api.post<Group>('/api/groups', data),
  updateGroup: (id: number, data: Partial<CreateGroupData>) => api.put<Group>(`/api/groups/${id}`, data),
  deleteGroup: (id: number) => api.delete(`/api/groups/${id}`),
  assignUserToGroup: (groupId: number, userId: number) => 
    api.post(`/api/groups/${groupId}/users`, { userId }),
  removeUserFromGroup: (groupId: number, userId: number) => 
    api.delete(`/api/groups/${groupId}/users/${userId}`),

  // Resources
  getResources: () => api.get<Resource[]>('/api/resources'),
  getResource: (id: number) => api.get<Resource>(`/api/resources/${id}`),
  createResource: (data: CreateResourceData) => api.post<Resource>('/api/resources', data),
  updateResource: (id: number, data: Partial<CreateResourceData>) => api.put<Resource>(`/api/resources/${id}`, data),
  deleteResource: (id: number) => api.delete(`/api/resources/${id}`),

  // Permissions
  checkPermission: (userId: number, resource: string, action: 'read' | 'create' | 'update' | 'delete') =>
    api.get<{ allowed: boolean }>(`/api/permissions/check?user_id=${userId}&resource=${resource}&action=${action}`),
  getUserPermissions: (userId: number) => api.get(`/api/permissions/user/${userId}`),
  createPermission: (groupId: number, data: CreatePermissionData) => 
    api.post<Permission>(`/api/permissions/groups/${groupId}`, data),
  updatePermission: (groupId: number, resourceId: number, data: Partial<CreatePermissionData>) =>
    api.put<Permission>(`/api/permissions/groups/${groupId}/resources/${resourceId}`, data),
  deletePermission: (groupId: number, resourceId: number) =>
    api.delete(`/api/permissions/groups/${groupId}/resources/${resourceId}`),
};
