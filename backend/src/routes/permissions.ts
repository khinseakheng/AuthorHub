import express from 'express';
import { prisma } from '../lib/prisma';
import { createPermissionSchema, updatePermissionSchema, permissionCheckSchema } from '../schemas/validation';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Permission:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The permission ID
 *         groupId:
 *           type: integer
 *           description: The group ID
 *         resourceId:
 *           type: integer
 *           description: The resource ID
 *         canRead:
 *           type: boolean
 *           description: Read permission
 *         canCreate:
 *           type: boolean
 *           description: Create permission
 *         canUpdate:
 *           type: boolean
 *           description: Update permission
 *         canDelete:
 *           type: boolean
 *           description: Delete permission
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     CreatePermissionRequest:
 *       type: object
 *       required:
 *         - resourceId
 *       properties:
 *         resourceId:
 *           type: integer
 *           description: Resource ID
 *         canRead:
 *           type: boolean
 *           default: false
 *         canCreate:
 *           type: boolean
 *           default: false
 *         canUpdate:
 *           type: boolean
 *           default: false
 *         canDelete:
 *           type: boolean
 *           default: false
 *     PermissionCheckResponse:
 *       type: object
 *       properties:
 *         allowed:
 *           type: boolean
 *           description: Whether the permission is allowed
 *     UserPermissionsResponse:
 *       type: object
 *       properties:
 *         userId:
 *           type: integer
 *         groups:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *         permissions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: integer
 *               resource:
 *                 type: string
 *               canRead:
 *                 type: boolean
 *               canCreate:
 *                 type: boolean
 *               canUpdate:
 *                 type: boolean
 *               canDelete:
 *                 type: boolean
 */

/**
 * @swagger
 * /api/permissions/check:
 *   get:
 *     summary: Check if user has permission for a specific action on a resource
 *     tags: [Permissions]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: resource
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource key (e.g., account/change-password)
 *       - in: query
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *           enum: [read, create, update, delete]
 *         description: Action to check
 *     responses:
 *       200:
 *         description: Permission check result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PermissionCheckResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 */
// Check permission for user, resource, and action
router.get('/check', async (req: any, res: any) => {
  try {
    const { user_id, resource, action } = permissionCheckSchema.parse(req.query);
    
    // Get user with groups
    const user = await prisma.user.findUnique({
      where: { id: user_id },
      include: {
        userGroups: {
          include: {
            group: {
              include: {
                permissions: {
                  include: {
                    resource: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user has permission for the resource and action
    let allowed = false;
    
    for (const userGroup of user.userGroups) {
      for (const permission of userGroup.group.permissions) {
        if (permission.resource.key === resource) {
          switch (action) {
            case 'read':
              allowed = allowed || permission.canRead;
              break;
            case 'create':
              allowed = allowed || permission.canCreate;
              break;
            case 'update':
              allowed = allowed || permission.canUpdate;
              break;
            case 'delete':
              allowed = allowed || permission.canDelete;
              break;
          }
          if (allowed) break;
        }
      }
      if (allowed) break;
    }
    
    res.json({ allowed });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to check permission' });
  }
});

/**
 * @swagger
 * /api/permissions/user/{user_id}:
 *   get:
 *     summary: Get all permissions for a user
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User permissions with group origins
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPermissionsResponse'
 *       404:
 *         description: User not found
 */
// Get all permissions for a user
router.get('/user/:user_id', async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.user_id);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userGroups: {
          include: {
            group: {
              include: {
                permissions: {
                  include: {
                    resource: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const groups = user.userGroups.map(ug => ({
      id: ug.group.id,
      name: ug.group.name
    }));
    
    const permissions: any[] = [];
    
    for (const userGroup of user.userGroups) {
      for (const permission of userGroup.group.permissions) {
        permissions.push({
          groupId: userGroup.group.id,
          resource: permission.resource.key,
          canRead: permission.canRead,
          canCreate: permission.canCreate,
          canUpdate: permission.canUpdate,
          canDelete: permission.canDelete
        });
      }
    }
    
    res.json({
      userId: user.id,
      groups,
      permissions
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user permissions' });
  }
});

/**
 * @swagger
 * /api/permissions/groups/{groupId}:
 *   get:
 *     summary: Get all permissions for a group
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Permission'
 *       404:
 *         description: Group not found
 */
// Get permissions for a group
router.get('/groups/:groupId', async (req: any, res: any) => {
  try {
    const groupId = parseInt(req.params.groupId);
    
    // Check if group exists
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    const permissions = await prisma.permission.findMany({
      where: { groupId },
      include: {
        group: true,
        resource: true
      }
    });
    
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch group permissions' });
  }
});

/**
 * @swagger
 * /api/permissions/groups/{groupId}:
 *   post:
 *     summary: Create permission for a group
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePermissionRequest'
 *     responses:
 *       201:
 *         description: Permission created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permission'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Group or resource not found
 *       409:
 *         description: Permission already exists
 */
// Create permission for a group
router.post('/groups/:groupId', async (req: any, res: any) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const validatedData = createPermissionSchema.parse(req.body);
    
    // Check if group exists
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    // Check if resource exists
    const resource = await prisma.resource.findUnique({ where: { id: validatedData.resourceId } });
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    const permission = await prisma.permission.create({
      data: {
        groupId,
        ...validatedData
      },
      include: {
        group: true,
        resource: true
      }
    });
    
    res.status(201).json(permission);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Permission for this group and resource already exists' });
    }
    res.status(500).json({ error: 'Failed to create permission' });
  }
});

/**
 * @swagger
 * /api/permissions/groups/{groupId}/resources/{resourceId}:
 *   put:
 *     summary: Update permission
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Group ID
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Resource ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               canRead:
 *                 type: boolean
 *               canCreate:
 *                 type: boolean
 *               canUpdate:
 *                 type: boolean
 *               canDelete:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Permission updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permission'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Permission not found
 */
// Update permission
router.put('/groups/:groupId/resources/:resourceId', async (req: any, res: any) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const resourceId = parseInt(req.params.resourceId);
    const validatedData = updatePermissionSchema.parse(req.body);
    
    const permission = await prisma.permission.update({
      where: {
        groupId_resourceId: {
          groupId,
          resourceId
        }
      },
      data: validatedData,
      include: {
        group: true,
        resource: true
      }
    });
    
    res.json(permission);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Permission not found' });
    }
    res.status(500).json({ error: 'Failed to update permission' });
  }
});

/**
 * @swagger
 * /api/permissions/groups/{groupId}/resources/{resourceId}:
 *   delete:
 *     summary: Delete permission
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Group ID
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Permission deleted successfully
 *       404:
 *         description: Permission not found
 */
// Delete permission
router.delete('/groups/:groupId/resources/:resourceId', async (req: any, res: any) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const resourceId = parseInt(req.params.resourceId);
    
    await prisma.permission.delete({
      where: {
        groupId_resourceId: {
          groupId,
          resourceId
        }
      }
    });
    
    res.json({ message: 'Permission deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Permission not found' });
    }
    res.status(500).json({ error: 'Failed to delete permission' });
  }
});

export default router;
