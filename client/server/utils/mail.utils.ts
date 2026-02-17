import nodemailer from 'nodemailer';

function getTransporter() {
  const host = (process.env.APP_SMTP_HOST || 'smtp.hostinger.com').trim();
  const port = Number((process.env.APP_SMTP_PORT || '465').trim());
  const user = (process.env.APP_SMTP_EMAIL || '').trim();
  const pass = (process.env.APP_SMTP_PASS || '').trim();

  if (!user || !pass) {
    console.error('[SMTP] Missing APP_SMTP_EMAIL or APP_SMTP_PASS environment variables');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

export async function sendCustomEmail(to: string, subject: string, htmlContent: string) {
  const fromEmail = (process.env.APP_SMTP_EMAIL || '').trim();
  const fromName = (process.env.APP_SMTP_NAME || 'DiReCT').trim();

  const mailOptions = {
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    html: htmlContent
  };

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email: ', error);
    throw error;
  }
}
