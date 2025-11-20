/**
 * Swagger/OpenAPI Documentation for Anclora Impulso API
 */

export const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Anclora Impulso API',
    description: 'AI-powered fitness training and progress tracking API',
    version: '1.0.0',
    contact: {
      name: 'Anclora Impulso Support',
      url: 'https://ancloraimpulso.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3001/api',
      description: 'Development server',
    },
    {
      url: 'https://api.ancloraimpulso.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'User unique identifier',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
          },
          fullName: {
            type: 'string',
            description: 'User full name',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'User creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
        required: ['id', 'email', 'fullName', 'createdAt'],
      },
      Exercise: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          name: {
            type: 'string',
            description: 'Exercise name',
          },
          description: {
            type: 'string',
            description: 'Exercise description',
          },
          category: {
            type: 'string',
            enum: ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio'],
            description: 'Exercise category',
          },
          difficulty: {
            type: 'string',
            enum: ['beginner', 'intermediate', 'advanced'],
            description: 'Exercise difficulty level',
          },
          equipment: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Required equipment',
          },
          muscleGroups: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Target muscle groups',
          },
          sets: {
            type: 'integer',
            description: 'Recommended number of sets',
          },
          reps: {
            type: 'string',
            description: 'Recommended number of reps',
          },
          duration: {
            type: 'integer',
            description: 'Duration in seconds',
          },
        },
        required: ['id', 'name', 'category', 'difficulty'],
      },
      Workout: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          userId: {
            type: 'string',
            format: 'uuid',
          },
          name: {
            type: 'string',
            description: 'Workout name',
          },
          description: {
            type: 'string',
          },
          exercises: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                exerciseId: {
                  type: 'string',
                  format: 'uuid',
                },
                sets: {
                  type: 'integer',
                },
                reps: {
                  type: 'string',
                },
                weight: {
                  type: 'number',
                },
                duration: {
                  type: 'integer',
                },
              },
            },
          },
          difficulty: {
            type: 'string',
            enum: ['beginner', 'intermediate', 'advanced'],
          },
          estimatedDuration: {
            type: 'integer',
            description: 'Estimated duration in minutes',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
        required: ['id', 'userId', 'name', 'exercises'],
      },
      Progress: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          userId: {
            type: 'string',
            format: 'uuid',
          },
          date: {
            type: 'string',
            format: 'date',
          },
          weight: {
            type: 'number',
            description: 'Weight in kg',
          },
          bodyFat: {
            type: 'number',
            description: 'Body fat percentage',
          },
          measurements: {
            type: 'object',
            properties: {
              chest: { type: 'number' },
              waist: { type: 'number' },
              hips: { type: 'number' },
              arms: { type: 'number' },
              thighs: { type: 'number' },
            },
          },
        },
        required: ['id', 'userId', 'date'],
      },
      Error: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'Error code',
          },
          message: {
            type: 'string',
            description: 'Error message',
          },
          details: {
            type: 'object',
            description: 'Additional error details',
          },
        },
        required: ['code', 'message'],
      },
      PaginationResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
          },
          pagination: {
            type: 'object',
            properties: {
              page: {
                type: 'integer',
              },
              limit: {
                type: 'integer',
              },
              total: {
                type: 'integer',
              },
              pages: {
                type: 'integer',
              },
              hasMore: {
                type: 'boolean',
              },
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                  },
                  password: {
                    type: 'string',
                    minLength: 6,
                  },
                  fullName: {
                    type: 'string',
                  },
                },
                required: ['email', 'password', 'fullName'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '409': {
            description: 'Email already exists',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                  },
                  password: {
                    type: 'string',
                  },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Current user information',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/exercises': {
      get: {
        tags: ['Exercises'],
        summary: 'Get all exercises',
        parameters: [
          {
            name: 'category',
            in: 'query',
            description: 'Filter by category',
            schema: {
              type: 'string',
              enum: ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio'],
            },
          },
          {
            name: 'difficulty',
            in: 'query',
            description: 'Filter by difficulty',
            schema: {
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced'],
            },
          },
          {
            name: 'page',
            in: 'query',
            description: 'Page number',
            schema: {
              type: 'integer',
              default: 1,
            },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Items per page',
            schema: {
              type: 'integer',
              default: 20,
            },
          },
        ],
        responses: {
          '200': {
            description: 'List of exercises',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PaginationResponse',
                },
              },
            },
          },
        },
      },
    },
    '/exercises/{id}': {
      get: {
        tags: ['Exercises'],
        summary: 'Get exercise by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Exercise details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Exercise' },
              },
            },
          },
          '404': {
            description: 'Exercise not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/workouts': {
      get: {
        tags: ['Workouts'],
        summary: 'Get user workouts',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of workouts',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Workout' },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Workouts'],
        summary: 'Create new workout',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  exercises: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        exerciseId: { type: 'string' },
                        sets: { type: 'integer' },
                        reps: { type: 'string' },
                        weight: { type: 'number' },
                      },
                    },
                  },
                },
                required: ['name', 'exercises'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Workout created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Workout' },
              },
            },
          },
          '400': {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/workouts/{id}': {
      get: {
        tags: ['Workouts'],
        summary: 'Get workout by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Workout details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Workout' },
              },
            },
          },
          '404': {
            description: 'Workout not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Workouts'],
        summary: 'Update workout',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  exercises: {
                    type: 'array',
                    items: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Workout updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Workout' },
              },
            },
          },
          '400': {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '404': {
            description: 'Workout not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Workouts'],
        summary: 'Delete workout',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Workout deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Workout not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/progress': {
      get: {
        tags: ['Progress'],
        summary: 'Get user progress',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Progress data',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Progress' },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Progress'],
        summary: 'Add progress measurement',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  date: { type: 'string', format: 'date' },
                  weight: { type: 'number' },
                  bodyFat: { type: 'number' },
                  measurements: {
                    type: 'object',
                    properties: {
                      chest: { type: 'number' },
                      waist: { type: 'number' },
                      hips: { type: 'number' },
                      arms: { type: 'number' },
                      thighs: { type: 'number' },
                    },
                  },
                },
                required: ['date'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Progress recorded',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Progress' },
              },
            },
          },
          '400': {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
  },
};
