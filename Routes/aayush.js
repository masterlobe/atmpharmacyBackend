const { Resend } = require("resend");


const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ subject, text }) => {
  return resend.emails.send({
    from: "aayushshah personal Brand <onboarding@resend.dev>",
    to: ["aayushshah12311@gmail.com"],
    subject,
    text,
  });
};

module.exports = sendEmail;