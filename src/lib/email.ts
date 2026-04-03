import nodemailer from "nodemailer";

const ADMIN_EMAIL = "keugenelee11@gmail.com";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ADMIN_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendAdminEmail(subject: string, html: string) {
  await transporter.sendMail({
    from: `Ardsleypost <${ADMIN_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject,
    html,
  });
}
