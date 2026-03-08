import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { pool } from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // Use env var in production

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});
const upload = multer({ storage: storage });

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail", // or your email service
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASS || "your-app-password",
  },
});

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Send registration OTPs
router.post("/register-send-otp", async (req, res) => {
  const { email, phone } = req.body;

  if (!email || !phone) {
    return res.status(400).json({ error: "Email and phone required" });
  }

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1 OR phone = $2",
      [email, phone],
    );
    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User with this email or phone already exists" });
    }

    // Generate OTPs
    const phoneOtp = "1234"; // Hardcoded for phone
    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP for email

    // Store OTPs with email as key
    otpStore.set(email, { phoneOtp, emailOtp, phone, timestamp: Date.now() });

    // Send email OTP
    const mailOptions = {
      from: process.env.EMAIL_USER || "your-email@gmail.com",
      to: email,
      subject: "Road Cutting Permission System - Email Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Thank you for registering with the Road Cutting Permission System.</p>
          <p>Your verification code is:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
            ${emailOtp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "OTPs sent successfully" });
  } catch (err) {
    console.error("Error sending OTPs:", err);
    res.status(500).json({ error: "Failed to send OTPs" });
  }
});

// Verify registration OTPs and complete registration
router.post(
  "/register-verify-otp",
  upload.single("document"),
  async (req, res) => {
    const {
      email,
      phone,
      phoneOtp,
      emailOtp,
      username,
      password,
      name,
      designation,
      type,
      company_name,
      identification_type,
      identification_number,
      office_address,
      captcha_answer,
    } = req.body;

    // Simple captcha: 5 + 3 = 8
    if (parseInt(captcha_answer) !== 8) {
      return res.status(400).json({ error: "Incorrect captcha answer" });
    }

    if (
      !email ||
      !phone ||
      !phoneOtp ||
      !emailOtp ||
      !username ||
      !password ||
      !name ||
      !identification_type ||
      !identification_number
    ) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    try {
      // Check OTPs
      const storedData = otpStore.get(email);
      if (!storedData) {
        return res.status(400).json({ error: "OTP expired or not found" });
      }

      // Check if OTPs are expired (10 minutes)
      if (Date.now() - storedData.timestamp > 10 * 60 * 1000) {
        otpStore.delete(email);
        return res.status(400).json({ error: "OTP expired" });
      }

      if (
        storedData.phoneOtp !== phoneOtp ||
        storedData.emailOtp !== emailOtp
      ) {
        return res.status(400).json({ error: "Invalid OTPs" });
      }

      // Clear OTP after successful verification
      otpStore.delete(email);

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Document path
      const document_path = req.file ? req.file.path : null;

      // Insert user
      const result = await pool.query(
        `INSERT INTO users (username, password_hash, name, designation, type, company_name, identification_type, identification_number, office_address, email, phone, document_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, username, name, email`,
        [
          username,
          password_hash,
          name,
          designation,
          type,
          company_name,
          identification_type,
          identification_number,
          office_address,
          email,
          phone,
          document_path,
        ],
      );

      res
        .status(201)
        .json({ message: "Registration successful", user: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  },
);

// Register (keep for backward compatibility, but will be deprecated)
router.post("/register", upload.single("document"), async (req, res) => {
  const {
    username,
    password,
    name,
    designation,
    type,
    company_name,
    identification_type,
    identification_number,
    office_address,
    email,
    phone,
    captcha_answer,
  } = req.body;

  // Simple captcha: 5 + 3 = 8
  if (parseInt(captcha_answer) !== 8) {
    return res.status(400).json({ error: "Incorrect captcha answer" });
  }

  if (
    !username ||
    !password ||
    !name ||
    !identification_type ||
    !identification_number ||
    !email ||
    !phone
  ) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  // Validate identification number based on type
  const idValidation = validateIdentification(
    identification_type,
    identification_number,
  );
  if (!idValidation.valid) {
    return res.status(400).json({ error: idValidation.message });
  }

  try {
    // Check if user exists
    const existing = await pool.query(
      "SELECT id FROM users WHERE username = $1 OR email = $2 OR phone = $3",
      [username, email, phone],
    );
    if (existing.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Username, email, or phone already exists" });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Document path
    const document_path = req.file ? req.file.path : null;

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (username, password_hash, name, designation, type, company_name, identification_type, identification_number, office_address, email, phone, document_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, username, name, email`,
      [
        username,
        password_hash,
        name,
        designation,
        type,
        company_name,
        identification_type,
        identification_number,
        office_address,
        email,
        phone,
        document_path,
      ],
    );

    res.status(201).json({ message: "User registered", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "24h" });

    res.json({
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Check mobile and send OTP
router.post("/login-mobile", async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: "Phone number required" });
  }

  try {
    const result = await pool.query("SELECT id FROM users WHERE phone = $1", [
      phone,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No record found" });
    }

    // For now, hardcoded OTP 1234
    // Later implement actual SMS
    res.json({ message: "OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Verify OTP and login
router.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: "Phone and OTP required" });
  }

  if (otp !== "1234") {
    return res.status(401).json({ error: "Invalid OTP" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE phone = $1", [
      phone,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "24h" });

    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Middleware to verify JWT
export const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Validate identification number based on type
function validateIdentification(type, number) {
  switch (type) {
    case "aadhar":
      return /^\d{12}$/.test(number)
        ? { valid: true }
        : { valid: false, message: "Aadhar must be 12 digits" };
    case "pan":
      return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(number)
        ? { valid: true }
        : { valid: false, message: "Invalid PAN format" };
    case "cin":
      return /^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(number)
        ? { valid: true }
        : { valid: false, message: "Invalid CIN format" };
    case "gst":
      return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        number,
      )
        ? { valid: true }
        : { valid: false, message: "Invalid GST format" };
    case "tin":
      return /^\d{11}$/.test(number)
        ? { valid: true }
        : { valid: false, message: "TIN must be 11 digits" };
    default:
      return { valid: false, message: "Unknown identification type" };
  }
}

export default router;
