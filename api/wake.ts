import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }

  res.status(200).send('OK');

  fetch('https://TU-BACKEND.onrender.com/health').catch(() => {});
}