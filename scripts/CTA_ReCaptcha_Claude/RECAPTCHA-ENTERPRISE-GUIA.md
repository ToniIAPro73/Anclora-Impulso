# 🔒 Integración reCAPTCHA Enterprise - Playa Viva

## ✨ Cambios Principales

### ANTES (Checkbox visible):
```
□ No soy un robot  [checkbox manual]
```

### DESPUÉS (Invisible - Enterprise):
```
[Sin interacción del usuario]
✓ Protección automática con score 0-1
✓ Bloquea bots sin friccionar UX
```

---

## 📋 Archivos a Actualizar

### 1. **page.tsx** (4 cambios)
### 2. **route.ts** (Reemplazo completo)
### 3. **.env.local** (1 variable nueva)

---

## 🔧 PASO 1: Obtener API Key de Google Cloud

### 1.1 Ir a Google Cloud Console
```
https://console.cloud.google.com/
```

### 1.2 Seleccionar proyecto
- Proyecto: `gen-lang-client-0093228508`
- Si no lo ves, búscalo en el selector de proyectos

### 1.3 Habilitar reCAPTCHA Enterprise API
```
1. Ve a: APIs & Services > Library
2. Busca: "reCAPTCHA Enterprise API"
3. Click: Enable (si no está habilitado)
```

### 1.4 Crear API Key

**Opción A: Crear nueva API Key**
```
1. Ve a: APIs & Services > Credentials
2. Click: + CREATE CREDENTIALS
3. Selecciona: API key
4. Copia la clave generada (ej: <YOUR_RECAPTCHA_API_KEY>)
5. Restricciones (opcional pero recomendado):
   - API restrictions > Restrict key
   - Selecciona: reCAPTCHA Enterprise API
6. Click: Save
```

**Opción B: Usar Service Account (más seguro)**
```
1. Ve a: IAM & Admin > Service Accounts
2. Click: + CREATE SERVICE ACCOUNT
3. Nombre: recaptcha-verifier
4. Role: reCAPTCHA Enterprise Admin
5. Click: Create and Continue > Done
6. Click en la service account creada
7. Keys tab > ADD KEY > Create new key
8. Tipo: JSON
9. Download JSON file
10. Usar el campo "private_key" del JSON
```

---

## 🔧 PASO 2: Actualizar Variables de Entorno

Edita `.env.local`:

```bash
# Existentes (no cambiar)
NEXT_PUBLIC_HUBSPOT_PORTAL_ID=147219365
HUBSPOT_FORM_GUID=34afefab-a031-4516-838e-f0edf0b98bc7
NEXT_PUBLIC_SITE_URL=https://playaviva-uniestate.vercel.app

# NUEVO: API Key de Google Cloud para reCAPTCHA Enterprise
RECAPTCHA_API_KEY=<YOUR_RECAPTCHA_API_KEY>
```

**⚠️ IMPORTANTE:**
- Esta API key es PRIVADA (solo backend)
- NO la incluyas en el código del frontend
- NO la subas a Git (`.env.local` ya está en `.gitignore`)

---

## 🔧 PASO 3: Actualizar page.tsx

### 3.1 Actualizar tipos TypeScript

**Ubicación:** Línea ~27

**REEMPLAZAR:**
```typescript
type LeadAutomationPayload = {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  language: "es" | "en";
  page: string;
  timestamp: string;
  dossierFileName: string;
  utm: Record<string, string>;
  workflow: string;
};
```

**CON:**
```typescript
type LeadAutomationPayload = {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  language: "es" | "en";
  page: string;
  timestamp: string;
  dossierFileName: string;
  utm: Record<string, string>;
  workflow: string;
  recaptchaToken: string; // NUEVO
};
```

---

### 3.2 Cargar script de reCAPTCHA Enterprise

**Ubicación:** Antes del `return` statement (línea ~1350)

