# Panel de Control (Dashboard) - Anclora Impulso

## 📋 Descripción General

El Dashboard de Anclora Impulso es un **panel de control en tiempo real** que permite visualizar métricas de rendimiento, logs y el estado de salud de la aplicación. Está diseñado para facilitar el monitoreo y troubleshooting tanto en desarrollo como en producción.

---

## 🎯 Características Principales

### 1. **Métricas en Tiempo Real**
- Actualización automática cada 5 segundos
- Visualización de CPU, memoria, base de datos y requests
- Indicadores de estado con códigos de color

### 2. **Gráficos Interactivos**
- Gráfico de CPU y memoria (últimos 60 segundos)
- Gráfico de requests por minuto (últimos 60 segundos)
- Actualización en tiempo real con Chart.js

### 3. **Visualización de Logs**
- Logs recientes con formato y colores
- Filtros por nivel (error, warn, info, http)
- Actualización automática cada 5 segundos

### 4. **Health Status**
- Badge de estado general (healthy, degraded, unhealthy)
- Indicador visual con animación de pulso
- Cambio automático según métricas

---

## 🚀 Acceso al Dashboard

### URL de Acceso

**Desarrollo:**
```
http://localhost:3001/dashboard/dashboard.html
```

**Producción:**
```
https://tu-dominio.com/dashboard/dashboard.html
```

### Endpoints de API

El dashboard consume los siguientes endpoints:

| Endpoint | Descripción | Método |
|----------|-------------|--------|
| `/api/dashboard/summary` | Resumen completo de métricas | GET |
| `/api/dashboard/metrics` | Métricas del sistema | GET |
| `/api/dashboard/db-metrics` | Métricas de base de datos | GET |
| `/api/dashboard/logs-stats` | Estadísticas de logs | GET |
| `/api/dashboard/logs` | Logs recientes | GET |

---

## 📊 Secciones del Dashboard

### 1. **CPU Card**
Muestra información sobre el uso del procesador:

- **Uso:** Porcentaje de uso de CPU
  - 🟢 Verde: < 60%
  - 🟡 Amarillo: 60-80%
  - 🔴 Rojo: > 80%
- **Cores:** Número de núcleos disponibles
- **Load Average:** Carga promedio del sistema (1 minuto)

### 2. **Memoria Card**
Información sobre el uso de memoria:

- **Uso:** Porcentaje de memoria utilizada
  - 🟢 Verde: < 60%
  - 🟡 Amarillo: 60-80%
  - 🔴 Rojo: > 80%
- **Usado:** Memoria en uso (GB)
- **Total:** Memoria total disponible (GB)

### 3. **Base de Datos Card**
Estado y rendimiento de la base de datos:

- **Estado:** Connected/Disconnected
  - 🟢 Verde: Conectado
  - 🔴 Rojo: Desconectado
- **Response Time:** Tiempo de respuesta en ms
  - 🟢 Verde: < 500ms
  - 🟡 Amarillo: 500-1000ms
  - 🔴 Rojo: > 1000ms
- **Conexiones:** Número de conexiones activas

### 4. **Requests Card**
Métricas de tráfico HTTP:

- **Total:** Requests totales desde el inicio
- **Por Minuto:** Requests en el último minuto
- **Por Segundo:** Requests en el último segundo

### 5. **Logs (Hoy) Card**
Estadísticas de logs del día actual:

- **Errores:** Número de logs de error (🔴 rojo)
- **Advertencias:** Número de logs de advertencia (🟡 amarillo)
- **Info:** Número de logs informativos

### 6. **Uptime Card**
Información sobre el proceso:

- **Tiempo Activo:** Tiempo desde que inició el servidor
- **PID:** Process ID del servidor
- **Entorno:** development/production

---

## 📈 Gráficos

### 1. **CPU & Memoria (Últimos 60s)**
Gráfico de líneas que muestra:
- Línea azul: Uso de CPU (%)
- Línea naranja: Uso de memoria (%)
- Rango: 0-100%
- Actualización: Cada 5 segundos

### 2. **Requests (Últimos 60s)**
Gráfico de líneas que muestra:
- Línea verde: Requests por minuto
- Área rellena bajo la línea
- Actualización: Cada 5 segundos

