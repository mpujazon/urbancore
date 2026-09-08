const { waitUntil } = require('@vercel/functions');

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }

  const wakeUp = fetch('https://TU-BACKEND.onrender.com/health')
    .then(async (response) => {
      console.log(`Render respondió con HTTP ${response.status}`);
    })
    .catch((error) => {
      console.error('Error despertando Render:', error);
    });

  waitUntil(wakeUp);

  return res.status(200).send('OK');
};