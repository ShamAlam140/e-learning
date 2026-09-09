const nodemailer = require('nodemailer');
require('dotenv').config();

const user = 'alam@susalabs.com';
const pass = 'Susa@Mail123!';
const host = 'mail.susalabs.com';

const configs = [
  { name: 'Port 465 SSL Direct', host, port: 465, secure: true, auth: { user, pass }, tls: { rejectUnauthorized: false } },
  { name: 'Port 587 TLS', host, port: 587, secure: false, auth: { user, pass }, tls: { rejectUnauthorized: false } },
  { name: 'Port 25 Plain/TLS', host, port: 25, secure: false, auth: { user, pass }, tls: { rejectUnauthorized: false } },
  { name: 'Port 587 LOGIN Auth', host, port: 587, secure: false, auth: { user, pass }, authMethod: 'LOGIN', tls: { rejectUnauthorized: false } },
  { name: 'Port 465 LOGIN Auth', host, port: 465, secure: true, auth: { user, pass }, authMethod: 'LOGIN', tls: { rejectUnauthorized: false } },
  { name: 'Port 587 Short User (alam)', host, port: 587, secure: false, auth: { user: 'alam', pass }, tls: { rejectUnauthorized: false } }
];

const testAll = async () => {
  for (const config of configs) {
    console.log(`\nTesting: ${config.name}...`);
    try {
      const transporter = nodemailer.createTransport(config);
      await transporter.verify();
      console.log(`✅ SUCCESS! ${config.name} connected & authenticated!`);
      process.exit(0);
    } catch (err) {
      console.log(`❌ Failed: ${err.message}`);
    }
  }
  console.log('\nAll variants completed.');
  process.exit(1);
};

testAll();