---

## 📋 Logs Recientes

### Filtros Disponibles

- **Todos:** Muestra todos los logs
- **Errores:** Solo logs de nivel error
- **Advertencias:** Solo logs de nivel warn
- **Info:** Solo logs de nivel info
- **HTTP:** Solo logs de requests HTTP

### Formato de Logs

Cada entrada de log muestra:
- **Timestamp:** Fecha y hora del log
- **Nivel:** Badge con el nivel del log (ERROR, WARN, INFO, HTTP)
- **Mensaje:** Contenido del log

### Códigos de Color

| Nivel | Color de Fondo | Color de Borde |
|-------|----------------|----------------|
| **ERROR** | Rojo claro | Rojo |
| **WARN** | Amarillo claro | Amarillo |
| **INFO** | Azul claro | Azul |
| **HTTP** | Púrpura claro | Púrpura |

---

## 🎨 Health Status Badge

El badge de estado en la esquina superior derecha muestra el estado general del sistema:

### Estados Posibles

#### 🟢 **Healthy** (Saludable)
- CPU < 80%
- Memoria < 80%
- Base de datos conectada
- Response time < 1000ms

#### 🟡 **Degraded** (Degradado)
- CPU 80-90%
- Memoria 80-90%
- Base de datos lenta (> 1000ms)

#### 🔴 **Unhealthy** (No Saludable)
- CPU > 90%
- Memoria > 90%
- Base de datos desconectada
- Errores críticos

El badge incluye un punto animado que pulsa para indicar actualización en tiempo real.

---

## 🔧 Configuración

### Intervalo de Actualización

Por defecto, el dashboard se actualiza cada **5 segundos**. Para cambiar esto, modifica las siguientes líneas en `dashboard.html`:

```javascript
// Cambiar de 5000ms (5s) a otro valor
setInterval(updateMetrics, 5000);  // Métricas
setInterval(updateLogs, 5000);     // Logs
```

### Límite de Logs

Por defecto, se muestran los últimos **50 logs**. Para cambiar esto:

```javascript
// En la función updateLogs()
const response = await fetch(`${API_BASE}/api/dashboard/logs?limit=50&level=${level}`);
// Cambiar limit=50 a otro valor
```

### Puntos de Datos en Gráficos

Por defecto, los gráficos muestran los últimos **60 puntos de datos** (60 segundos). Para cambiar:

```javascript
const maxDataPoints = 60;  // Cambiar a otro valor
```

---

## 🔐 Seguridad

### ⚠️ IMPORTANTE: Proteger en Producción

El dashboard actualmente es **público** (sin autenticación). En producción, **DEBES protegerlo** con autenticación.

### Opciones de Protección

#### 1. **Autenticación Básica HTTP**

```typescript
// En app.ts
import basicAuth from 'express-basic-auth';

app.use('/dashboard', basicAuth({
  users: { 'admin': process.env.DASHBOARD_PASSWORD || 'changeme' },
  challenge: true,
  realm: 'Dashboard'
}));
```

#### 2. **Middleware de Autenticación JWT**

```typescript
// En app.ts
import { authenticateToken } from './middleware/auth';

app.use('/dashboard', authenticateToken);
app.use('/api/dashboard', authenticateToken);
```

#### 3. **IP Whitelist**

```typescript
// En app.ts
const allowedIPs = ['127.0.0.1', '::1', '10.0.0.0/8'];

app.use('/dashboard', (req, res, next) => {
  const clientIP = req.ip;
  if (allowedIPs.some(ip => clientIP.includes(ip))) {
    next();
  } else {
    res.status(403).send('Forbidden');
  }
});
```

---

## 🛠️ Troubleshooting

### Problema: Dashboard no carga

**Solución:**
1. Verificar que el servidor backend está corriendo
2. Verificar que la ruta `/dashboard/dashboard.html` es accesible
3. Revisar la consola del navegador para errores

```bash
# Verificar que el servidor está corriendo
curl http://localhost:3001/health
```

### Problema: Métricas muestran 0

**Solución:**
1. Verificar que los endpoints de API responden
2. Verificar que no hay errores de CORS

```bash
# Probar endpoint de métricas
curl http://localhost:3001/api/dashboard/summary | jq
```

