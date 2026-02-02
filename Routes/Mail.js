const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // app password
  },
});

const sendEmail = async ({ subject, text }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: "atmpharmacytech@gmail.com",
    subject,
    text,
  });
};

module.exports = sendEmail;