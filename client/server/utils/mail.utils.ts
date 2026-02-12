import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.APP_GMAIL_EMAIL,
    pass: process.env.APP_GMAIL_PASS
  }
});

export async function sendCustomEmail(to: string, subject: string, htmlContent: string) {
  const mailOptions = {
    from: `${process.env.APP_GMAIL_NAME} <${process.env.APP_GMAIL_EMAIL}>`,
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
