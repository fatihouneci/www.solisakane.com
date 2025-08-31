import nodemailer from "nodemailer";
import dotenv from "dotenv";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const smtpOptions = {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
};

async function sendEmail({
  to,
  subject,
  template,
  from = String(process.env.MAIL_EMAIL),
  data,
}) {
  const transporter = nodemailer.createTransport(smtpOptions);
  const html = await ejs.renderFile(
    path.join(__dirname, `../templates/${template}`),
    data
  );
  await transporter.sendMail({ from, to, subject, html });
}

export default sendEmail;
