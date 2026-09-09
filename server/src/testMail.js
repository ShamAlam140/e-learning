const { sendEmailOTP } = require('./utils/emailService');
require('dotenv').config();

const runEnvTest = async () => {
  console.log('--- Testing Email Dispatch with Exact .env Settings ---');
  console.log(`SMTP_HOST: ${process.env.SMTP_HOST}`);
  console.log(`SMTP_PORT: ${process.env.SMTP_PORT}`);
  console.log(`SMTP_USER: ${process.env.SMTP_USER}`);

  const recipient = 'complaintwork2@gmail.com';
  const otpCode = '987654';

  console.log(`Sending Email OTP code ${otpCode} to ${recipient}...`);
  const result = await sendEmailOTP(recipient, otpCode, 'Super Admin');
  console.log('Dispatch Result:', result);
  process.exit(0);
};

runEnvTest();
