import { subscribe, getBacklog, GLinkEvent } from '@/lib/events';

export const dynamic = 'force-dynamic';

/**
 * Server-Sent Events stream. The browser opens one EventSource and receives
 * every live event: Brain Repo file changes, workflow phases from the
 * gstack log tail, and sync activity.
 */
export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (e: GLinkEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`));
        } catch {
          /* controller already closed */
        }
      };

      for (const e of getBacklog(30)) send(e);
      const unsubscribe = subscribe(send);

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          /* closed */
        }
      }, 25000);

      request.signal.addEventListener('abort', () => {
        unsubscribe();
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
