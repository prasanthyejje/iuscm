// /**
//  * Import function triggers from their respective submodules:
//  *
//  * const {onCall} = require("firebase-functions/v2/https");
//  * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
//  *
//  * See a full list of supported triggers at https://firebase.google.com/docs/functions
//  */

// const {setGlobalOptions} = require("firebase-functions");
// const {onRequest} = require("firebase-functions/https");
// const logger = require("firebase-functions/logger");

// // For cost control, you can set the maximum number of containers that can be
// // running at the same time. This helps mitigate the impact of unexpected
// // traffic spikes by instead downgrading performance. This limit is a
// // per-function limit. You can override the limit for each function using the
// // `maxInstances` option in the function's options, e.g.
// // `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// // NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// // functions should each use functions.runWith({ maxInstances: 10 }) instead.
// // In the v1 API, each function can only serve one request per container, so
// // this will be the maximum concurrent request count.
// setGlobalOptions({ maxInstances: 10 });

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started

// // exports.helloWorld = onRequest((request, response) => {
// //   logger.info("Hello logs!", {structuredData: true});
// //   response.send("Hello from Firebase!");
// // });

const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

// SMTP Configuration
// OPTION 1: Gmail (for testing - replace with your Gmail credentials)
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "usaiuscm@gmail.com", // Replace with your Gmail
//     pass: "rnpa jtbm gizo lfel", // Use Gmail App Password, not regular password
//   },
// });

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: "spiritualmagazine@iuscm.org ",
    pass: "Iuscm@USA ", // not app password here
  },
  tls: {
    ciphers: "SSLv3",
  },
});

// OPTION 2: Outlook (currently disabled - needs SMTP AUTH enabled in Microsoft 365)
// const transporter = nodemailer.createTransport({
//   host: "smtp.office365.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: "spiritualmagazine@iuscm.org",
//     pass: "Iuscm@USA",
//   },
//   tls: {
//     ciphers: "SSLv3",
//   },
// });

// Cloud Function to send an email
exports.sendEmail = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "POST");
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
      from: "prashanthyejje@gmail.com", // Change this to match your SMTP user
      to: email,
      subject: "Welcome to IUSCM Quarterly Spiritual Magazine",
      text: `Dear ${name},\n\nThank you for subscribing to our Quarterly Spiritual Magazine! You will receive teachings from Self-realized Masters directly to your inbox.\n\nBlessings,\nIUSCM Team`,
    };

    // Email to admin (notification)
    const adminMailOptions = {
      from: "prashanthyejje@gmail.com", // Change this to match your SMTP user
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
      from: "usaiuscm@gmail.com", // Change this to match your SMTP user
      to: "usaiuscm@gmail.com",
      subject: `New Contact Form Submission from ${name}`,
      text: `You have received a new message from the IUSCM website contact form:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nYou can reply directly to: ${email}`,
    };

    // Confirmation email to user
    const userMailOptions = {
      from: "usaiuscm@gmail.com", // Change this to match your SMTP user
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
