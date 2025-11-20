import { NextRequest, NextResponse } from 'next/server';

/**
 * API route for receiving and storing frontend logs
 * POST /api/logs
 *
 * Receives logs from the frontend client logger and stores them
 * for debugging and monitoring purposes
 */
export async function POST(request: NextRequest) {
  try {
    const { logs, timestamp } = await request.json();

    if (!logs || !Array.isArray(logs)) {
      return NextResponse.json(
        { error: 'Invalid logs format' },
        { status: 400 }
      );
    }

    // In development, log to console for debugging
    if (process.env.NODE_ENV === 'development') {
      console.group(`📊 Frontend Logs (${new Date(timestamp).toLocaleTimeString()})`);
      logs.forEach((log: any) => {
        const style = getLogStyle(log.level);
        console.log(
          `%c[${log.level.toUpperCase()}] ${log.message}`,
          style,
          log.data || ''
        );
      });
      console.groupEnd();
    }

    // TODO: In production, implement one of:
    // 1. Store logs in a database
    // 2. Send to Sentry: https://sentry.io/
    // 3. Send to DataDog: https://www.datadoghq.com/
    // 4. Send to custom logging service
    // Example:
    // if (process.env.SENTRY_DSN) {
    //   await Sentry.captureException(new Error('Frontend Error'), {
    //     contexts: { logs: { entries: logs } },
    //   });
    // }

    return NextResponse.json(
      { success: true, received: logs.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing logs:', error);
    return NextResponse.json(
      { error: 'Failed to process logs' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get console log style based on level
 */
function getLogStyle(level: string): string {
  switch (level) {
    case 'error':
      return 'color: #dc2626; font-weight: bold;';
    case 'warn':
      return 'color: #d97706; font-weight: bold;';
    case 'info':
      return 'color: #0284c7; font-weight: bold;';
    case 'debug':
      return 'color: #6b7280;';
    default:
      return '';
  }
}
