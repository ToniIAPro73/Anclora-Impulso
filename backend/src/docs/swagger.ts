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
      StrengthProgress: {
        type: 'object',
        properties: {
          totalVolume: {
            type: 'number',
            description: 'Total lifted volume in kilograms across recent strength sets',
          },
          personalRecords: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                exerciseId: { type: 'string', format: 'uuid' },
                exerciseName: { type: 'string' },
                muscleGroup: { type: 'string' },
                maxWeight: { type: 'number' },
                bestEstimatedOneRepMax: { type: 'number' },
                reps: { type: 'integer' },
                weight: { type: 'number' },
                achievedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
          muscleVolume: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                muscleGroup: { type: 'string' },
                totalVolume: { type: 'number' },
                setCount: { type: 'integer' },
              },
            },
          },
          recentSets: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                sessionId: { type: 'string', format: 'uuid' },
                completedAt: { type: 'string', format: 'date-time' },
                exerciseId: { type: 'string', format: 'uuid' },
                exerciseName: { type: 'string' },
                muscleGroup: { type: 'string' },
                reps: { type: 'integer' },
                weight: { type: 'number' },
                rir: { type: 'integer', nullable: true, minimum: 0, maximum: 5 },
                rpe: { type: 'number', nullable: true, minimum: 0, maximum: 10 },
                restSeconds: { type: 'integer', nullable: true },
                estimatedOneRepMax: { type: 'number' },
                volume: { type: 'number' },
              },
            },
          },
        },
        required: ['totalVolume', 'personalRecords', 'muscleVolume', 'recentSets'],
      },
      ProgressionSessionPlan: {
        type: 'object',
        properties: {
          generatedAt: { type: 'string', format: 'date-time' },
          prescriptions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                exerciseId: { type: 'string', format: 'uuid' },
                weight: { type: 'number' },
                repRange: {
                  type: 'object',
                  properties: {
                    minReps: { type: 'integer' },
                    maxReps: { type: 'integer' },
                  },
                  required: ['minReps', 'maxReps'],
                },
                sets: { type: 'integer' },
                targetRIR: { type: 'number' },
                focus: { type: 'string', enum: ['STRENGTH', 'HYPERTROPHY', 'ENDURANCE'] },
                action: { type: 'string', enum: ['increase_load', 'maintain', 'deload'] },
                freshnessScore: { type: 'integer', minimum: 0, maximum: 100 },
                readinessScore: { type: 'integer', minimum: 0, maximum: 100, nullable: true },
                recoveryAction: { type: 'string', enum: ['normal', 'prioritize', 'substitute_or_reduce'] },
                reasons: { type: 'array', items: { type: 'string' } },
                deload: {
                  type: 'object',
                  properties: {
                    shouldDeload: { type: 'boolean' },
                    reason: { type: 'string', enum: ['none', 'stall', 'scheduled'] },
                  },
                  required: ['shouldDeload', 'reason'],
                },
              },
              required: ['exerciseId', 'weight', 'repRange', 'sets', 'targetRIR', 'focus', 'action', 'freshnessScore', 'readinessScore', 'recoveryAction', 'reasons', 'deload'],
            },
          },
        },
        required: ['generatedAt', 'prescriptions'],
      },
      CoachMessageResponse: {
        type: 'object',
        properties: {
          conversationId: { type: 'string', format: 'uuid' },
          answer: { type: 'string' },
          provider: { type: 'string', enum: ['groq', 'deterministic', 'guardrail'] },
          model: { type: 'string' },
          cached: { type: 'boolean' },
          safety: {
            type: 'object',
            properties: {
              withinScope: { type: 'boolean' },
              escalatedToProfessional: { type: 'boolean' },
              flags: { type: 'array', items: { type: 'string' } },
            },
            required: ['withinScope', 'escalatedToProfessional', 'flags'],
          },
          usage: {
            type: 'object',
            properties: {
              estimatedInputTokens: { type: 'integer' },
              estimatedOutputTokens: { type: 'integer' },
              estimatedTotalTokens: { type: 'integer' },
              remainingWindowRequests: { type: 'integer' },
            },
            required: ['estimatedInputTokens', 'estimatedOutputTokens', 'estimatedTotalTokens', 'remainingWindowRequests'],
          },
        },
        required: ['conversationId', 'answer', 'provider', 'model', 'cached', 'safety', 'usage'],
      },
      SocialFeedResponse: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                userId: { type: 'string', format: 'uuid' },
                userName: { type: 'string' },
                type: { type: 'string', enum: ['workout_completed'] },
                content: { type: 'string' },
                sourceType: { type: 'string', nullable: true },
                sourceId: { type: 'string', nullable: true },
                visibility: { type: 'string', enum: ['public', 'private'] },
                metadata: { type: 'object', nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
                kudosCount: { type: 'integer' },
                hasKudosFromMe: { type: 'boolean' },
              },
            },
          },
        },
        required: ['items'],
      },
      Challenge: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          key: { type: 'string' },
          title: { type: 'string' },
          metric: { type: 'string', enum: ['workout_completions'] },
          startsAt: { type: 'string', format: 'date-time' },
          endsAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'key', 'title', 'metric', 'startsAt', 'endsAt'],
      },
      ChallengeLeaderboard: {
        type: 'object',
        properties: {
          entries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                rank: { type: 'integer' },
                userId: { type: 'string', format: 'uuid' },
                userName: { type: 'string' },
                score: { type: 'integer' },
                joinedAt: { type: 'string', format: 'date-time' },
              },
              required: ['rank', 'userId', 'userName', 'score', 'joinedAt'],
            },
          },
        },
        required: ['entries'],
      },
      FoodItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          brand: { type: 'string', nullable: true },
          barcode: { type: 'string', nullable: true },
          servingSizeG: { type: 'number' },
          calories: { type: 'number' },
          protein: { type: 'number' },
          carbs: { type: 'number' },
          fat: { type: 'number' },
          fiber: { type: 'number' },
          source: { type: 'string' },
          verified: { type: 'boolean' },
        },
        required: ['id', 'name', 'servingSizeG', 'calories', 'protein', 'carbs', 'fat', 'fiber', 'source', 'verified'],
      },
      MealLog: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          foodItemId: { type: 'string', format: 'uuid', nullable: true },
          mealType: { type: 'string', enum: ['desayuno', 'almuerzo', 'cena', 'snack'] },
          consumedAt: { type: 'string', format: 'date-time' },
          quantityG: { type: 'number', nullable: true },
          name: { type: 'string' },
          calories: { type: 'number' },
          protein: { type: 'number' },
          carbs: { type: 'number' },
          fat: { type: 'number' },
          fiber: { type: 'number' },
          notes: { type: 'string', nullable: true },
        },
        required: ['id', 'mealType', 'consumedAt', 'name', 'calories', 'protein', 'carbs', 'fat', 'fiber'],
      },
      NutritionTarget: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          calories: { type: 'number' },
          protein: { type: 'number' },
          carbs: { type: 'number' },
          fat: { type: 'number' },
          fiber: { type: 'number' },
          goal: { type: 'string', enum: ['lose_weight', 'build_muscle', 'recomposition', 'maintain'] },
        },
        required: ['id', 'calories', 'protein', 'carbs', 'fat', 'fiber', 'goal'],
      },
      HealthImportStatus: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          providers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                provider: { type: 'string', enum: ['google_fit', 'health_connect'] },
                available: { type: 'boolean' },
              },
              required: ['provider', 'available'],
            },
          },
        },
        required: ['enabled', 'providers'],
      },
      WearableStatus: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          readinessEnabled: { type: 'boolean' },
          tractionGate: { type: 'string', enum: ['blocked_until_d30_retention_validated'] },
          mobileStrategy: { type: 'string' },
          providers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                provider: { type: 'string', enum: ['healthkit', 'health_connect', 'garmin', 'whoop', 'oura'] },
                available: { type: 'boolean' },
                supportsBidirectionalSync: { type: 'boolean' },
              },
              required: ['provider', 'available', 'supportsBidirectionalSync'],
            },
          },
          pushNotifications: {
            type: 'object',
            properties: {
              available: { type: 'boolean' },
              strategy: { type: 'string' },
            },
            required: ['available', 'strategy'],
          },
        },
        required: ['enabled', 'readinessEnabled', 'tractionGate', 'mobileStrategy', 'providers', 'pushNotifications'],
      },
      WearableConnection: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          provider: { type: 'string', enum: ['healthkit', 'health_connect', 'garmin', 'whoop', 'oura'] },
          status: { type: 'string', enum: ['connected', 'paused', 'revoked'] },
          syncDirection: { type: 'string', enum: ['import_only', 'export_only', 'bidirectional'] },
          scopes: { type: 'array', items: { type: 'string', enum: ['heart_rate', 'sleep', 'activity', 'hrv'] } },
          lastSyncAt: { type: 'string', format: 'date-time', nullable: true },
        },
        required: ['id', 'provider', 'status', 'syncDirection', 'scopes'],
      },
      RecoverySample: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          provider: { type: 'string', enum: ['healthkit', 'health_connect', 'garmin', 'whoop', 'oura', 'manual'] },
          recordedAt: { type: 'string', format: 'date-time' },
          hrvMs: { type: 'number', nullable: true },
          restingHeartRateBpm: { type: 'integer', nullable: true },
          sleepMinutes: { type: 'integer', nullable: true },
          activityMinutes: { type: 'integer', nullable: true },
          readinessScore: { type: 'integer', minimum: 0, maximum: 100 },
        },
        required: ['id', 'provider', 'recordedAt', 'readinessScore'],
      },
      PremiumStatus: {
        type: 'object',
        properties: {
          subscriptionTier: { type: 'string', enum: ['free', 'premium', 'pro'] },
          premiumEntitled: { type: 'boolean' },
          features: {
            type: 'object',
            properties: {
              formAnalysis: {
                type: 'object',
                properties: {
                  enabled: { type: 'boolean' },
                  available: { type: 'boolean' },
                  mode: { type: 'string', enum: ['async_contract'] },
                },
                required: ['enabled', 'available', 'mode'],
              },
              voiceCoach: {
                type: 'object',
                properties: {
                  enabled: { type: 'boolean' },
                  available: { type: 'boolean' },
                  mode: { type: 'string', enum: ['script_only'] },
                },
                required: ['enabled', 'available', 'mode'],
              },
            },
            required: ['formAnalysis', 'voiceCoach'],
          },
        },
        required: ['subscriptionTier', 'premiumEntitled', 'features'],
      },
      FormAnalysisRequest: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          exerciseName: { type: 'string' },
          mediaType: { type: 'string', enum: ['image', 'video'] },
          mediaUrl: { type: 'string', format: 'uri' },
          status: { type: 'string', enum: ['queued', 'processing', 'completed', 'failed'] },
          feedback: { type: 'array', items: { type: 'string' } },
          disclaimer: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'userId', 'exerciseName', 'mediaType', 'mediaUrl', 'status', 'feedback', 'disclaimer'],
      },
      VoiceCueSession: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          workoutSessionId: { type: 'string', nullable: true },
          exerciseName: { type: 'string' },
          phase: { type: 'string', enum: ['warmup', 'working_set', 'rest', 'cooldown'] },
          intensity: { type: 'string', enum: ['easy', 'moderate', 'hard'] },
          locale: { type: 'string' },
          provider: { type: 'string', enum: ['deterministic'] },
          audioStatus: { type: 'string', enum: ['script_only'] },
          cues: { type: 'array', items: { type: 'string' } },
          disclaimer: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'userId', 'exerciseName', 'phase', 'intensity', 'locale', 'provider', 'audioStatus', 'cues', 'disclaimer'],
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
    '/progress/strength': {
      get: {
        tags: ['Progress'],
        summary: 'Get advanced strength progress',
        description: 'Returns lifted volume, personal records, per-muscle volume and recent detailed set logs.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Advanced strength progress data',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StrengthProgress' },
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
    '/v1/progression/next-session': {
      post: {
        tags: ['Progression'],
        summary: 'Generate adaptive next-session prescriptions',
        description: 'Returns deterministic load, rep range, deload and recovery recommendations from progression state and planned exercises.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  now: { type: 'string', format: 'date-time' },
                  weekIndex: { type: 'integer' },
                  sessionIndex: { type: 'integer' },
                  readiness: {
                    type: 'object',
                    properties: {
                      readinessScore: { type: 'integer', minimum: 0, maximum: 100 },
                      provider: { type: 'string', enum: ['healthkit', 'health_connect', 'garmin', 'whoop', 'oura', 'manual'] },
                      recordedAt: { type: 'string', format: 'date-time' },
                    },
                    required: ['readinessScore'],
                  },
                  plannedExercises: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        exerciseId: { type: 'string', format: 'uuid' },
                        sets: { type: 'integer' },
                        currentWeight: { type: 'number' },
                        targetRepRange: {
                          type: 'object',
                          properties: {
                            minReps: { type: 'integer' },
                            maxReps: { type: 'integer' },
                          },
                        },
                        exercisePattern: { type: 'string', enum: ['lower_compound', 'upper_compound', 'isolation'] },
                        primaryMuscle: { type: 'string' },
                        lastVolume: { type: 'number' },
                        sessionResult: {
                          type: 'object',
                          properties: {
                            reps: { type: 'array', items: { type: 'integer' } },
                            averageRir: { type: 'number' },
                          },
                        },
                      },
                      required: ['exerciseId', 'sets', 'exercisePattern'],
                    },
                  },
                },
                required: ['plannedExercises'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Adaptive session plan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProgressionSessionPlan' },
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
    '/v1/coach/messages': {
      post: {
        tags: ['Coach'],
        summary: 'Send a message to the guarded LLM coach',
        description:
          'Feature-flagged conversational coach with bounded user context, safety guardrails, caching, and per-user cost controls.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  conversationId: { type: 'string', format: 'uuid' },
                  message: { type: 'string', minLength: 3, maxLength: 2000 },
                },
                required: ['message'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Coach response',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CoachMessageResponse' },
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
          '429': {
            description: 'Per-user LLM coach rate limit exceeded',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '503': {
            description: 'LLM coach disabled or provider unavailable',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/social/privacy': {
      put: {
        tags: ['Social'],
        summary: 'Update social profile visibility',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  visibility: { type: 'string', enum: ['public', 'private'] },
                },
                required: ['visibility'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'Visibility updated' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/social/feed': {
      get: {
        tags: ['Social'],
        summary: 'Get privacy-aware social feed',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Social feed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SocialFeedResponse' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/social/follows/{userId}': {
      post: {
        tags: ['Social'],
        summary: 'Follow a user',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '201': { description: 'Follow created' },
          '400': { description: 'Invalid follow request' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'User not found' },
        },
      },
      delete: {
        tags: ['Social'],
        summary: 'Unfollow a user',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '204': { description: 'Follow removed' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/social/feed/{feedItemId}/kudos': {
      post: {
        tags: ['Social'],
        summary: 'Add kudos to a feed item',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'feedItemId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '201': { description: 'Kudos added' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Feed item not found' },
        },
      },
      delete: {
        tags: ['Social'],
        summary: 'Remove kudos from a feed item',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'feedItemId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '204': { description: 'Kudos removed' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/social/challenges/weekly': {
      get: {
        tags: ['Social'],
        summary: 'Get or create the active weekly challenge',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Weekly challenge',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Challenge' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/social/challenges/{challengeId}/join': {
      post: {
        tags: ['Social'],
        summary: 'Join a challenge',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'challengeId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '201': { description: 'Challenge joined' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Challenge not found' },
        },
      },
    },
    '/social/challenges/{challengeId}/leaderboard': {
      get: {
        tags: ['Social'],
        summary: 'Get challenge leaderboard',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'challengeId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': {
            description: 'Challenge leaderboard',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ChallengeLeaderboard' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/nutrition/foods': {
      get: {
        tags: ['Nutrition'],
        summary: 'Search food items',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'query', in: 'query', required: false, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Food items',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: { type: 'array', items: { $ref: '#/components/schemas/FoodItem' } },
                  },
                  required: ['items'],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Nutrition'],
        summary: 'Create a user food item',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FoodItem' },
            },
          },
        },
        responses: {
          '201': { description: 'Food item created' },
          '400': { description: 'Invalid input' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/nutrition/targets': {
      get: {
        tags: ['Nutrition'],
        summary: 'Get nutrition target',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Nutrition target',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/NutritionTarget' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
      put: {
        tags: ['Nutrition'],
        summary: 'Create or update nutrition target',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NutritionTarget' },
            },
          },
        },
        responses: {
          '200': { description: 'Nutrition target saved' },
          '400': { description: 'Invalid input' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/nutrition/meal-logs': {
      get: {
        tags: ['Nutrition'],
        summary: 'List meal logs for one day',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'date', in: 'query', required: false, schema: { type: 'string', format: 'date' } }],
        responses: {
          '200': {
            description: 'Meal logs',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: { type: 'array', items: { $ref: '#/components/schemas/MealLog' } },
                  },
                  required: ['items'],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Nutrition'],
        summary: 'Create a meal log',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MealLog' },
            },
          },
        },
        responses: {
          '201': { description: 'Meal log created' },
          '400': { description: 'Invalid input' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/nutrition/meal-plans/smart': {
      post: {
        tags: ['Nutrition'],
        summary: 'Create a target-aware smart meal plan shell',
        security: [{ bearerAuth: [] }],
        responses: {
          '201': { description: 'Smart meal plan created' },
          '400': { description: 'Nutrition target required' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/nutrition/health-import/status': {
      get: {
        tags: ['Nutrition'],
        summary: 'Get health data import feature status',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Health import status',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthImportStatus' },
              },
            },
          },
        },
      },
    },
    '/wearables/status': {
      get: {
        tags: ['Wearables'],
        summary: 'Get native app and wearable integration status',
        description: 'Returns provider availability, traction gate status, and native integration strategy. External sync is disabled by default.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Wearable integration status',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/WearableStatus' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/wearables/connections/{provider}': {
      put: {
        tags: ['Wearables'],
        summary: 'Upsert a wearable provider connection contract',
        description: 'Stores connection metadata only. Provider secrets and OAuth tokens are intentionally not accepted.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'provider',
            in: 'path',
            required: true,
            schema: { type: 'string', enum: ['healthkit', 'health_connect', 'garmin', 'whoop', 'oura'] },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['connected', 'paused', 'revoked'] },
                  syncDirection: { type: 'string', enum: ['import_only', 'export_only', 'bidirectional'] },
                  scopes: {
                    type: 'array',
                    items: { type: 'string', enum: ['heart_rate', 'sleep', 'activity', 'hrv'] },
                  },
                },
                required: ['status', 'syncDirection'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Wearable connection',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/WearableConnection' },
              },
            },
          },
          '403': { description: 'Wearable sync disabled' },
        },
      },
    },
    '/wearables/recovery-samples': {
      post: {
        tags: ['Wearables'],
        summary: 'Create a wearable recovery sample',
        description: 'Accepts normalized recovery metrics from a native client or provider sync worker and computes deterministic readiness.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  provider: { type: 'string', enum: ['healthkit', 'health_connect', 'garmin', 'whoop', 'oura', 'manual'] },
                  recordedAt: { type: 'string', format: 'date-time' },
                  hrvMs: { type: 'number' },
                  restingHeartRateBpm: { type: 'integer' },
                  sleepMinutes: { type: 'integer' },
                  activityMinutes: { type: 'integer' },
                  payload: { type: 'object' },
                },
                required: ['provider', 'recordedAt'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Recovery sample',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RecoverySample' },
              },
            },
          },
          '403': { description: 'Wearable sync disabled' },
        },
      },
    },
    '/wearables/readiness': {
      get: {
        tags: ['Wearables'],
        summary: 'Get latest wearable readiness',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Latest readiness sample',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    enabled: { type: 'boolean' },
                    latest: {
                      oneOf: [
                        { $ref: '#/components/schemas/RecoverySample' },
                        { type: 'null' },
                      ],
                    },
                  },
                  required: ['enabled', 'latest'],
                },
              },
            },
          },
        },
      },
    },
    '/premium/status': {
      get: {
        tags: ['Premium'],
        summary: 'Get premium feature entitlement and flag status',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Premium feature status',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PremiumStatus' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/premium/form-analysis': {
      post: {
        tags: ['Premium'],
        summary: 'Create an asynchronous form analysis request',
        description: 'Creates a queued premium form-analysis request. Real vision processing is behind future runtime/provider work and the response includes safety disclaimers.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  exerciseName: { type: 'string' },
                  mediaType: { type: 'string', enum: ['image', 'video'] },
                  mediaUrl: { type: 'string', format: 'uri' },
                  clientAnalysis: { type: 'object' },
                },
                required: ['exerciseName', 'mediaType', 'mediaUrl'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Form analysis request queued',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/FormAnalysisRequest' },
              },
            },
          },
          '403': { description: 'Premium subscription or feature flag required' },
        },
      },
    },
    '/premium/voice-cues': {
      post: {
        tags: ['Premium'],
        summary: 'Generate deterministic in-session voice cue script',
        description: 'Returns script-only coaching cues. Real TTS/audio generation is intentionally not executed in CI.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  workoutSessionId: { type: 'string' },
                  exerciseName: { type: 'string' },
                  phase: { type: 'string', enum: ['warmup', 'working_set', 'rest', 'cooldown'] },
                  intensity: { type: 'string', enum: ['easy', 'moderate', 'hard'] },
                  locale: { type: 'string' },
                },
                required: ['exerciseName', 'phase', 'intensity'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Voice cue script generated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/VoiceCueSession' },
              },
            },
          },
          '403': { description: 'Premium subscription or feature flag required' },
        },
      },
    },
  },
};
