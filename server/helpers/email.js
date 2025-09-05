/**
 * @file email.js
 * @description
 * EN: This file contains functions for sending emails using Nodemailer.
 * FR: Ce fichier contient des fonctions pour l'envoi d'e-mails à l'aide de Nodemailer.
 */
import nodemailer from "nodemailer"; // EN: Nodemailer library for sending emails / FR: Bibliothèque Nodemailer pour l'envoi d'e-mails
import dotenv from "dotenv"; // EN: Used for loading environment variables / FR: Utilisé pour charger les variables d'environnement
import ejs from "ejs"; // EN: EJS templating engine / FR: Moteur de templating EJS
import path from "path"; // EN: Node.js Path module / FR: Module de chemin de Node.js
import { fileURLToPath } from 'url'; // EN: Utility to convert file URL to path / FR: Utilitaire pour convertir une URL de fichier en chemin
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config(); // EN: Load environment variables from .env file / FR: Charger les variables d'environnement depuis le fichier .env

// EN: SMTP options for Nodemailer transporter
// FR: Options SMTP pour le transporteur Nodemailer
const smtpOptions = {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
};

/**
 * EN: Sends an email using Nodemailer.
 * FR: Envoie un e-mail à l'aide de Nodemailer.
 * @param {object} options - Email options including to, subject, template, from, and data. / Options de l'e-mail incluant le destinataire, le sujet, le modèle, l'expéditeur et les données.
 * @param {string} options.to - Recipient email address. / Adresse e-mail du destinataire.
 * @param {string} options.subject - Email subject. / Sujet de l'e-mail.
 * @param {string} options.template - EJS template file name. / Nom du fichier de modèle EJS.
 * @param {string} [options.from] - Sender email address (defaults to MAIL_EMAIL from .env). / Adresse e-mail de l'expéditeur (par défaut MAIL_EMAIL de .env).
 * @param {object} options.data - Data to pass to the EJS template. / Données à passer au modèle EJS.
 */
async function sendEmail({
  to,
  subject,
  template,
  from = String(process.env.MAIL_EMAIL),
  data,
}) {
  // EN: Create a Nodemailer transporter with the defined SMTP options
  // FR: Créer un transporteur Nodemailer avec les options SMTP définies
  const transporter = nodemailer.createTransport(smtpOptions);

  // EN: Render the email template with provided data
  // FR: Rendre le modèle d'e-mail avec les données fournies
  const html = await ejs.renderFile(
    path.join(__dirname, `../templates/${template}`),
    data
  );

  // EN: Send the email
  // FR: Envoyer l'e-mail
  await transporter.sendMail({ from, to, subject, html });
}

export default sendEmail;