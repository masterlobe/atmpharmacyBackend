const express = require("express");
const router = express.Router();
const sendEmail = require("./Mail");

router.post("/", async (req, res) => {
  const { firstName, lastName, email, message } = req.body;

  try {
    await sendEmail({
      subject: "New Contact Enquiry",
      text: `
New Contact Enquiry

Name: ${firstName} ${lastName}
Email: ${email}

Message:
${message}
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;