# Sistema de Logging y Monitoreo - Anclora Impulso

## 📋 Descripción General

El sistema de logging de Anclora Impulso utiliza **Winston** para logging estructurado y **Morgan** para logging de requests HTTP. Proporciona monitoreo completo de la salud de la aplicación, métricas de rendimiento y seguimiento de errores.

---

## 🎯 Características

### 1. **Logging Estructurado**
- Logs en formato JSON para fácil parsing
- Múltiples niveles de log (error, warn, info, http, debug)
- Rotación automática de archivos de log
- Logs separados por tipo (errores, HTTP, combinado)

### 2. **Health Checks**
- Health check detallado con métricas
- Health check simple para load balancers
- Readiness y liveness probes para Kubernetes
- Monitoreo de base de datos, memoria y disco

### 3. **Métricas de Rendimiento**
- Tiempo de respuesta de requests
- Uso de memoria y CPU
- Requests por minuto
- Detección de requests lentos

### 4. **Manejo de Errores**
- Captura automática de excepciones no manejadas
- Captura de promesas rechazadas
- Stack traces completos
- Contexto de error enriquecido

---

## 📁 Estructura de Archivos

```
backend/
├── src/
│   ├── config/
│   │   └── logger.ts              # Configuración de Winston
│   ├── middleware/
│   │   ├── httpLogger.ts          # Middleware de Morgan
│   │   └── errorHandler.ts        # Manejo de errores con logging
│   ├── services/
│   │   └── health.service.ts      # Servicio de health check
│   ├── controllers/
│   │   └── health.controller.ts   # Controladores de health check
│   └── routes/
│       └── health.routes.ts       # Rutas de health check
└── logs/                          # Directorio de logs (auto-creado)
    ├── error-2025-10-28.log       # Logs de errores
    ├── combined-2025-10-28.log    # Logs combinados
    ├── http-2025-10-28.log        # Logs HTTP
    ├── exceptions-2025-10-28.log  # Excepciones no capturadas
    └── rejections-2025-10-28.log  # Promesas rechazadas
```

---

## 🔧 Configuración

### Niveles de Log

```typescript
const levels = {
  error: 0,   // Errores críticos
  warn: 1,    // Advertencias
  info: 2,    // Información general
  http: 3,    // Requests HTTP
  debug: 4,   // Debugging detallado
};
```

### Rotación de Archivos

| Tipo de Log | Retención | Tamaño Máximo | Rotación |
|-------------|-----------|---------------|----------|
| **Errores** | 30 días | 20 MB | Diaria |
| **Combinado** | 14 días | 20 MB | Diaria |
| **HTTP** | 7 días | 20 MB | Diaria |
| **Excepciones** | 30 días | 20 MB | Diaria |
| **Rechazos** | 30 días | 20 MB | Diaria |

---

## 🚀 Uso

### 1. Logging Básico

```typescript
import logger from './config/logger';

// Información general
logger.info('Usuario registrado', { userId: 123, email: 'user@example.com' });

// Advertencia
logger.warn('Memoria alta', { usage: '85%' });

// Error
logger.error('Error de base de datos', { error: error.message });

// Debug (solo en desarrollo)
logger.debug('Query ejecutado', { query: 'SELECT * FROM users' });
```

### 2. Logging con Contexto

```typescript
import { logWithContext, logError } from './config/logger';

// Con contexto adicional
logWithContext('info', 'Operación exitosa', {
  userId: 123,
  action: 'update_profile',
  duration: '150ms',
});

// Error con stack trace
try {
  // código que puede fallar
} catch (error) {
  logError(error as Error, {
    userId: 123,
    action: 'payment_processing',
  });
}
```

### 3. Logging HTTP Automático

El middleware `httpLogger` registra automáticamente todos los requests HTTP:

```
[2025-10-28 18:00:00] http: POST /api/auth/login 200 150ms - user: anonymous
[2025-10-28 18:00:05] http: GET /api/exercises 200 45ms - user: 123
[2025-10-28 18:00:10] http: POST /api/workouts/generate 201 2500ms - user: 123
```

### 4. Detección de Requests Lentos

Requests que toman más de 1 segundo generan una advertencia automática:

