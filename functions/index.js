const { onRequest } = require("firebase-functions/v2/https");
const nodemailer = require("nodemailer");
const querystring = require("querystring");

// Load environment variables from .env file (recommended approach)
require("dotenv").config();

const SCRIPT_SECRET = process.env.APPSCRIPT_SECRET;

const smtpConfig = {
  user: process.env.SMTP_USER,
  password: process.env.SMTP_PASSWORD,
  user1: process.env.SMTP_USER2,
  password1: process.env.SMTP_PASSWORD2,
};

// SMTP Configuration
// Office365 SMTP - Using credentials from Firebase environment config
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: smtpConfig.user,
    pass: smtpConfig.password,
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2",
  },
  authMethod: "LOGIN",
  debug: true,
  logger: true,
});

const transporterInfoMail = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: smtpConfig.user1,
    pass: smtpConfig.password1,
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
exports.sendEmail = onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).send("");
  }

  try {
    const {name, email} = req.body;

    console.log("Subscription data received:", {name, email});

    if (!name || !email) {
      return res
          .status(400)
          .json({success: false, error: "Missing name or email"});
    }

    // First, try to add subscriber to Google Sheet
    const GoogleSheetUrl = `https://script.google.com/macros/s/${SCRIPT_SECRET}/exec`;
    const action = "add";

    let sheetResponse;
    try {
      sheetResponse = await fetch(GoogleSheetUrl, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({name, email, action}),
      });
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      return res.status(500).json({success: false, error: "Failed to connect to subscription service"});
    }

    let sheetData;
    try {
      const responseText = await sheetResponse.text();
      console.log("Sheet response text:", responseText);

      // Check if response is HTML (error page)
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        console.error("Google Apps Script returned HTML error page");
        return res.status(500).json({success: false, error: "Subscription service temporarily unavailable"});
      }

      sheetData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return res.status(500).json({success: false, error: "Invalid response from subscription service"});
    }

    console.log("Google Sheet response:", sheetData);

    // Check if email already exists
    if (sheetData.result === "duplicate") {
      return res.status(400).json({
        success: false,
        error: "This email is already subscribed to our magazine",
      });
    }

    // If not duplicate, proceed with sending emails
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
                    <td style="background-color: #C9A961; padding: 40px 30px; text-align: center;">
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
                        In each edition, you will receive the following:
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

              <a href="https://us-central1-iuscm-e6a1f.cloudfunctions.net/unsubscribeUser?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}" 
   style="color:#FFFFFF; padding: 10px 20px; border-radius: 5px; font-size: 13px; font-weight: 600; background: none; border: none; cursor: pointer; text-decoration: none;">
   Unsubscribe
</a>
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
    // https://us-central1-iuscm-e6a1f.cloudfunctions.net/unsubscribeUser
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
    return res.status(500).json({success: false, error: error.message});
  }
});

// Cloud Function to add subscriber email and name to googleSheet
// exports.addSubscriber = functions.https.onRequest(async (req, res) => {
//     const GoogleSheetUrl = `https://script.google.com/macros/s/${SCRIPT_SECRET}/exec`;

//   // Allow only POST
//   if (req.method !== "POST") {
//     return res.status(400).send("POST only");
//   }

//   // Enable CORS
//   res.set("Access-Control-Allow-Origin", "*");

//   if (req.method === "OPTIONS") {
//     res.set("Access-Control-Allow-Headers", "Content-Type");
//     return res.status(204).send("");
//   }

//   const {name, email} = req.body;
//   if (!name || !email) {
//     return res.status(400).json({success: false, message: "Missing name or email"});
//   }

//   try {
//     // Apps Script Web App URL

//     // Call Google Apps Script
//     const action = "add";
//     const response = await fetch(GoogleSheetUrl, {
//       method: "POST",
//       headers: {"Content-Type": "application/json"},
//       body: JSON.stringify({name, email, action}),
//     });

//     const data = await response.json();

//     res.json(data);
//   } catch (err) {
//     res.set("Access-Control-Allow-Origin", "*");
//     res.status(500).json({success: false, error: err.message});
//   }
// });


// // Cloud Function to Remove subscriber email and name from googleSheet
// exports.unsubscribeUser = functions.https.onRequest(async (req, res) => {
//   const GoogleSheetUrl = "https://script.google.com/macros/s/AKfycbxhctHCC2x0BX-73aVycdDtBOc7XctMO5FKUDj_v2cKxa-SGxQmb6nqcX0Z90WAz8_N/exec";
//   const {email, name} = req.query;
//   if (!email) return res.status(400).send("Missing email");

//   try {
//     // Call Google Apps Script with ?email=

