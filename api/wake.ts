import type { VercelRequest, VercelResponse } from '@vercel/node';
import { waitUntil } from '@vercel/functions';

export default function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }

  const renderUrl = 'https://urbancore-api.onrender.com/api/health';

  waitUntil(
    fetch(renderUrl).catch(() => {
      // Ignoramos el error.
      // El objetivo es despertar el servicio de Render.
    })
  );

  return res.status(200).send('OK');
}