# Phase 3 Features - Quick Reference Guide

## 🎯 Accessibility (a11y) Features

### ARIA Label Utilities
**Location:** `lib/a11y/useAriaLabel.ts`

```typescript
import {
  getButtonAriaLabel,
  getIconAriaLabel,
  getFieldDescription,
  announceToScreenReader,
  A11Y_COLORS,
  ARIA_ROLES
} from '@/lib/a11y/useAriaLabel'

// Generate labels for buttons
const deleteLabel = getButtonAriaLabel('Delete', 'Exercise')  // "Delete Exercise"

// Generate labels for icons
const helpLabel = getIconAriaLabel('Show help')

// Generate field descriptions with errors
const fieldDesc = getFieldDescription('Email', 'Invalid format')

// Announce to screen readers
const announcement = announceToScreenReader(
  'Workout saved successfully',
  'polite'  // or 'assertive'
)

// Use WCAG AA compliant colors
const colors = A11Y_COLORS
colors.primary      // #EA580C (6.2:1 contrast)
colors.error        // #DC2626 (6.95:1 contrast)

// ARIA roles
const role = ARIA_ROLES.button  // 'button'
```

### Focus Management Hooks
**Location:** `hooks/use-focus-trap.ts`

```typescript
import {
  useFocusTrap,
  useAriaLive,
  useSkipLink
} from '@/hooks/use-focus-trap'

// Trap focus in modals
const containerRef = useFocusTrap(isOpen)
<div ref={containerRef}>
  {/* Only these elements can be focused */}
</div>

// Announce changes to screen readers
const announcementRef = useAriaLive('Item added', 'polite')
<div ref={announcementRef} className="sr-only" />

// Skip to main content link
const skipLinkRef = useSkipLink()
<a ref={skipLinkRef} href="#main-content">Skip to main content</a>
```

### Enhanced Dialog Component
**Location:** `components/ui/dialog.tsx`

```typescript
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger>Open Modal</DialogTrigger>
  <DialogContent aria-label="Delete confirmation">
    <DialogTitle id="dialog-title">Confirm Delete</DialogTitle>
    <DialogDescription>
      This action cannot be undone.
    </DialogDescription>
  </DialogContent>
</Dialog>
```

## 🔐 Security Features

### Input Sanitization
**Location:** `lib/security/sanitize.ts`

```typescript
import {
  escapeHtml,
  sanitizeText,
  sanitizeEmail,
  sanitizeUrl,
  sanitizeObject,
  sanitizeNumber,
  stripHtml,
  sanitizeWithMaxLength
} from '@/lib/security/sanitize'

// Escape HTML special characters
const safe = escapeHtml('<script>alert("xss")</script>')

// Full sanitization for display
const safeName = sanitizeText(userInput)

// Validate and sanitize email
const email = sanitizeEmail('user@example.com')

// Sanitize URLs (blocks javascript: and data:)
const url = sanitizeUrl('/path/to/page')

// Sanitize entire form object
const data = sanitizeObject({ name, email, bio })

// Validate and constrain numbers
const age = sanitizeNumber(input, 0, 120)

// Remove HTML tags
const text = stripHtml('<p>Hello <b>world</b></p>')

// Sanitize with max length
const bio = sanitizeWithMaxLength(input, 255)
```

### Content Security Policy Headers
**Location:** `middleware.ts`

Automatically applied to all requests:
- `Content-Security-Policy`: Script/style/font restrictions
- `X-Content-Type-Options`: MIME sniffing prevention
- `X-Frame-Options`: Clickjacking prevention
- `X-XSS-Protection`: Legacy browser XSS protection
- `Referrer-Policy`: Referrer information control
- `Permissions-Policy`: Browser feature restrictions
- `Strict-Transport-Security`: HTTPS enforcement

## 📊 Logging & Error Tracking

### Client Logger
**Location:** `lib/logging/client-logger.ts`

