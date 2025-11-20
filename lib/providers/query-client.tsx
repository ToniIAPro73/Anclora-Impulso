'use client';

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Crear instancia de QueryClient con configuración para Anclora Impulso
 * Separada aquí para evitar recrear en cada render
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Datos se consideran frescos por 5 minutos
        staleTime: 5 * 60 * 1000,

        // Mantener datos en caché por 10 minutos (cacheTime en versiones antiguas)
        gcTime: 10 * 60 * 1000,

        // Reintentar fallos una vez
        retry: 1,

        // No refetchar cuando la ventana gana foco
        // (se puede habilitar por query si se necesita)
        refetchOnWindowFocus: false,

        // No refetchar cuando la conexión vuelve online
        refetchOnReconnect: true,

        // No refetchar cuando el componente se monta
        refetchOnMount: false,
      },
      mutations: {
        // Reintentar mutaciones fallidas una vez
        retry: 1,
      },
    },
  });
}

// Crear instancia global para SSR
let clientQueryClientInstance: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: crear nueva instancia cada request
    return makeQueryClient();
  }

  // Browser: reutilizar la misma instancia
  if (!clientQueryClientInstance) {
    clientQueryClientInstance = makeQueryClient();
  }

  return clientQueryClientInstance;
}

interface QueryClientProviderProps {
  children: ReactNode;
}

/**
 * Proveedor de QueryClient para toda la aplicación
 * Debe envolver toda la app para que todos los hooks funcionen
 */
export function ReactQueryProvider({ children }: QueryClientProviderProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export { getQueryClient };
