import express from 'express';
import { prisma } from '../lib/prisma';
import { createResourceSchema, updateResourceSchema } from '../schemas/validation';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Resource:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The resource ID
 *         key:
 *           type: string
 *           description: The resource key (e.g., account/change-password)
 *         name:
 *           type: string
 *           description: Human readable name
 *         description:
 *           type: string
 *           description: Resource description
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     CreateResourceRequest:
 *       type: object
 *       required:
 *         - key
 *       properties:
 *         key:
 *           type: string
 *           description: Unique resource key
 *         name:
 *           type: string
 *           description: Human readable name
 *         description:
 *           type: string
 *           description: Resource description
 */

/**
 * @swagger
 * /api/resources:
 *   get:
 *     summary: Get all resources
 *     tags: [Resources]
 *     responses:
 *       200:
 *         description: List of resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 */
// Get all resources
router.get('/', async (req: any, res: any) => {
  try {
    const resources = await prisma.resource.findMany({
      include: {
        permissions: {
          include: {
            group: true
          }
        }
      }
    });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

/**
 * @swagger
 * /api/resources/{id}:
 *   get:
 *     summary: Get resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       404:
 *         description: Resource not found
 */
// Get resource by ID
router.get('/:id', async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            group: true
          }
        }
      }
    });
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

/**
 * @swagger
 * /api/resources:
 *   post:
 *     summary: Create a new resource
 *     tags: [Resources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResourceRequest'
 *     responses:
 *       201:
 *         description: Resource created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Resource with this key already exists
 */
// Create new resource
router.post('/', async (req: any, res: any) => {
  try {
    const validatedData = createResourceSchema.parse(req.body);
    
    const resource = await prisma.resource.create({
      data: validatedData,
      include: {
        permissions: {
          include: {
            group: true
          }
        }
      }
    });
    
    res.status(201).json(resource);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Resource with this key already exists' });
    }
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

/**
 * @swagger
 * /api/resources/{id}:
 *   put:
 *     summary: Update resource
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Resource ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResourceRequest'
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       404:
 *         description: Resource not found
 *       400:
 *         description: Validation error
 */
// Update resource
router.put('/:id', async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = updateResourceSchema.parse(req.body);
    
    const resource = await prisma.resource.update({
      where: { id },
      data: validatedData,
      include: {
        permissions: {
          include: {
            group: true
          }
        }
      }
    });
    
    res.json(resource);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Resource not found' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Resource with this key already exists' });
    }
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

/**
 * @swagger
 * /api/resources/{id}:
 *   delete:
 *     summary: Delete resource
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *       404:
 *         description: Resource not found
 */
// Delete resource
router.delete('/:id', async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    
    await prisma.resource.delete({
      where: { id }
    });
    
    res.json({ message: 'Resource deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

export default router;
