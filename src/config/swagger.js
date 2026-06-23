import swaggerJSDoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NurseryOS API Documentation',
      version: '1.0.0',
      description: 'Production-ready Node.js API documentation for NurseryOS.',
      contact: {
        name: 'Developer Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token in the format: Bearer <token>',
        },
      },
      schemas: {
        GenericError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Detailed error message' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Invalid email format' },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.join(__dirname, '../modules/**/*.routes.js').replace(/\\/g, '/'),
    path.join(__dirname, '../modules/**/*.js').replace(/\\/g, '/'),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
