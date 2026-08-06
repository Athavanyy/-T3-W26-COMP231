const nodemailer = require("nodemailer");

class EmailService {
  static transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 587),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  static async sendAnnouncementEmail(student, announcement, clubName) {
    return this.transporter.sendMail({
      from: `"Campus Club Management System" <${process.env.MAIL_USER}>`,
      to: student.email,
      subject: `${clubName}: ${announcement.title}`,
      text: `
Hello ${student.full_name},

A new announcement has been published by ${clubName}.

${announcement.title}

${announcement.message}

Campus Club Management System
      `.trim(),
    });
  }
}

module.exports = EmailService;