**AGREGAR:**
```typescript
// Cargar script de reCAPTCHA Enterprise
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://www.google.com/recaptcha/enterprise.js?render=6LdVoAcsAAAAABmGUpMvdZoVrjje45Xbq62lT5sm';
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  return () => {
    const existingScript = document.querySelector(`script[src*="recaptcha/enterprise"]`);
    if (existingScript) {
      document.head.removeChild(existingScript);
    }
  };
}, []);
```

---

### 3.3 Actualizar orchestrateLeadAutomation

**Ubicación:** Función `orchestrateLeadAutomation` (después de donde la agregamos)

**CAMBIAR línea:**
```typescript
const apiPayload = {
  firstName: payload.firstName,
  lastName: payload.lastName,
  fullName: payload.fullName,
  email: payload.email,
  language: payload.language,
  hubspotutk,
  pageUri,
  utm: payload.utm,
  // AGREGAR ESTA LÍNEA:
  recaptchaToken: payload.recaptchaToken,
};
```

---

### 3.4 Actualizar handleLeadSubmit

**Ubicación:** Línea ~1250

**CAMBIOS CLAVE:**

#### A) Eliminar validación de checkbox reCAPTCHA
**ELIMINAR estas líneas (~1289-1293):**
```typescript
if (!isRecaptchaVerified) {
  focusField(recaptchaRef, "recaptcha", fieldErrorCopy.recaptcha);
  return;
}
```

#### B) Agregar ejecución de reCAPTCHA Enterprise
**AGREGAR después de `setIsSubmitting(true);` (~línea 1318):**

```typescript
try {
  // Ejecutar reCAPTCHA Enterprise de forma invisible
  const recaptchaToken = await new Promise<string>((resolve, reject) => {
    if (typeof grecaptcha === 'undefined' || !grecaptcha.enterprise) {
      reject(new Error('reCAPTCHA Enterprise no está cargado'));
      return;
    }

    grecaptcha.enterprise.ready(async () => {
      try {
        const token = await grecaptcha.enterprise.execute(
          '6LdVoAcsAAAAABmGUpMvdZoVrjje45Xbq62lT5sm',
          { action: 'DOSSIER_DOWNLOAD' }
        );
        resolve(token);
      } catch (error) {
        reject(error);
      }
    });
  });

  // ... resto del código
  const leadData: LeadAutomationPayload = {
    // ... campos existentes
    recaptchaToken, // AGREGAR
  };
```

---

### 3.5 Eliminar checkbox reCAPTCHA del HTML

**Ubicación:** Líneas ~2817-2857

**COMENTAR O ELIMINAR este bloque completo:**
```html
{/* ELIMINAR O COMENTAR COMPLETO */}
<div className="rounded-2xl border px-4 py-3 bg-white/80 backdrop-blur-sm ...">
  <div className="flex items-center justify-between mb-2">
    <label className="flex items-center gap-3 cursor-pointer ...">
      <input
        ref={recaptchaRef}
        type="checkbox"
        checked={isRecaptchaVerified}
        onChange={(e) => setIsRecaptchaVerified(e.target.checked)}
        ...
      />
      <span>No soy un robot</span>
    </label>
    <div className="flex items-center gap-1 ...">
      <Bot className="h-4 w-4 text-gold-warm" />
      <span>reCAPTCHA</span>
    </div>
  </div>
</div>
```

---

## 🔧 PASO 4: Reemplazar route.ts

**Ubicación:** `src/app/api/submit-lead/route.ts`

**ACCIÓN:** Reemplazar completamente con:
```
route-recaptcha-enterprise.ts
```

**Cambios principales:**
- ✅ Función `verifyRecaptchaToken()` agregada
- ✅ Verificación de token antes de enviar a HubSpot
- ✅ Score mínimo: 0.5 (ajustable)
- ✅ Logging de scores y reasons

---

## 🔧 PASO 5: Actualizar Vercel (Producción)