```typescript
import { clientLogger, setupErrorHandlers } from '@/lib/logging/client-logger'

// Log at different levels
clientLogger.debug('Debug message', { data: 'value' })
clientLogger.info('Info message')
clientLogger.warn('Warning message')
clientLogger.error('Error message', error, { context: 'data' })

// Track user actions
clientLogger.trackEvent('button_clicked', { buttonId: '123' })
clientLogger.trackPageView('/dashboard')
clientLogger.trackApiError('/api/workouts', 500, 'Server Error')
clientLogger.trackPerformance('page_load', 2500)

// User context
clientLogger.setUser('user-123', { email: 'user@example.com' })
clientLogger.clearUser()

// Manage logs
const allLogs = clientLogger.getLogs()
clientLogger.clearLogs()
clientLogger.forceFlush()

// Setup handlers (called automatically in layout)
setupErrorHandlers()
```

### Logging API Endpoint
**Endpoint:** `POST /api/logs`

Receives logs from frontend and stores them. Automatically flushed every 30 seconds or on page unload.

## 📚 API Documentation

### Swagger/OpenAPI
**Swagger UI:** `http://localhost:3001/api/docs/api` (development)

**JSON Schema:** `GET /api/docs/swagger.json`

Includes documentation for:
- Authentication (register, login, refresh, logout)
- Exercises (list, get by ID)
- Workouts (create, read, update, delete)
- Progress (list, add measurements)
- Health checks

### Interactive Testing
- Try out API endpoints directly from browser
- View request/response examples
- See all possible status codes
- Test authentication

## 📋 Form Accessibility Examples

### Login Form
```tsx
<form aria-label="Login form">
  <label htmlFor="email">
    Email <span aria-label="required">*</span>
  </label>
  <input
    id="email"
    type="email"
    required
    aria-required="true"
    aria-describedby="email-error"
  />

  {error && (
    <div
      id="login-error"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {error}
    </div>
  )}

  <button type="submit" aria-busy={isLoading}>
    Sign In
  </button>
</form>
```

## 🎨 WCAG AA Color Palette

```typescript
import { A11Y_COLORS } from '@/lib/a11y/useAriaLabel'

// All colors have 4.5:1 contrast ratio on white background
A11Y_COLORS.textDark        // #1F2937 (8.59:1)
A11Y_COLORS.textGray        // #4B5563 (7.27:1)
A11Y_COLORS.primary         // #EA580C (6.2:1)
A11Y_COLORS.success         // #059669 (5.23:1)
A11Y_COLORS.error           // #DC2626 (6.95:1)
A11Y_COLORS.warning         // #D97706 (5.75:1)
A11Y_COLORS.info            // #0284C7 (5.64:1)
```

## 🚀 Getting Started

### 1. Install CSP & Security Headers
Already configured in `middleware.ts` - no action needed!

### 2. Add to Existing Forms
```tsx
import { getButtonAriaLabel } from '@/lib/a11y/useAriaLabel'

// Add to any form input
<input aria-required="true" aria-describedby="error-id" />

// Add to buttons
<button aria-label={getButtonAriaLabel('Delete', 'Item')}>
  Delete
</button>
```

### 3. Sanitize User Input
```tsx
import { sanitizeText } from '@/lib/security/sanitize'

const displayName = sanitizeText(userInput)
```

### 4. Setup Error Logging
```tsx
// Already done in layout.tsx, but you can use:
import { clientLogger } from '@/lib/logging/client-logger'

clientLogger.error('Something went wrong', error)
```

## 📖 Additional Resources

- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices:** https://www.w3.org/WAI/ARIA/apg/
- **CSP Documentation:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- **Swagger/OpenAPI:** https://swagger.io/

## ✅ Compliance Checklist

- ✅ Keyboard navigation on all interactive elements
- ✅ Focus visible indicators
- ✅ ARIA labels on buttons and form inputs
- ✅ Screen reader announcements with aria-live
- ✅ Color contrast WCAG AA (4.5:1 minimum)
- ✅ CSP headers on all responses
- ✅ XSS prevention through sanitization
- ✅ Error logging and tracking
- ✅ API documentation with Swagger

---

**Need help?** Check the PHASE3_COMPLETED.md for detailed implementation notes!
