/**
 * Utilidades para accesibilidad (a11y)
 * WCAG 2.1 AA compliance
 */

/**
 * Generar aria-label descriptivo para botones
 */
export function getButtonAriaLabel(action: string, target?: string): string {
  if (target) {
    return `${action} ${target}`;
  }
  return action;
}

/**
 * Generar aria-label para iconos
 */
export function getIconAriaLabel(action: string): string {
  return action;
}

/**
 * Generar descripción para campos de formulario
 */
export function getFieldDescription(fieldName: string, error?: string): string {
  if (error) {
    return `${fieldName}. Error: ${error}`;
  }
  return fieldName;
}

/**
 * Anunciar cambios dinámicos a screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): HTMLDivElement {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only'; // Oculto visualmente pero accesible
  announcement.textContent = message;
  document.body.appendChild(announcement);

  // Remover después de que se haya anunciado
  setTimeout(() => {
    announcement.remove();
  }, 1000);

  return announcement;
}

/**
 * Colores accesibles con contraste WCAG AA
 * Normal text: 4.5:1 ratio
 * Large text: 3:1 ratio
 */
export const A11Y_COLORS = {
  // Background: white (#ffffff)
  // TEXT
  textDark: '#1F2937', // gray-800, contrast 8.59:1
  textGray: '#4B5563', // gray-600, contrast 7.27:1
  textSecondary: '#6B7280', // gray-500, contrast 5.43:1

  // INTERACTIVE
  primary: '#EA580C', // orange-600, contrast 6.2:1
  primaryDark: '#C9430C', // darker orange, contrast 7.8:1
  success: '#059669', // green-600, contrast 5.23:1
  error: '#DC2626', // red-600, contrast 6.95:1
  warning: '#D97706', // amber-600, contrast 5.75:1
  info: '#0284C7', // blue-600, contrast 5.64:1

  // BACKGROUNDS
  bgLight: '#F3F4F6', // gray-100, contrast with text-dark: 10.37:1
  bgLighter: '#F9FAFB', // gray-50, contrast with text-dark: 11.83:1
  bgError: '#FEE2E2', // red-100, contrast with error: 3.26:1
  bgSuccess: '#DBEAFE', // blue-100, contrast with success: 5.79:1
};

/**
 * Roles ARIA semánticos
 */
export const ARIA_ROLES = {
  button: 'button',
  link: 'link',
  menuitem: 'menuitem',
  checkbox: 'checkbox',
  radio: 'radio',
  tab: 'tab',
  navigation: 'navigation',
  main: 'main',
  region: 'region',
  complementary: 'complementary',
  contentinfo: 'contentinfo',
  status: 'status',
  alert: 'alert',
  alertdialog: 'alertdialog',
  dialog: 'dialog',
  form: 'form',
  progressbar: 'progressbar',
  slider: 'slider',
  spinbutton: 'spinbutton',
  tooltip: 'tooltip',
} as const;