```typescript
logger.warn('Slow request detected', {
  method: 'POST',
  url: '/api/workouts/generate',
  responseTime: '2500ms',
  userId: 123,
});
```

---

## 🏥 Health Checks

### Endpoints Disponibles

#### 1. Health Check Detallado
```bash
GET /health
```

**Respuesta:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-28T18:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "pass",
      "message": "Database is healthy",
      "responseTime": 15
    },
    "memory": {
      "status": "pass",
      "message": "Memory usage normal: 45.23%"
    },
    "disk": {
      "status": "pass",
      "message": "Disk space is adequate"
    }
  },
  "metrics": {
    "memoryUsage": {
      "used": "2.45 GB",
      "total": "8.00 GB",
      "percentage": 30.62
    },
    "cpuUsage": 25.5,
    "requestsPerMinute": 120
  }
}
```

**Estados Posibles:**
- `healthy` - Todo funciona correctamente (200)
- `degraded` - Algunos checks con advertencias (200)
- `unhealthy` - Uno o más checks fallaron (503)

#### 2. Health Check Simple
```bash
GET /health/simple
```

**Respuesta:**
```json
{
  "status": "ok"
}
```

Ideal para load balancers que solo necesitan saber si el servicio está arriba.

#### 3. Readiness Probe (Kubernetes)
```bash
GET /health/ready
```

**Respuesta:**
```json
{
  "ready": true
}
```

Indica si el servicio está listo para recibir tráfico.

#### 4. Liveness Probe (Kubernetes)
```bash
GET /health/live
```

**Respuesta:**
```json
{
  "alive": true
}
```

Indica si el servicio está vivo (responde).

---

## 📊 Métricas

### Métricas Disponibles

| Métrica | Descripción | Umbral de Advertencia |
|---------|-------------|----------------------|
| **Database Response Time** | Tiempo de respuesta de la BD | > 1000ms |
| **Memory Usage** | Uso de memoria del sistema | > 80% |
| **CPU Usage** | Uso de CPU (carga promedio) | > 80% |
| **Requests Per Minute** | Tráfico del servidor | N/A |
| **Request Response Time** | Tiempo de respuesta de requests | > 1000ms |

### Monitoreo de Salud

El servicio de health check evalúa:

1. **Base de Datos**
   - ✅ Pass: Respuesta < 1s
   - ⚠️ Warn: Respuesta 1-3s
   - ❌ Fail: Sin conexión o error

2. **Memoria**
   - ✅ Pass: Uso < 80%
   - ⚠️ Warn: Uso 80-90%
   - ❌ Fail: Uso > 90%

3. **Disco**
   - ✅ Pass: Espacio adecuado
   - ⚠️ Warn: Espacio bajo
   - ❌ Fail: Sin espacio

---

## 🔍 Consulta de Logs

### Ver Logs en Tiempo Real

```bash
# Todos los logs
tail -f logs/combined-$(date +%Y-%m-%d).log

# Solo errores
tail -f logs/error-$(date +%Y-%m-%d).log

# Solo HTTP
tail -f logs/http-$(date +%Y-%m-%d).log
```

### Buscar en Logs

```bash
# Buscar por usuario
grep "userId.*123" logs/combined-*.log

# Buscar errores específicos
grep "Database connection failed" logs/error-*.log

# Buscar requests lentos
grep "Slow request detected" logs/combined-*.log
```

### Analizar Logs con jq

```bash
# Contar errores por tipo
cat logs/error-$(date +%Y-%m-%d).log | jq -r '.message' | sort | uniq -c

# Requests más lentos
cat logs/http-$(date +%Y-%m-%d).log | jq -r 'select(.responseTime > 1000) | {url, responseTime}'

# Usuarios más activos
cat logs/combined-$(date +%Y-%m-%d).log | jq -r '.userId' | sort | uniq -c | sort -rn | head -10
```

---

## 🚨 Alertas y Monitoreo

### Integración con Herramientas de Monitoreo

#### 1. **Prometheus**

Exponer métricas en formato Prometheus:

```typescript
import promClient from 'prom-client';

const register = new promClient.Registry();

// Métricas personalizadas
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

