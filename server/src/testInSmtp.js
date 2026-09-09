const nodemailer = require('nodemailer');

const testSusaIn = async () => {
  const host = 'mail.susalabs.in';
  const port = 465;
  const user = 'alam@susalabs.in';
  const pass = 'n>S+pA2JY?Kh5_,';

  console.log(`Testing SMTP server ${host}:${port} with user ${user}...`);

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: true,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });

    await transporter.verify();
    console.log('✅ SUCCESS! Connection and Authentication verified successfully on mail.susalabs.in!');

    // Test sending email
    const info = await transporter.sendMail({
      from: `"EduVerse India" <${user}>`,
      to: 'complaintwork2@gmail.com',
      subject: '[EduVerse] Your 6-Digit Email OTP Test: 987654',
      html: '<h1>Hello! Your OTP Code is 987654</h1>'
    });

    console.log('🎉 LIVE EMAIL DISPATCH SUCCESS! Message ID:', info.messageId);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
};

testSusaIn();
