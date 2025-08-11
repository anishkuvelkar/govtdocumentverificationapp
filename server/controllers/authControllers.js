const User = require('../models/User');
const { hashPassword, comparePassword } = require('../helpers/auth');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET
const Request = require('../models/Request');
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");
const multer = require("multer");
const { google } = require("googleapis");
const path = require("path");
const streamifier = require("streamifier");
const { UploadClient } = require('@uploadcare/upload-client');

const test = (req, res) => {
  res.json('test is working');
};

const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict"
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// Setup Uploadcare client
const uploadcare = new UploadClient({
  publicKey: process.env.UPLOADCARE_PUBLIC_KEY,
  secretKey: process.env.UPLOADCARE_SECRET_KEY,
});

const uploadToUploadcare = async (req, res) => {
  try {
    console.log("Upload route hit");
    console.log("req.file:", req.file);

    if (!req.file) {
      console.log("No file received");
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { buffer, originalname, mimetype } = req.file;
    console.log("Buffer type:", typeof buffer);
    console.log("Buffer length:", buffer ? buffer.length : "undefined");
    console.log("Originalname:", originalname);
    console.log("Mimetype:", mimetype);

    const result = await uploadcare.uploadFile(buffer, {
      fileName: originalname,
      contentType: mimetype,
    });

    console.log("Uploadcare upload success:", result.cdnUrl);
    res.status(200).json({ fileUrl: result.cdnUrl });
  } catch (error) {
    console.error("Uploadcare upload failed:", error);
    res.status(500).json({ message: "File upload failed" });
  }
};


const submitRequest = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      console.log("No auth token");
      return res.status(401).json({ error: "Authentication token missing" });
    }

    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, user) => {
      if (err) {
        console.log("JWT verify error:", err);
        return res.status(403).json({ error: "Invalid or expired token" });
      }

      const { documentUrl, comment } = req.body;
      console.log("Submit request payload:", { userId: user.userId, documentUrl, comment });

      if (!documentUrl || !comment) {
        return res.status(400).json({ error: "Missing documentUrl or comment" });
      }

      const request = new Request({
        userId: user.userId,
        documentUrl,
        comment,
        status: "Payment Received",
      });

      await request.save();
      console.log("Request saved:", request._id);

      res.status(201).json(request);
    });
  } catch (error) {
    console.error("Error submitting request:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: "Authentication token missing" });
    }

    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, user) => {
      if (err) {
        console.log("JWT verify error:", err);
        return res.status(403).json({ error: "Invalid or expired token" });
      }

      if (!user.userId) {
        return res.status(400).json({ error: "Invalid token payload: missing userId" });
      }

      const requests = await Request.find({ userId: user.userId });
      console.log(`Found ${requests.length} requests for user ${user.userId}`);

      res.json(requests);
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Server error" });
  }
};


const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validate name
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ errorType: 'NAME_REQUIRED', message: 'Please enter your name.' });
    }

    // Validate email presence
    if (!email || email.trim().length === 0) {
      return res.status(400).json({ errorType: 'EMAIL_REQUIRED', message: 'Email is required.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ errorType: 'EMAIL_INVALID', message: 'Email format is invalid.' });
    }

    // Validate password presence and length
    if (!password) {
      return res.status(400).json({ errorType: 'PASSWORD_REQUIRED', message: 'Password is required.' });
    } else if (password.length < 6) {
      return res.status(400).json({ errorType: 'PASSWORD_TOO_SHORT', message: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ errorType: 'EMAIL_EXISTS', message: 'This email is already registered.' });
    }

    // Hash the password before saving
    const hashedPassword = await hashPassword(password);

    // Create and save new user with hashed password
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ errorType: 'SERVER_ERROR', message: 'An unexpected server error occurred. Please try again later.' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || email.trim().length === 0) {
      return res.status(400).json({ errorType: 'EMAIL_REQUIRED', message: 'Email is required.' });
    }

    if (!password || password.trim().length === 0) {
      return res.status(400).json({ errorType: 'PASSWORD_REQUIRED', message: 'Password is required.' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ errorType: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
    }

    // Validate password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ errorType: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role,name: user.name },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set token as HTTP-only cookie
    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 60 * 60 * 1000, 
      })
      .status(200)
      .json({
        message: 'Login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ errorType: 'SERVER_ERROR', message: 'Server error. Please try again later.' });
  }
};

const getProfile = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json(null); 
    }
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      return res.json(user); 
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
// Get all requests with status "Payment Received"
const getAdmin1Requests = async (req, res) => {
  try {
    const requests = await Request.find({ status: "Payment Received" }).populate('userId', 'name email');
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve request
const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findByIdAndUpdate(id, { status: "Admin1 Approved", admin1Response: "" }, { new: true });
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject request with message
const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionMessage } = req.body;
    const request = await Request.findByIdAndUpdate(id, { status: "Rejected", admin1Response: rejectionMessage }, { new: true });
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// Fetch all requests approved by Admin1
const getAdmin2Requests = async (req, res) => {
  try {
    const requests = await Request.find({ status: "Admin1 Approved" });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};

// Approve request
const approveByAdmin2 = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });

    request.status = "Admin2 Approved";
    await request.save();

    res.json({ success: true, message: "Request approved by Admin2" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Reject request
const rejectByAdmin2 = async (req, res) => {
  try {
    const { message } = req.body;
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });

    request.status = "Rejected";
    request.admin1Response = message; // ✅ Override old message
    await request.save();

    res.json({ success: true, message: "Request rejected by Admin2" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { test, logoutUser, registerUser,loginUser,getProfile,submitRequest,getMyRequests,uploadToUploadcare,uploadcare,getAdmin1Requests,approveRequest,rejectRequest,getAdmin2Requests,approveByAdmin2,rejectByAdmin2};
