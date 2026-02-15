import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.APP_SMTP_HOST || 'smtp.hostinger.com',
  port: Number(process.env.APP_SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.APP_SMTP_EMAIL,
    pass: process.env.APP_SMTP_PASS
  }
});

export async function sendCustomEmail(to: string, subject: string, htmlContent: string) {
  const mailOptions = {
    from: `${process.env.APP_SMTP_NAME || 'DiReCT'} <${process.env.APP_SMTP_EMAIL}>`,
    to,
    subject,
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email: ', error);
  }
}
