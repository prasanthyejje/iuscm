const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

// SMTP Configuration
// Office365 SMTP - Using App Password for authentication
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: "spiritualmagazine@iuscm.org",
    pass: "fpftbmkpbprswsjj", // App Password from Microsoft Security
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2",
  },
  authMethod: "LOGIN",
  debug: true,
  logger: true,
});

// Cloud Function to send an email
exports.sendEmail = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).send("");
  }

  try {
    const { name, email } = req.body;

    console.log("Subscription data received:", { name, email });

    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, error: "Missing name or email" });
    }

    // Email to subscriber
    const subscriberMailOptions = {
      from: "spiritualmagazine@iuscm.org",
      to: email,
      subject: "Welcome to IUSCM Quarterly Spiritual Magazine",
      text: `Dear ${name},\n\nThank you for subscribing to our Quarterly Spiritual Magazine! You will receive teachings from Self-realized Masters directly to your inbox.\n\nBlessings,\nIUSCM Team`,
    };

    // Email to admin (notification)
    const adminMailOptions = {
      from: "spiritualmagazine@iuscm.org",
      to: "spiritualmagazine@iuscm.org", // Admin email to receive notifications
      subject: "New Magazine Subscription",
      text: `New subscription:\n\nName: ${name}\nEmail: ${email}`,
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(subscriberMailOptions),
      transporter.sendMail(adminMailOptions),
    ]);

    return res.status(200).json({
      success: true,
      message: "Subscription successful! Check your email.",
    });
  } catch (error) {
    console.error("Error sending email:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Cloud Function for Contact Form
exports.sendContactEmail = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).send("");
  }

  try {
    const { name, email, message } = req.body;

    console.log("Contact form data received:", { name, email, message });

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    // Email to admin (usaiuscm@gmail.com)
    const adminMailOptions = {
      from: "spiritualmagazine@iuscm.org", // Change this to match your SMTP user
      to: "spiritualmagazine@iuscm.org",
      subject: `New Contact Form Submission from ${name}`,
      text: `You have received a new message from the IUSCM website contact form:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nYou can reply directly to: ${email}`,
    };

    // Confirmation email to user
    const userMailOptions = {
      from: "spiritualmagazine@iuscm.org", // Change this to match your SMTP user
      to: email,
      subject: "Thank you for contacting IUSCM",
      text: `Dear ${name},\n\nThank you for reaching out to us. We have received your message and will get back to you as soon as possible.\n\nYour message:\n${message}\n\nBlessings,\nIUSCM Team`,
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions),
    ]);

    return res.status(200).json({
      success: true,
      message: "Message sent successfully! We'll get back to you soon.",
    });
  } catch (error) {
    console.error("Error sending contact email:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});