### Via Dashboard:
```
1. Ve a: Vercel Dashboard > Tu Proyecto
2. Settings > Environment Variables
3. Agregar nueva variable:
   - Name: RECAPTCHA_API_KEY
   - Value: <YOUR_RECAPTCHA_API_KEY>
   - Environment: Production + Preview + Development
4. Save
5. Redeploy el proyecto
```

### Via CLI:
```bash
vercel env add RECAPTCHA_API_KEY
# Pega tu API key cuando te lo pida
# Selecciona: Production, Preview, Development

vercel --prod
```

---

## 🧪 PASO 6: Testing

### 6.1 Test Local

```bash
npm run dev
```

**Verificar:**
1. ✅ Script reCAPTCHA carga (Network tab)
2. ✅ No aparece checkbox "No soy un robot"
3. ✅ Formulario se envía sin checkbox
4. ✅ Console no muestra errores de reCAPTCHA

### 6.2 Test en Consola del Navegador

```javascript
// Verificar que grecaptcha está disponible
typeof grecaptcha !== 'undefined' && grecaptcha.enterprise
// Debe retornar: true

// Ejecutar reCAPTCHA manualmente (test)
grecaptcha.enterprise.ready(async () => {
  const token = await grecaptcha.enterprise.execute(
    '6LdVoAcsAAAAABmGUpMvdZoVrjje45Xbq62lT5sm',
    { action: 'TEST' }
  );
  console.log('Token:', token);
});
// Debe generar un token largo
```

### 6.3 Verificar en Network Tab

Al enviar el formulario:

```
1. DevTools > Network
2. Buscar: submit-lead
3. Request Payload debe incluir:
   {
     ...
     "recaptchaToken": "03AGdBq26xxxxxxxxxxxxx..."
   }
4. Response debe incluir:
   {
     "success": true,
     "recaptcha_score": 0.9  <-- Score alto = humano real
   }
```

### 6.4 Verificar en Google Cloud Console

```
1. Ve a: Google Cloud Console
2. Security > reCAPTCHA Enterprise
3. Dashboard > Metrics
4. Deberías ver:
   - Total assessments
   - Risk score distribution
   - Actions detected
```

---

## 📊 Entender Scores de reCAPTCHA

### Score Range:
```
1.0  = Muy probablemente humano legítimo
0.9  = Probablemente humano
0.5  = Neutral (threshold por defecto)
0.3  = Sospechoso
0.1  = Muy probablemente bot
0.0  = Definitivamente bot
```

### Configuración en route.ts:
```typescript
// Línea ~85
return {
  success: isValid && actionMatches && score >= 0.5, // ← Ajustar threshold aquí
  score: score,
  reasons: reasons,
};
```

**Recomendaciones:**
- **0.5** = Bueno para la mayoría de casos
- **0.7** = Más estricto (puede bloquear algunos usuarios reales)
- **0.3** = Más permisivo (deja pasar más bots)

---

## 🔍 Troubleshooting

### Error: "reCAPTCHA Enterprise no está cargado"

**Causa:** Script no se cargó correctamente

**Solución:**
```javascript
// Verificar en consola
typeof grecaptcha
// Si retorna 'undefined', el script no se cargó

// Verificar en Network tab
// Buscar: recaptcha/enterprise.js
// Si no aparece, verificar useEffect en page.tsx
```

---

### Error: "reCAPTCHA API error: 403"

**Causa:** API Key incorrecta o sin permisos

**Solución:**
1. Verificar que `RECAPTCHA_API_KEY` está en `.env.local`
2. Verificar que la API está habilitada en Google Cloud
3. Verificar que la API key tiene permisos de reCAPTCHA Enterprise

---

### Error: "Score demasiado bajo"

**Causa:** reCAPTCHA detectó comportamiento sospechoso

**Posibles razones:**
- Usuario usa VPN
- Navegador con extensiones anti-tracking agresivas
- Bot real intentando enviar formulario

**Solución:**
1. Ajustar threshold a 0.3 temporalmente para testing
2. Verificar logs de Google Cloud Console
3. Revisar "reasons" en la respuesta del API

---