//     const action = "remove";
//     const response = await fetch(GoogleSheetUrl, {
//       method: "POST",
//       headers: {"Content-Type": "application/json"},
//       body: JSON.stringify({email, action}),
//     });
//     const data = await response.json();

//     const adminMailOptions = {
//       from: "spiritualmagazine@iuscm.org", // Change this to match your SMTP user
//       to: "spiritualmagazine@iuscm.org",
//       subject: `User Unsubscribed - ${name || "Unknown"}`,
//       text: `A user has unsubscribed from the IUSCM mailing list.\n\nDetails:\n\nName: ${name || "Not provided"}`,
//     };
//     // Confirmation email to user
//     const userMailOptions = {
//       from: "spiritualmagazine@iuscm.org",
//       to: email,
//       subject: "We've Received Your Message - IUSCM",
//       html: `
//        <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
// </head>
// <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f0;">
//   <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f0; padding: 40px 20px;">
//     <tr>
//       <td align="center">
//         <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

//           <!-- Header with Red Accent -->
//           <tr>
//             <td style="background: linear-gradient(135deg, #D4AF37 0%, #C9A961 100%); padding: 40px 30px; text-align: center;">
//               <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: 0.5px;">
//                 Institute of Universal Self-Consciousness Movement
//               </h1>
//             </td>
//           </tr>

//           <!-- Main Content -->
//           <tr>
//             <td style="padding: 50px 40px;">
//               <p style="margin: 0 0 20px 0; color: #2C2C2C; font-size: 18px; line-height: 1.6;">
//                 Dear <strong>${name}</strong>,
//               </p>

//               <p style="margin: 0 0 25px 0; color: #4A4A4A; font-size: 16px; line-height: 1.8;">
//                 You have successfully unsubscribed from our <strong>Quarterly Spiritual Magazine</strong> mailing list. We're sorry to see you go!
//               </p>

//               <p style="margin: 0 0 25px 0; color: #4A4A4A; font-size: 16px; line-height: 1.8;">
//                 If this was a mistake or you wish to re-subscribe in the future, you can always join our community again.
//               </p>

//               <p style="margin: 0 0 30px 0; color: #2C2C2C; font-size: 16px; line-height: 1.6;">
//                 Thank you for being part of our journey toward Universal Self-Consciousness.
//               </p>

//               <p style="margin: 0 0 10px 0; color: #2C2C2C; font-size: 16px;">
//                 With best regards,
//               </p>
//               <p style="margin: 0; color: #2C2C2C; font-size: 16px; font-weight: 400;">
//                 The IUSCM Team
//               </p>
//             </td>
//           </tr>

//           <!-- Footer -->
//           <tr>
//             <td style="background-color: #2C2C2C; padding: 30px 40px; text-align: center;">
//               <p style="margin: 0 0 10px 0; color: #D4AF37; font-weight: 600; font-size: 14px;">
//                 Institute of Universal Self-Consciousness Movement
//               </p>
//               <p style="margin: 0; color: #CCCCCC; font-size: 13px; line-height: 1.6;">
//                 Propagating the Oneness of Mankind through Universal Self-Consciousness
//               </p>
//               <p style="margin: 10px 0 0 0; color: #FFFFFF; font-size: 13px;">
//                 If you change your mind, you can always <a href="https://iuscm.org/index.html#magazine" style="color: #D4AF37; font-weight: bold;">Subscribe again</a>.
//               </p>
//             </td>
//           </tr>

//         </table>
//       </td>
//     </tr>
//   </table>
// </body>
// </html>

//       `,
//     };

//     // Return a simple confirmation HTML page
//     res.set("Access-Control-Allow-Origin", "*");
//     res.status(200).send(`
//       <html>
//         <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f0;">
//           <div style="background-color: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: inline-block;">
//             <h2 style="color: ${data.success ? "#2E8B57" : "#B22222"};">
//               ${data.message}
//             </h2>
//             <p style="color: #555;">
//               ${data.success ?
//                 "You have been successfully unsubscribed from our mailing list." :
//                 "Please contact support if you believe this is an error."}
//             </p>
//           </div>
//         </body>
//       </html>
//     `);
//     // Send both emails
//     await Promise.all([
//       transporter.sendMail(adminMailOptions),
//       transporter.sendMail(userMailOptions),
//     ]);
//   } catch (err) {
//     console.error("Unsubscribe error:", err);
//     res.status(500).send(`
//       <html>
//         <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
//           <h2>Oops! Something went wrong.</h2>
//           <p>${err.message}</p>
//         </body>
//       </html>
//     `);
//   }
// });


