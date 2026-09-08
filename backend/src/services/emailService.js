export const sendEmail = async ({ to, subject, text, html }) => {
  const configured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

  if (!configured) {
    console.warn(`[mail] Skipping email to ${to} — SMTP not configured (subject: ${subject})`);
    return { skipped: true };
  }

  // TODO: plug in a real mail provider (Nodemailer, AWS SES, Resend, etc.)
  // using process.env.SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM.
  console.log(`[mail] Sending "${subject}" to ${to}:\n${text}`);
  return { skipped: false };
};

export default sendEmail;