### Score = 0.1 en desarrollo local

**Causa:** reCAPTCHA detecta localhost como sospechoso

**Solución:**
- Agregar `localhost` a dominios permitidos en Google Cloud
- O ajustar threshold a 0.0 SOLO en desarrollo:

```typescript
// En route.ts
const isDevelopment = process.env.NODE_ENV === 'development';
const minScore = isDevelopment ? 0.0 : 0.5;

return {
  success: isValid && actionMatches && score >= minScore,
  // ...
};
```

---

## ✅ Checklist Final

```
Configuración:
□ API Key obtenida de Google Cloud
□ RECAPTCHA_API_KEY agregada a .env.local
□ reCAPTCHA Enterprise API habilitada

Código:
□ Types actualizados (LeadAutomationPayload)
□ useEffect agregado (cargar script)
□ orchestrateLeadAutomation actualizado
□ handleLeadSubmit actualizado
□ Checkbox eliminado del HTML
□ route.ts reemplazado completamente

Testing Local:
□ npm run dev funciona
□ Script reCAPTCHA carga
□ No aparece checkbox
□ Formulario envía sin errores
□ Token se genera correctamente
□ API verifica token (score > 0.5)

HubSpot:
□ Lead se crea correctamente
□ Atribución funciona
□ No se crean leads de bots

Production:
□ RECAPTCHA_API_KEY en Vercel
□ Deploy exitoso
□ Test en producción OK
□ Verificación en Google Cloud Console
```

---

## 📈 Monitoreo Post-Implementación

### Google Cloud Console (Recomendado):
```
1. Ve a: Security > reCAPTCHA Enterprise
2. Dashboard
3. Métricas a revisar:
   - Total assessments (requests)
   - Average risk score
   - Actions by score
   - Reasons distribution
```

### Logs del Servidor:
```bash
# Ver logs en Vercel
vercel logs --follow

# Buscar:
# - "reCAPTCHA verified successfully. Score: X.X"
# - "reCAPTCHA verification failed"
```

### HubSpot:
```
Comparar:
- Leads ANTES de reCAPTCHA Enterprise
- Leads DESPUÉS de reCAPTCHA Enterprise

Si ves reducción drástica (>30%):
→ Considera bajar threshold a 0.3-0.4
```

---

## 🎯 Ventajas vs. Checkbox Manual

| Aspecto | Checkbox Manual | reCAPTCHA Enterprise |
|---------|----------------|---------------------|
| **UX** | Fricción (click extra) | Sin fricción (invisible) |
| **Protección** | Básica | Avanzada (ML + score) |
| **Falsos positivos** | Pocos | Muy pocos |
| **Bots avanzados** | Pueden burlar | Difícil de burlar |
| **Analytics** | No disponible | Dashboard completo |
| **Configuración** | Simple | Requiere Google Cloud |
| **Costo** | Gratis | Gratis (hasta 10k/mes) |

---

## 💰 Costos de reCAPTCHA Enterprise

**Tier Gratuito:**
- 10,000 assessments/mes
- Gratis para siempre

**Paid Tier (si excedes):**
- $1 USD por cada 1,000 assessments adicionales

**Ejemplo:**
- 50,000 leads/mes = $40 USD/mes
- 100,000 leads/mes = $90 USD/mes

**Para Playa Viva:**
Con 1,000-2,000 leads/mes → Completamente gratis

---

## 📞 Soporte

**¿Problemas?**
- Email: tony@uniestate.co.uk
- Google Cloud Support: https://cloud.google.com/support

**Recursos:**
- [reCAPTCHA Enterprise Docs](https://cloud.google.com/recaptcha-enterprise/docs)
- [API Reference](https://cloud.google.com/recaptcha-enterprise/docs/reference/rest)
- [Best Practices](https://cloud.google.com/recaptcha-enterprise/docs/best-practices)

---

**¡Listo! reCAPTCHA Enterprise protegerá tu formulario sin molestar a usuarios reales.**