register.registerMetric(httpRequestDuration);

// Endpoint de métricas
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

#### 2. **Grafana**

Visualizar logs y métricas:
- Importar logs desde archivos o Loki
- Crear dashboards con métricas de health checks
- Configurar alertas basadas en umbrales

#### 3. **Sentry**

Para tracking de errores en producción:

```bash
npm install @sentry/node
```

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// En errorHandler
Sentry.captureException(err);
```

#### 4. **Datadog**

Para monitoreo completo:

```bash
npm install dd-trace
```

```typescript
import tracer from 'dd-trace';

tracer.init({
  service: 'anclora-impulso-backend',
  env: process.env.NODE_ENV,
});
```

---

## 🛠️ Troubleshooting

### Problema: Logs no se están generando

**Solución:**
1. Verificar que el directorio `logs/` existe y tiene permisos de escritura
2. Verificar la configuración de Winston en `src/config/logger.ts`
3. Verificar que el nivel de log es apropiado (debug en desarrollo)

```bash
# Crear directorio de logs
mkdir -p backend/logs
chmod 755 backend/logs
```

### Problema: Archivos de log muy grandes

**Solución:**
1. Ajustar `maxSize` en la configuración de DailyRotateFile
2. Reducir `maxFiles` para retener menos días
3. Implementar compresión de logs antiguos

```typescript
const transport = new DailyRotateFile({
  maxSize: '10m',  // Reducir de 20m a 10m
  maxFiles: '7d',  // Reducir de 14d a 7d
  compress: true,  // Comprimir logs antiguos
});
```

### Problema: Health check reporta unhealthy

**Solución:**
1. Verificar conexión a base de datos
2. Verificar uso de recursos (memoria, CPU)
3. Revisar logs de errores para detalles

```bash
# Ver últimos errores
tail -20 logs/error-$(date +%Y-%m-%d).log

# Verificar health check
curl http://localhost:3001/health | jq
```

---

## 📈 Mejores Prácticas

### 1. **Niveles de Log Apropiados**

- `error` - Solo para errores que requieren atención inmediata
- `warn` - Para situaciones anómalas que no son errores
- `info` - Para eventos importantes del negocio
- `http` - Para requests HTTP (automático)
- `debug` - Para debugging detallado (solo desarrollo)

### 2. **Contexto Rico**

Siempre incluir contexto relevante en los logs:

```typescript
logger.info('Payment processed', {
  userId: 123,
  amount: 99.99,
  currency: 'USD',
  paymentMethod: 'credit_card',
  transactionId: 'txn_123456',
});
```

### 3. **No Loguear Información Sensible**

❌ **Nunca loguear:**
- Contraseñas
- Tokens de autenticación
- Números de tarjeta de crédito
- Información personal identificable (PII)

✅ **En su lugar:**
- Loguear IDs ofuscados
- Loguear solo los últimos 4 dígitos de tarjetas
- Usar máscaras para emails (u***@example.com)

### 4. **Monitoreo Proactivo**

- Configurar alertas para errores críticos
- Revisar logs regularmente
- Analizar tendencias de rendimiento
- Establecer SLAs y monitorizarlos

### 5. **Retención de Logs**

- Producción: 30 días mínimo
- Staging: 14 días
- Desarrollo: 7 días

---

## 🔐 Seguridad

### Protección de Logs

1. **Permisos de Archivos**
```bash
chmod 640 logs/*.log
chown app:app logs/*.log
```

2. **Rotación Segura**
- Logs antiguos se comprimen automáticamente
- Se eliminan después del período de retención
- No se exponen públicamente

3. **Acceso Restringido**
- Solo personal autorizado puede acceder a logs
- Logs de producción nunca se descargan a desarrollo
- Usar herramientas de monitoreo con autenticación

---

## 📚 Referencias

- [Winston Documentation](https://github.com/winstonjs/winston)
- [Morgan Documentation](https://github.com/expressjs/morgan)
- [Winston Daily Rotate File](https://github.com/winstonjs/winston-daily-rotate-file)
- [Health Check Best Practices](https://microservices.io/patterns/observability/health-check-api.html)

---

*Última actualización: Octubre 28, 2025*
