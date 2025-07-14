import express from 'express';
import { prisma } from '../lib/prisma';
import { createGroupSchema, updateGroupSchema, assignUserToGroupSchema } from '../schemas/validation';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The group ID
 *         name:
 *           type: string
 *           description: The group name
 *         description:
 *           type: string
 *           description: The group description
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     CreateGroupRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *     AssignUserRequest:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         userId:
 *           type: integer
 */

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Get all groups
 *     tags: [Groups]
 *     responses:
 *       200:
 *         description: List of groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Group'
 */

// Get all groups
router.get('/', async (req: any, res: any) => {
  try {
    const groups = await prisma.group.findMany({
      include: {
        userGroups: {
          include: {
            user: true
          }
        },
        permissions: {
          include: {
            resource: true
          }
        }
      }
    });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

/**
 * @swagger
 * /api/groups/{id}:
 *   get:
 *     summary: Get group by ID
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       404:
 *         description: Group not found
 */
// Get group by ID
router.get('/:id', async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        userGroups: {
          include: {
            user: true
          }
        },
        permissions: {
          include: {
            resource: true
          }
        }
      }
    });
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGroupRequest'
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Group already exists
 */
// Create new group
router.post('/', async (req: any, res: any) => {
  try {
    const validatedData = createGroupSchema.parse(req.body);
    
    const group = await prisma.group.create({
      data: validatedData,
      include: {
        userGroups: {
          include: {
            user: true
          }
        },
        permissions: {
          include: {
            resource: true
          }
        }
      }
    });
    
    res.status(201).json(group);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Group with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create group' });
  }
});

/**
 * @swagger
 * /api/groups/{id}:
 *   put:
 *     summary: Update group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGroupRequest'
 *     responses:
 *       200:
 *         description: Group updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       404:
 *         description: Group not found
 *       400:
 *         description: Validation error
 */
// Update group
router.put('/:id', async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = updateGroupSchema.parse(req.body);
    
    const group = await prisma.group.update({
      where: { id },
      data: validatedData,
      include: {
        userGroups: {
          include: {
            user: true
          }
        },
        permissions: {
          include: {
            resource: true
          }
        }
      }
    });
    
    res.json(group);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Group not found' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Group with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to update group' });
  }
});

/**
 * @swagger
 * /api/groups/{id}:
 *   delete:
 *     summary: Delete group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group deleted successfully
 *       404:
 *         description: Group not found
 */
// Delete group
router.delete('/:id', async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    
    await prisma.group.delete({
      where: { id }
    });
    
    res.json({ message: 'Group deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

/**
 * @swagger
 * /api/groups/{id}/users:
 *   post:
 *     summary: Assign user to group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignUserRequest'
 *     responses:
 *       201:
 *         description: User assigned to group successfully
 *       404:
 *         description: Group or user not found
 *       409:
 *         description: User already assigned to group
 */
// Assign user to group
router.post('/:id/users', async (req: any, res: any) => {
  try {
    const groupId = parseInt(req.params.id);
    const { userId } = assignUserToGroupSchema.parse(req.body);
    
    // Check if group exists
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Create user-group relationship
    const userGroup = await prisma.userGroup.create({
      data: {
        userId,
        groupId
      },
      include: {
        user: true,
        group: true
      }
    });
    
    res.status(201).json(userGroup);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'User is already assigned to this group' });
    }
    res.status(500).json({ error: 'Failed to assign user to group' });
  }
});

/**
 * @swagger
 * /api/groups/{id}/users/{userId}:
 *   delete:
 *     summary: Remove user from group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Group ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User removed from group successfully
 *       404:
 *         description: User-group relationship not found
 */
// Remove user from group
router.delete('/:id/users/:userId', async (req: any, res: any) => {
  try {
    const groupId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);
    
    await prisma.userGroup.delete({
      where: {
        userId_groupId: {
          userId,
          groupId
        }
      }
    });
    
    res.json({ message: 'User removed from group successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User-group relationship not found' });
    }
    res.status(500).json({ error: 'Failed to remove user from group' });
  }
});

export default router;
