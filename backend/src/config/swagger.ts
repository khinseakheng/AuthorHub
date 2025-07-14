import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AuthorHub API',
      version: '1.0.0',
      description: 'Centralized user and permission management system API',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Users',
        description: 'User management operations'
      },
      {
        name: 'Groups',
        description: 'Group (Role) management operations'
      },
      {
        name: 'Resources',
        description: 'Resource management operations'
      },
      {
        name: 'Permissions',
        description: 'Permission management and checking operations'
      }
    ]
  },
  apis: ['./src/routes/*.ts'], // paths to files containing OpenAPI definitions
};

export const swaggerSpec = swaggerJsdoc(options);