### Problema: Logs no se muestran

**Solución:**
1. Verificar que existen archivos de log en `backend/logs/`
2. Verificar que los logs tienen formato JSON válido
3. Generar algunos logs haciendo requests a la API

```bash
# Verificar archivos de log
ls -lh backend/logs/

# Ver contenido de logs
cat backend/logs/combined-$(date +%Y-%m-%d).log
```

### Problema: Gráficos no se actualizan

**Solución:**
1. Abrir la consola del navegador (F12)
2. Verificar si hay errores de JavaScript
3. Verificar que Chart.js se cargó correctamente

```javascript
// En la consola del navegador
console.log(typeof Chart);  // Debe ser 'function'
```

---

## 📱 Responsive Design

El dashboard es completamente responsive y se adapta a diferentes tamaños de pantalla:

- **Desktop (> 1024px):** Grid de 3 columnas
- **Tablet (768-1024px):** Grid de 2 columnas
- **Mobile (< 768px):** Grid de 1 columna

Los gráficos y filtros también se ajustan automáticamente.

---

## 🎨 Personalización

### Cambiar Colores

Los colores principales se definen en el CSS:

```css
/* Gradiente de fondo */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Color del logo */
background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);

/* Colores de estado */
.status-dot.healthy { background: #10b981; }
.status-dot.degraded { background: #f59e0b; }
.status-dot.unhealthy { background: #ef4444; }
```

### Agregar Nuevas Métricas

1. Agregar endpoint en el backend:

```typescript
// En dashboard.controller.ts
export const getCustomMetric = async (req: Request, res: Response) => {
  const metric = await calculateCustomMetric();
  res.json(metric);
};
```

2. Agregar card en el HTML:

```html
<div class="card">
    <h2>📊 Mi Métrica</h2>
    <div class="metric">
        <span class="metric-label">Valor</span>
        <span class="metric-value" id="customMetric">0</span>
    </div>
</div>
```

3. Actualizar en JavaScript:

```javascript
async function updateMetrics() {
    const response = await fetch(`${API_BASE}/api/dashboard/custom-metric`);
    const data = await response.json();
    document.getElementById('customMetric').textContent = data.value;
}
```

---

## 🚀 Despliegue

### Desarrollo

El dashboard está disponible automáticamente cuando inicias el servidor:

```bash
cd backend
npm run dev
# Dashboard: http://localhost:3001/dashboard/dashboard.html
```

### Producción

1. **Compilar el backend:**
```bash
npm run build
```

2. **Asegurar que `public/` se incluye en el build:**
```json
// En tsconfig.json
{
  "include": ["src/**/*", "public/**/*"]
}
```

3. **Proteger con autenticación** (ver sección de Seguridad)

4. **Configurar reverse proxy** (Nginx ejemplo):

```nginx
location /dashboard {
    auth_basic "Dashboard";
    auth_basic_user_file /etc/nginx/.htpasswd;
    proxy_pass http://localhost:3001/dashboard;
}
```

---

## 📊 Integración con Herramientas Externas

### Prometheus

Exportar métricas en formato Prometheus:

```typescript
import promClient from 'prom-client';

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### Grafana

1. Agregar Prometheus como data source
2. Importar dashboard pre-configurado
3. Crear alertas basadas en métricas

### Datadog

```typescript
import { StatsD } from 'node-dogstatsd';

const dogstatsd = new StatsD();

// Enviar métricas
dogstatsd.gauge('cpu.usage', cpuUsage);
dogstatsd.gauge('memory.usage', memoryUsage);
```

---

## 📚 Referencias

- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [Express Static Files](https://expressjs.com/en/starter/static-files.html)
- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)

---

## 🎯 Roadmap

Mejoras futuras planeadas:

- [ ] WebSocket para actualizaciones en tiempo real sin polling
- [ ] Exportar métricas a CSV/JSON
- [ ] Alertas configurables
- [ ] Dashboard de usuarios (logins, registros, etc.)
- [ ] Métricas de negocio (entrenamientos creados, etc.)
- [ ] Comparación histórica (día/semana/mes)
- [ ] Dark mode toggle
- [ ] Notificaciones push

---

*Última actualización: Octubre 28, 2025*
