'use client';

import { useEffect } from 'react';
import { setupErrorHandlers } from '@/lib/logging/client-logger';

/**
 * Component that sets up global error handlers on client side
 * Must be rendered in layout to be effective
 */
export function ErrorHandlerSetup() {
  useEffect(() => {
    // Setup error handlers on component mount
    setupErrorHandlers();
  }, []);

  return null;
}
