# 🚀 reCAPTCHA Enterprise - Resumen Ejecutivo

## ⚡ Cambio en 1 Minuto

### ANTES:
```html
□ No soy un robot [checkbox que el usuario debe marcar]
```

### DESPUÉS:
```
[Sin checkbox - Protección invisible automática]
```

---

## 📦 3 Archivos + 1 Variable

### 1. **page.tsx** - 5 cambios pequeños
   - Cargar script reCAPTCHA
   - Actualizar tipos
   - Ejecutar reCAPTCHA al enviar
   - Eliminar checkbox del HTML

### 2. **route.ts** - Reemplazo completo
   - Verificar token con Google Cloud API
   - Validar score >= 0.5

### 3. **.env.local** - 1 línea nueva
   ```bash
   RECAPTCHA_API_KEY=<YOUR_RECAPTCHA_API_KEY>
   ```

---

## 🔑 Obtener API Key (5 minutos)

```
1. https://console.cloud.google.com/
2. Proyecto: gen-lang-client-0093228508
3. APIs & Services > Credentials
4. + CREATE CREDENTIALS > API key
5. Copiar clave generada
6. (Opcional) Restrict key > reCAPTCHA Enterprise API
```

---

## ✅ Implementación Rápida

```bash
# 1. Obtener API Key de Google Cloud (ver arriba)

# 2. Agregar a .env.local
echo "RECAPTCHA_API_KEY=<YOUR_RECAPTCHA_API_KEY>" >> .env.local

# 3. Actualizar archivos:
#    - page.tsx (seguir RECAPTCHA-ENTERPRISE-GUIA.md)
#    - route.ts (reemplazar con route-recaptcha-enterprise.ts)

# 4. Test local
npm run dev

# 5. Test formulario (sin checkbox)

# 6. Deploy
vercel env add RECAPTCHA_API_KEY
vercel --prod
```

---

## 🧪 Verificación Rápida

### En Consola del Navegador:
```javascript
typeof grecaptcha !== 'undefined' && grecaptcha.enterprise
// Debe retornar: true
```

### En Network Tab (DevTools):
```
POST /api/submit-lead
Request: { ..., "recaptchaToken": "03AGdBq..." }
Response: { ..., "recaptcha_score": 0.9 }
```

### En Google Cloud Console:
```
Security > reCAPTCHA Enterprise > Dashboard
- Ver assessments en tiempo real
- Ver distribución de scores
```

---

## 📊 Scores Esperados

```
0.9-1.0  = Usuario real legítimo ✅
0.5-0.8  = Probablemente humano ✅
0.3-0.4  = Sospechoso ⚠️
0.0-0.2  = Probablemente bot ❌
```

**Threshold actual:** 0.5 (ajustable en route.ts línea 85)

---

## 🔍 Troubleshooting Rápido

### Script no carga:
```javascript
// Verificar en consola
typeof grecaptcha
// Si undefined → Verificar useEffect en page.tsx
```

### API Key error:
```bash
# Verificar variable existe
cat .env.local | grep RECAPTCHA

# Verificar en Google Cloud
# API habilitada: reCAPTCHA Enterprise API
```

### Score muy bajo en local:
```typescript
// Ajustar threshold solo en dev (route.ts)
const isDevelopment = process.env.NODE_ENV === 'development';
const minScore = isDevelopment ? 0.0 : 0.5;
```

---

## 📁 Archivos Generados

| Archivo | Acción |
|---------|--------|
| **RECAPTCHA-ENTERPRISE-GUIA.md** | Guía completa paso a paso |
| **route-recaptcha-enterprise.ts** | Reemplazo para route.ts |
| **recaptcha-script-useEffect.tsx** | Fragmento para page.tsx |
| **handleLeadSubmit-recaptcha.tsx** | Fragmento para page.tsx |
| **types-update.tsx** | Fragmento para page.tsx |
| **orchestrateLeadAutomation-recaptcha.tsx** | Fragmento para page.tsx |
| **eliminar-checkbox-recaptcha.tsx** | Instrucciones HTML |

---

## 🎯 Beneficios

| Aspecto | Mejora |
|---------|--------|
| **UX** | Sin fricción - No checkbox |
| **Seguridad** | Score ML - Detecta bots avanzados |
| **Analytics** | Dashboard completo en Google Cloud |
| **Conversión** | +5-15% (sin fricción de checkbox) |
| **Mantenimiento** | Automático - Sin CAPTCHAs rotos |

---

## 💰 Costo

**Gratis hasta 10,000 assessments/mes**

Para Playa Viva (1,000-2,000 leads/mes):
→ **Completamente gratis** 🎉

---

## ⏱️ Tiempo de Implementación

```
□ Obtener API Key: 5 min
□ Actualizar .env.local: 1 min
□ Actualizar page.tsx: 10 min
□ Reemplazar route.ts: 1 min
□ Testing local: 5 min
□ Deploy: 5 min
────────────────────────────
TOTAL: ~30 minutos
```

---

## 📞 Siguiente Paso

**Lee:** [RECAPTCHA-ENTERPRISE-GUIA.md](./RECAPTCHA-ENTERPRISE-GUIA.md)

**Contiene:**
- ✅ Paso a paso detallado
- ✅ Capturas de pantalla conceptuales
- ✅ Troubleshooting exhaustivo
- ✅ Mejores prácticas

---

## ✅ Checklist Ultra-Rápida

```
□ API Key obtenida
□ RECAPTCHA_API_KEY en .env.local
□ page.tsx actualizado (5 cambios)
□ route.ts reemplazado
□ npm run dev funciona
□ Checkbox eliminado ✓
□ Formulario envía sin errores
□ Score > 0.5 en logs
□ Deploy a Vercel
□ Test en producción OK
```

---

**¡Listo! Tu formulario ahora tiene protección Enterprise sin molestar a usuarios reales.**

**Soporte:** tony@uniestate.co.uk
