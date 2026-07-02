import nodemailer, { type Transporter } from "nodemailer";

// Built lazily so useRuntimeConfig() is only called inside the Nuxt request context.
let transporter: Transporter | undefined;

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  console.log("sending email")
  const { smtp } = useRuntimeConfig();
  if (!transporter) {
    const port = parseInt(smtp.port, 10);
    transporter = nodemailer.createTransport({
      host: smtp.host,
      port,
      secure: port === 465,
      // auth only when creds are set → local Mailpit stays auth-less, ZeptoMail uses env
      auth: smtp.user && smtp.pass ? { user: smtp.user, pass: smtp.pass } : undefined,
    });
  }
  try {
    await transporter.sendMail({
      from: smtp.from,
      to,
      subject,
      html,
    });
    console.log(`[Email Sent] To: ${to}, Subject: ${subject}`);
  } catch (err) {
    console.error(`[Email Error] Failed to send email to ${to}:`, err);
    console.log("------------------ LOCAL DEV EMAIL PREVIEW ------------------");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("Body (HTML):");
    console.log(html);
    console.log("-------------------------------------------------------------");
  }
}
