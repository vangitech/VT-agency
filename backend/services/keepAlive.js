import cron from 'node-cron';

const RENDER_URL = 'https://vt-agency.onrender.com';

export function startKeepAlive() {
  cron.schedule('*/10 * * * *', async () => {
    try {
      const response = await fetch(`${RENDER_URL}/api/health`, {
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        console.error(`[KeepAlive] Ping failed: ${response.status}`);
      }
    } catch (err) {
      console.error(`[KeepAlive] Ping error: ${err.message}`);
    }
  });

  console.log('[KeepAlive] Scheduled every 10 minutes');
}
