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
      subject: "Welcome to the Journey of Universal Self-Consciousness",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f0; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                  
                  <!-- Header with Golden Accent -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #D4AF37 0%, #C9A961 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: 0.5px;">
                        Institute of Universal Self-Consciousness Movement
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 50px 40px;">
                      <p style="margin: 0 0 20px 0; color: #2C2C2C; font-size: 18px; line-height: 1.6;">
                        Dear <strong>${name}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 25px 0; color: #4A4A4A; font-size: 16px; line-height: 1.8;">
                        Welcome to an exclusive community of thought leaders, visionaries, and seekers of profound wisdom. Your subscription to our <strong>Quarterly Spiritual Magazine</strong> marks the beginning of a transformative journey toward Universal Self-Consciousness.
                      </p>
                      
                      <p style="margin: 0 0 25px 0; color: #4A4A4A; font-size: 16px; line-height: 1.8;">
                        In each edition, you will receive:
                      </p>
                      
                      <ul style="margin: 0 0 25px 0; padding-left: 20px; color: #4A4A4A; font-size: 16px; line-height: 1.8;">
                        <li style="margin-bottom: 12px;"><strong>Timeless Teachings</strong> from Self-realized Masters</li>
                        <li style="margin-bottom: 12px;"><strong>Practical Wisdom</strong> for integrating spiritual principles into professional and personal life</li>
                        <li style="margin-bottom: 12px;"><strong>Insights on Universal Brotherhood</strong> and the Oneness of mankind</li>
                        <li style="margin-bottom: 12px;"><strong>Guidance on Meditation</strong> and the path to inner transformation</li>
                      </ul>
                      
                      <p style="margin: 0 0 25px 0; color: #4A4A4A; font-size: 16px; line-height: 1.8;">
                        As leaders and change-makers, you understand that true success transcends material achievements. The wisdom shared in our magazine offers a pathway to experiencing the Universal Self—the source of all consciousness, creativity, and compassion.
                      </p>
                      
                      <div style="background-color: #FFF9D3; border-left: 4px solid #D4AF37; padding: 20px; margin: 30px 0;">
                        <p style="margin: 0; color: #3A2E12; font-size: 15px; line-height: 1.7; font-style: italic;">
                          "The entire universe and its variety are but mental imagery; the unmanifested, homogeneous true Self is the only source and the underlying common phenomenon, referred to as the 'Universal I' or the 'Supreme Being.'"
                        </p>
                        <p style="margin: 10px 0 0 0; color: #6B6B6B; font-size: 14px; text-align: right;">
                          — Dr. Satyanarayana Chillapa (Swamiji)
                        </p>
                      </div>
                      
                      <p style="margin: 0 0 30px 0; color: #4A4A4A; font-size: 16px; line-height: 1.8;">
                        Your next edition will arrive in your inbox shortly. We are honored to accompany you on this journey of self-discovery and universal consciousness.
                      </p>
                      
                      <p style="margin: 0 0 10px 0; color: #2C2C2C; font-size: 16px; line-height: 1.6;">
                        With profound blessings,
                      </p>
                      <p style="margin: 0; color: #2C2C2C; font-size: 16px; font-weight: 400;">
                        The IUSCM Team
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #2C2C2C; padding: 30px 40px; text-align: center;">
                      <p style="margin: 0 0 10px 0; color: #D4AF37; font-size: 14px; font-weight: 600;">
                        Institute of Universal Self-Consciousness Movement
                      </p>
                      <p style="margin: 0; color: #CCCCCC; font-size: 13px; line-height: 1.6;">
                        Propagating the Oneness of Mankind through Universal Self-Consciousness
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
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
      from: "spiritualmagazine@iuscm.org",
      to: email,
      subject: "We've Received Your Message - IUSCM",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f0; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                  
                  <!-- Header with Golden Accent -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #D4AF37 0%, #C9A961 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: 0.5px;">
                        Institute of Universal Self-Consciousness Movement
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 50px 40px;">
                      <p style="margin: 0 0 20px 0; color: #2C2C2C; font-size: 18px; line-height: 1.6;">
                        Dear <strong>${name}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 25px 0; color: #4A4A4A; font-size: 16px; line-height: 1.8;">
                        Thank you for reaching out to us. We have received your message and deeply appreciate your interest in the Institute of Universal Self-Consciousness Movement.
                      </p>
                      
                      <p style="margin: 0 0 25px 0; color: #4A4A4A; font-size: 16px; line-height: 1.8;">
                        Our team is carefully reviewing your inquiry and will respond to you within <strong>24-48 hours</strong>. We are committed to providing you with thoughtful guidance and support on your spiritual journey.
                      </p>
                      
                      <!-- Message Summary Box -->
                      <div style="background-color: #F9F9F9; border: 1px solid #E5E5E5; border-radius: 6px; padding: 25px; margin: 30px 0;">
                        <p style="margin: 0 0 12px 0; color: #6B6B6B; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                          Your Message:
                        </p>
                        <p style="margin: 0; color: #2C2C2C; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">
${message}
                        </p>
                      </div>
                      
                      <p style="margin: 0 0 25px 0; color: #4A4A4A; font-size: 16px; line-height: 1.8;">
                        In the meantime, we invite you to explore our website to learn more about:
                      </p>
                      
                      <ul style="margin: 0 0 25px 0; padding-left: 20px; color: #4A4A4A; font-size: 16px; line-height: 1.8;">
                        <li style="margin-bottom: 10px;">The path to Universal Self-Consciousness</li>
                        <li style="margin-bottom: 10px;">Pranahuti Meditation practices</li>
                        <li style="margin-bottom: 10px;">Teachings from Self-realized Masters</li>
                        <li style="margin-bottom: 10px;">Our Quarterly Spiritual Magazine</li>
                      </ul>
                      
                      <div style="background-color: #FFF9D3; border-left: 4px solid #D4AF37; padding: 20px; margin: 30px 0;">
                        <p style="margin: 0; color: #3A2E12; font-size: 15px; line-height: 1.7; font-style: italic;">
                          "Oneness of mankind is not merely an intellectual understanding; it is organically integral to one's Consciousness."
                        </p>
                        <p style="margin: 10px 0 0 0; color: #6B6B6B; font-size: 14px; text-align: right;">
                          — Dr. Satyanarayana Chillapa (Swamiji)
                        </p>
                      </div>
                      
                      <p style="margin: 0 0 10px 0; color: #2C2C2C; font-size: 16px; line-height: 1.6;">
                        With profound blessings,
                      </p>
                      <p style="margin: 0; color: #2C2C2C; font-size: 16px; font-weight: 400;">
                        The IUSCM Team
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #2C2C2C; padding: 30px 40px; text-align: center;">
                      <p style="margin: 0 0 10px 0; color: #D4AF37; font-size: 14px; font-weight: 600;">
                        Institute of Universal Self-Consciousness Movement
                      </p>
                      <p style="margin: 0 0 15px 0; color: #CCCCCC; font-size: 13px; line-height: 1.6;">
                        Propagating the Oneness of Mankind through Universal Self-Consciousness
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        This is an automated confirmation. Please do not reply to this email.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
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