exports.unsubscribeUser = onRequest(async (req, res) => {
  console.log("Unsubscribe function called with method:", req.method);
  console.log("Request body:", req.body);
  console.log("Request query:", req.query);
  
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");

  console.log(" * & && & & & &  unsubscribeUser : ");
  console.log("Method:", req.method);
  console.log("Body:", req.body);
  console.log("Headers:", req.headers);

  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "GET, POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).send("");
  }

  let email; let name;
  if (req.method === "POST") {
    let body;
    if (typeof req.body === "object" && req.body !== null) {
      // Already parsed (e.g., in emulator)
      body = req.body;
    } else {
      // Raw string or Buffer
      let bodyString = req.body;
      if (Buffer.isBuffer(bodyString)) {
        bodyString = bodyString.toString();
      }
      body = querystring.parse(bodyString);
    }
    ({email, name} = body);
    console.log("Parsed body:", body);
    console.log("Email:", email, "Name:", name);
  } else {
    email = req.query.email;
    name = req.query.name;
  }

  if (!email) {
    return res.status(400).send("Email required");
  }
  // First, try to add subscriber to Google Sheet
  const GoogleSheetUrl = `https://script.google.com/macros/s/${SCRIPT_SECRET}/exec`;

  const action = "remove";
  let sheetResponse;
  try {
    sheetResponse = await fetch(GoogleSheetUrl, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({name, email, action}),
    });
  } catch (fetchError) {
    console.error("Unsubscribe fetch error:", fetchError);
    return res.status(500).send("Failed to connect to subscription service");
  }

  let sheetData;
  try {
    const responseText = await sheetResponse.text();
    console.log("Unsubscribe sheet response text:", responseText);

    // Check if response is HTML (error page)
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      console.error("Google Apps Script returned HTML error page for unsubscribe");
      return res.status(500).send("Subscription service temporarily unavailable");
    }

    sheetData = JSON.parse(responseText);
  } catch (parseError) {
    console.error("Unsubscribe JSON parse error:", parseError);
    return res.status(500).send("Invalid response from subscription service");
  }

  // Check if email already exists
  if (sheetData.result === "not_found") {
    console.log("User not found in mailing list:", email);
    res.set('Content-Type', 'text/html');
    return res.status(200).send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; background-color: #f8f8f8; padding: 60px;">
              <div style="background: #fff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: inline-block;">
                <h2 style="color: #C9A961;">Already Unsubscribed${name ? `, ${name}` : ""}</h2>
                <p style="color: #555; font-size: 16px; margin-top: 15px;">
                  <strong>${email}</strong> has already been removed from our mailing list.<br>
                  No further action is needed.
                </p>
                <p style="color: #888; font-size: 14px; margin-top: 30px;">
                  If you’d like to rejoin, please re-subscribe on our official website.
                </p>
              </div>
            </body>
          </html>
  `);
  }

  console.log("Successfully unsubscribed:", email);
  res.set('Content-Type', 'text/html');
  res.status(200).send(`
    <html>
      <body style="font-family: Arial, sans-serif; text-align: center; background-color: #f8f8f8; padding: 60px;">
        <div style="background: #fff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: inline-block;">
          <h2 style="color: #333;">You’ve been unsubscribed${name ? `, ${name}` : ""}.</h2>
          <p style="color: #555; font-size: 16px; margin-top: 15px;">
            We’ve removed <strong>${email}</strong> from our mailing list.<br>
            You won’t receive further emails from us.
          </p>
          <p style="color: #888; font-size: 14px; margin-top: 30px;">
            If this was a mistake, you can re-subscribe anytime on our website.
          </p>
        </div>
      </body>
    </html>
  `);
});


// Cloud Function for Contact Form
exports.sendContactEmail = onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).send("");
  }

  try {
    const {name, email, message} = req.body;

    console.log("Contact form data received:", {name, email, message});

    if (!name || !email || !message) {
      return res
          .status(400)
          .json({success: false, error: "Missing required fields"});
    }

    // Email to admin (usaiuscm@gmail.com)
    const adminMailOptions = {
      from: "info@iuscm.org", // Change this to match your SMTP user
      to: "spiritualmagazine@iuscm.org",
      subject: `New Contact Form Submission from ${name}`,
      text: `You have received a new message from the IUSCM website contact form:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nYou can reply directly to: ${email}`,
    };

    // Confirmation email to user
    const userMailOptions = {
      from: "info@iuscm.org",
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
                    <td style="background-color: #C9A961; padding: 40px 30px; text-align: center;">
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
      transporterInfoMail.sendMail(adminMailOptions),
      transporterInfoMail.sendMail(userMailOptions),
    ]);

    return res.status(200).json({
      success: true,
      message: "Message sent successfully! We'll get back to you soon.",
    });
  } catch (error) {
    console.error("Error sending contact email:", error.message);
    return res.status(500).json({success: false, error: error.message});
  }
});
