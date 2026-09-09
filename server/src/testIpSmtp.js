const nodemailer = require('nodemailer');

const testDirectIp = async () => {
  const ports = [587, 465, 25];
  const user = 'alam@susalabs.com';
  const pass = 'Susa@Mail123!';
  const host = '161.97.80.178'; // Direct IP of mail.susalabs.com

  for (const port of ports) {
    console.log(`Testing direct IP ${host}:${port}...`);
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
      });
      await transporter.verify();
      console.log(`✅ SUCCESS on IP ${host}:${port}!`);

      // Try sending test mail
      const info = await transporter.sendMail({
        from: `"EduVerse India" <${user}>`,
        to: user,
        subject: '[EduVerse Test] Direct IP SMTP Success',
        text: 'Your SMTP is working!'
      });
      console.log('✅ Email sent! Message ID:', info.messageId);
      process.exit(0);
    } catch (err) {
      console.log(`❌ Failed on port ${port}:`, err.message);
    }
  }
  process.exit(1);
};

testDirectIp();
