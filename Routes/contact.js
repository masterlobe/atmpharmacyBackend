const express = require("express");
const router = express.Router();
const sendEmail = require("./Mail");

router.post("/", async (req, res) => {
  try {
    // 1️⃣ Body existence check
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: "Request body is missing. Did you forget express.json()?"
      });
    }

    const { firstName, lastName, email, message } = req.body;

    // 2️⃣ Required fields check
    if (!firstName || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        details: {
          firstName: !!firstName,
          email: !!email,
          message: !!message
        }
      });
    }

    // 3️⃣ Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format"
      });
    }

    // 4️⃣ Environment variable check
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        error: "Email service not configured properly",
        missing: {
          EMAIL_USER: !!process.env.EMAIL_USER,
          EMAIL_PASS: !!process.env.EMAIL_PASS
        }
      });
    }

    // 5️⃣ Send email
    await sendEmail({
      subject: "New Contact Enquiry",
      text: `
New Contact Enquiry

Name: ${firstName} ${lastName || ""}
Email: ${email}

Message:
${message}
      `,
    });

    // 6️⃣ Success response
    return res.json({ success: true });

  } catch (err) {
    // 7️⃣ SMTP specific errors
    if (err.code === "EAUTH") {
      return res.status(500).json({
        success: false,
        error: "Email authentication failed (EAUTH)",
        hint: "Check EMAIL_USER / EMAIL_PASS or regenerate app password"
      });
    }

    if (err.code === "ECONNECTION" || err.code === "ETIMEDOUT") {
      return res.status(500).json({
        success: false,
        error: "Could not connect to email server",
        hint: "Network issue or SMTP blocked"
      });
    }

    // 8️⃣ Generic fallback
    console.error("CONTACT ROUTE ERROR:", err);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: err.message
    });
  }
});

module.exports = router;