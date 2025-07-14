import { z } from 'zod';

// User schemas
export const createUserSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email format'),
  name: z.string().optional(),
});

export const updateUserSchema = z.object({
  username: z.string().min(1, 'Username is required').optional(),
  email: z.string().email('Invalid email format').optional(),
  name: z.string().optional(),
});

// Group schemas
export const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  description: z.string().optional(),
});

export const updateGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').optional(),
  description: z.string().optional(),
});

// Resource schemas
export const createResourceSchema = z.object({
  key: z.string().min(1, 'Resource key is required'),
  name: z.string().optional(),
  description: z.string().optional(),
});

export const updateResourceSchema = z.object({
  key: z.string().min(1, 'Resource key is required').optional(),
  name: z.string().optional(),
  description: z.string().optional(),
});

// Permission schemas
export const createPermissionSchema = z.object({
  resourceId: z.number().int().positive('Invalid resource ID'),
  canRead: z.boolean().default(false),
  canCreate: z.boolean().default(false),
  canUpdate: z.boolean().default(false),
  canDelete: z.boolean().default(false),
});

export const updatePermissionSchema = z.object({
  canRead: z.boolean().optional(),
  canCreate: z.boolean().optional(),
  canUpdate: z.boolean().optional(),
  canDelete: z.boolean().optional(),
});

// User group assignment schema
export const assignUserToGroupSchema = z.object({
  userId: z.number().int().positive('Invalid user ID'),
});

// Permission check schema
export const permissionCheckSchema = z.object({
  user_id: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive()),
  resource: z.string().min(1, 'Resource is required'),
  action: z.enum(['read', 'create', 'update', 'delete'], {
    errorMap: () => ({ message: 'Action must be one of: read, create, update, delete' })
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;
export type AssignUserToGroupInput = z.infer<typeof assignUserToGroupSchema>;
export type PermissionCheckInput = z.infer<typeof permissionCheckSchema>;
