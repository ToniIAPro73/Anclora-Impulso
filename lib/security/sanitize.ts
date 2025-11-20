/**
 * Input Sanitization Utilities
 * Prevents XSS (Cross-Site Scripting) attacks by escaping HTML characters
 * and removing potentially dangerous content
 */

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param input - User input string
 * @returns Sanitized string safe for HTML rendering
 */
export function escapeHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char]);
}

/**
 * Sanitizes user input by removing potentially dangerous content
 * @param input - User input string
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove any script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove any event handlers (onclick, onload, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["']([^"']*?)["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Remove data: protocol (can be used for attacks)
  sanitized = sanitized.replace(/data:text\/html/gi, '');

  return sanitized.trim();
}

/**
 * Sanitizes text content for safe display in HTML
 * Combines HTML escaping with input sanitization
 * @param input - User input string
 * @returns Fully sanitized string safe for display
 */
export function sanitizeText(input: string): string {
  const sanitized = sanitizeInput(input);
  return escapeHtml(sanitized);
}

/**
 * Sanitizes URLs to prevent javascript: and data: protocols
 * @param url - URL string
 * @returns Safe URL or empty string if dangerous
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return '';
  }

  const lowerUrl = url.toLowerCase().trim();

  // Block dangerous protocols
  if (
    lowerUrl.startsWith('javascript:') ||
    lowerUrl.startsWith('data:') ||
    lowerUrl.startsWith('vbscript:')
  ) {
    return '';
  }

  // Allow relative and same-origin absolute URLs
  if (lowerUrl.startsWith('/') || lowerUrl.startsWith('http')) {
    return url;
  }

  return '';
}

/**
 * Sanitizes an object by escaping all string values
 * Useful for sanitizing form data
 * @param obj - Object to sanitize
 * @returns Object with sanitized string values
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };

  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = escapeHtml(value) as any;
    } else if (value !== null && typeof value === 'object') {
      sanitized[key as keyof T] = sanitizeObject(value);
    }
  }

  return sanitized;
}

/**
 * Validates and sanitizes email addresses
 * @param email - Email string
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return '';
  }

  const sanitized = email.trim().toLowerCase();

  // Basic email validation (RFC 5322 simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailRegex.test(sanitized)) {
    return sanitized;
  }

  return '';
}

/**
 * Sanitizes numeric input
 * @param input - Input that should be a number
 * @param min - Minimum allowed value (optional)
 * @param max - Maximum allowed value (optional)
 * @returns Safe number or null if invalid
 */
export function sanitizeNumber(
  input: string | number,
  min?: number,
  max?: number
): number | null {
  const num = typeof input === 'string' ? parseFloat(input) : input;

  if (isNaN(num) || !isFinite(num)) {
    return null;
  }

  if (min !== undefined && num < min) {
    return null;
  }

  if (max !== undefined && num > max) {
    return null;
  }

  return num;
}

/**
 * Strips all HTML tags from input
 * @param input - String potentially containing HTML
 * @returns String with all HTML tags removed
 */
export function stripHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input.replace(/<[^>]*>/g, '');
}

/**
 * Validates input length with sanitization
 * @param input - User input
 * @param maxLength - Maximum allowed length
 * @returns Sanitized input truncated to maxLength
 */
export function sanitizeWithMaxLength(input: string, maxLength: number): string {
  if (typeof input !== 'string') {
    return '';
  }

  return sanitizeText(input).substring(0, maxLength);
}
