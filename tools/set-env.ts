const fs = require('fs');
const path = require('path');

const environmentsDir = path.resolve(__dirname, '../src/environments');
if (!fs.existsSync(environmentsDir)) {
  fs.mkdirSync(environmentsDir, { recursive: true });
}

const targetPath = path.join(environmentsDir, 'environment.ts');

const envConfigFile = `export const environment = {
  production: true,
  API_BASE_URL: '${process.env.API_BASE_URL || 'http://localhost:8080/api'}',
  firebaseConfig: {
    apiKey: "${process.env.FIREBASE_API_KEY}",
    authDomain: "${process.env.FIREBASE_AUTH_DOMAIN}",
    projectId: "${process.env.FIREBASE_PROJECT_ID}",
    storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET}",
    messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID}",
    appId: "${process.env.FIREBASE_APP_ID}",
    measurementId: "${process.env.FIREBASE_MEASUREMENT_ID}"
  }
};
`;

fs.writeFileSync(targetPath, envConfigFile);
console.log('environment.ts generated successfully.');
