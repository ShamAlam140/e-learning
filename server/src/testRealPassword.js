const nodemailer = require('nodemailer');

const testRealPass = async () => {
  const host = 'mail.susalabs.com';
  const ports = [465, 587];
  const user = 'alam@susalabs.com';
  const pass = 'n>S+pA2JY?Kh5_,';

  console.log(`Testing ${host} with user ${user} and password n>S+pA2JY?Kh5_, ...`);

  for (const port of ports) {
    console.log(`Testing port ${port}...`);
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
      });

      await transporter.verify();
      console.log(`🎉 SUCCESS! Port ${port} connected & authenticated successfully!`);

      const info = await transporter.sendMail({
        from: `"EduVerse India" <${user}>`,
        to: 'complaintwork2@gmail.com',
        subject: '[EduVerse Live] Your 6-Digit Email OTP: 885912',
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #0f172a; color: #fff; border-radius: 10px;">
            <h1 style="color: #6366f1;">EduVerse India</h1>
            <p>Your 6-Digit Email Verification OTP Code is:</p>
            <h2 style="color: #34d399; font-size: 32px; letter-spacing: 6px;">885912</h2>
          </div>
        `
      });

      console.log('✅ LIVE EMAIL SENT TO complaintwork2@gmail.com! Message ID:', info.messageId);
      process.exit(0);
    } catch (err) {
      console.log(`❌ Failed on port ${port}:`, err.message);
    }
  }
  process.exit(1);
};

testRealPass();
