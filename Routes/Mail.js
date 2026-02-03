const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ subject, text }) => {
  return resend.emails.send({
    from: "ATM Pharmacy <onboarding@resend.dev>",
    to: ["atmpharmacytech@gmail.com"],
    subject,
    text,
  });
};

module.exports = sendEmail;