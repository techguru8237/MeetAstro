const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

const User = require('../models/user');
const Session = require('../models/session');
const { authenticate } = require('../middleware/authenticate');
const { csrfCheck } = require('../middleware/csrfCheck');
const { initSession, isEmail } = require('../utils/utils');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email format
    if (!isEmail(email)) {
      throw new Error('Email must be a valid email address.');
    }
    // Validate password type
    if (typeof password !== 'string') {
      throw new Error('Password must be a string.');
    }

    // Check if the user already exists
    const existUser = await User.findOne({ email: email });
    if (existUser) {
      return res.status(400).json({
        errors: [
          {
            title: 'Registration Error',
            detail: 'Email is already registered.',
          },
        ],
      });
    }

    // Create a new user
    const user = new User({ email, password });
    const persistedUser = await user.save();

    const userId = persistedUser._id;
    const session = await initSession(userId);

    res.json({
      title: 'User Registration Successful',
      detail: 'Successfully registered new user',
      csrfToken: session.csrfToken,
    });
  } catch (err) {
    res.status(400).json({
      errors: [
        {
          title: 'Registration Error',
          detail: err.message,
        },
      ],
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        errors: [
          {
            title: 'Validation Error',
            detail: 'Email and password are required.',
          },
        ],
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        errors: [
          {
            title: 'Login Error',
            detail: 'Invalid email or password.',
          },
        ],
      });
    }

    // Compare the password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        errors: [
          {
            title: 'Login Error',
            detail: 'Invalid email or password.',
          },
        ],
      });
    }

    // Successful login
    res.status(200).json({
      message: 'Login Successful',
      detail: 'Welcome back!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({
      errors: [
        { title: 'Server Error', detail: 'An unexpected error occurred.' },
      ],
    });
  }
});

// Configure your email transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // or another email service
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).send('User not found');
  // Generate a password reset token
  const token = crypto.randomBytes(20).toString('hex');

  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  pass = 'vhkmsyyyyafbzajc';

  // Send email with the reset link
  const resetUrl = `http://localhost:5173/auth/reset-password/${token}`;
  await transporter.sendMail({
    to: email,
    subject: 'Password Reset',
    html: `Click this link to reset your password: <a href="${resetUrl}">${resetUrl}</a>`,
  });

  res.send('Password reset link sent to your email');
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) return res.status(400).send('Invalid or expired token');

  user.password = password; // Make sure to hash this password
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.send('Password has been reset');
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const { userId } = req.session;
    const user = await User.findById({ _id: userId }, { email: 1, _id: 0 });

    res.json({
      title: 'Authentication successful',
      detail: 'Successfully authenticated user',
      user,
    });
  } catch (err) {
    res.status(401).json({
      errors: [
        {
          title: 'Unauthorized',
          detail: 'Not authorized to access this route',
          errorMessage: err.message,
        },
      ],
    });
  }
});

router.delete('/me', authenticate, csrfCheck, async (req, res) => {
  try {
    const { userId } = req.session;
    const { password } = req.body;
    if (typeof password !== 'string') {
      throw new Error();
    }
    const user = await User.findById({ _id: userId });

    const passwordValidated = await bcrypt.compare(password, user.password);
    if (!passwordValidated) {
      throw new Error();
    }

    await Session.expireAllTokensForUser(userId);
    res.clearCookie('token');
    await User.findByIdAndDelete({ _id: userId });
    res.json({
      title: 'Account Deleted',
      detail: 'Account with credentials provided has been successfuly deleted',
    });
  } catch (err) {
    res.status(401).json({
      errors: [
        {
          title: 'Invalid Credentials',
          detail: 'Check email and password combination',
          errorMessage: err.message,
        },
      ],
    });
  }
});

router.put('/logout', authenticate, csrfCheck, async (req, res) => {
  try {
    const { session } = req;
    await session.expireToken(session.token);
    res.clearCookie('token');

    res.json({
      title: 'Logout Successful',
      detail: 'Successfuly expired login session',
    });
  } catch (err) {
    res.status(400).json({
      errors: [
        {
          title: 'Logout Failed',
          detail: 'Something went wrong during the logout process.',
          errorMessage: err.message,
        },
      ],
    });
  }
});

router.post('/create', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        errors: [
          {
            title: 'Validation Error',
            detail: 'Email and password are required.',
          },
        ],
      });
    }

    // // Check if user already exists
    const existingUser = await User.findOne({email: req.body.email});

    if (existingUser) {
      return res.status(400).json({
        errors: [
          {
            title: 'Registration Error',
            detail: 'Email is already registered.',
          },
        ],
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ ...req.body, password: hashedPassword });
    const savedUser = await user.save();

    res.status(201).json({
      title: 'User Created',
      detail: 'User added successfully!',
      user: savedUser,
    });
  } catch (err) {
    res.status(500).json({
      errors: [
        { title: 'Server Error', detail: 'An unexpected error occurred.' },
      ],
    });
  }
});

// Update User
router.put('/update/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        errors: [
          {
            title: 'Validation Error',
            detail: 'Email and password are required.',
          },
        ],
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { ...req.body, password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        errors: [{ title: 'Not Found', detail: 'User not found.' }],
      });
    }

    res.json({
      title: 'User Updated',
      detail: 'User updated successfully!',
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      errors: [
        { title: 'Server Error', detail: 'An unexpected error occurred.' },
      ],
    });
  }
});

// Get All Users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({
      errors: [
        { title: 'Server Error', detail: 'An unexpected error occurred.' },
      ],
    });
  }
});

// Get User by ID
router.get('/one', authenticate, async (req, res) => {
  try {
    const userId = req.query.id;
    const user = await User.findById(userId, { password: 0 }); // Exclude password from response

    if (!user) {
      return res.status(404).json({
        errors: [{ title: 'Not Found', detail: 'User not found.' }],
      });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({
      errors: [
        { title: 'Server Error', detail: 'An unexpected error occurred.' },
      ],
    });
  }
});

// Delete User
router.delete('/delete/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        errors: [{ title: 'Not Found', detail: 'User not found.' }],
      });
    }

    res.json({
      title: 'User Deleted',
      detail: 'User deleted successfully!',
    });
  } catch (err) {
    res.status(500).json({
      errors: [
        { title: 'Server Error', detail: 'An unexpected error occurred.' },
      ],
    });
  }
});

module.exports = router;
