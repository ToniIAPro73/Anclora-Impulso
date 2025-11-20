'use client';

import { useEffect, useRef, ReactNode } from 'react';

/**
 * Hook para manejo de focus en modales y dialogs
 * Implementa focus trap (sólo elementos dentro del modal pueden recibir focus)
 * Cumple con WCAG 2.1 Level AA
 */
export function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // Guardar elemento con focus antes de abrir modal
    const previousActiveElement = document.activeElement as HTMLElement;
    initialFocusRef.current = previousActiveElement;

    // Obtener todos los elementos focusables dentro del modal
    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'button:not([disabled])',
        'a[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ];

      return Array.from(
        containerRef.current?.querySelectorAll<HTMLElement>(
          focusableSelectors.join(',')
        ) ?? []
      ).filter((el) => {
        // Excluir elementos no visibles
        return el.offsetParent !== null;
      });
    };

    // Enfocar el primer elemento focusable
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Manejar Tab key para mantener focus dentro del modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab: ir hacia atrás
        if (activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: ir hacia adelante
        if (activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Manejar Escape key
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Trigger close (debe manejarse en el componente)
        const closeEvent = new CustomEvent('trapEscapeKey');
        containerRef.current?.dispatchEvent(closeEvent);
      }
    };

    containerRef.current?.addEventListener('keydown', handleKeyDown);
    containerRef.current?.addEventListener('keyup', handleKeyUp);

    return () => {
      containerRef.current?.removeEventListener('keydown', handleKeyDown);
      containerRef.current?.removeEventListener('keyup', handleKeyUp);

      // Restaurar focus al elemento anterior
      if (initialFocusRef.current) {
        setTimeout(() => {
          initialFocusRef.current?.focus();
        }, 0);
      }
    };
  }, [isOpen]);

  return containerRef;
}

/**
 * Hook para anunciar cambios dinámicos a screen readers
 */
export function useAriaLive(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const liveRegionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!liveRegionRef.current) return;

    liveRegionRef.current.textContent = message;
    liveRegionRef.current.setAttribute('aria-live', priority);
    liveRegionRef.current.setAttribute('aria-atomic', 'true');
  }, [message, priority]);

  return liveRegionRef;
}

/**
 * Hook para manejar skip links (acceso rápido a contenido principal)
 */
export function useSkipLink() {
  const skipLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const handleSkipLink = (e: Event) => {
      e.preventDefault();
      const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
      if (mainContent) {
        (mainContent as HTMLElement).focus();
        (mainContent as HTMLElement).scrollIntoView();
      }
    };

    skipLinkRef.current?.addEventListener('click', handleSkipLink);

    return () => {
      skipLinkRef.current?.removeEventListener('click', handleSkipLink);
    };
  }, []);

  return skipLinkRef;
}
