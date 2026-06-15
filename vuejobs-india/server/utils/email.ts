import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST || "localhost";
const smtpPort = parseInt(process.env.SMTP_PORT || "1025", 10);

export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: false,
});

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  await transporter.sendMail({
    from: '"VueJobs India" <noreply@vuejobs.in>',
    to,
    subject,
    html,
  });
}
