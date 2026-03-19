import bcrypt from 'bcrypt';
import User from '../models/User.js';

const toUserResponse = (user) => ({
  userId: user._id,
  username: user.username,
  email: user.email,
  creationDate: user.creationDate ?? user.createdAt
});

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const normalizedUsername = typeof username === 'string' ? username.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedUsername || !normalizedEmail || typeof password !== 'string') {
      return res.status(400).json({
        message: 'Username, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long'
      });
    }

    const usernameExists = await User.findOne({ username: normalizedUsername });
    if (usernameExists) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const emailExists = await User.findOne({ email: normalizedEmail });
    if (emailExists) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      hashedPassword
    });

    return res.status(201).json({
      message: 'Registration successful',
      user: toUserResponse(user)
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error during registration',
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, usernameOrEmail, username, email, password } = req.body;
    const submittedIdentifier =
      typeof identifier === 'string'
        ? identifier.trim()
        : typeof usernameOrEmail === 'string'
          ? usernameOrEmail.trim()
          : typeof username === 'string'
            ? username.trim()
            : typeof email === 'string'
              ? email.trim()
              : '';

    if (!submittedIdentifier || typeof password !== 'string') {
      return res.status(400).json({
        message: 'Username or email and password are required'
      });
    }

    const user = await User.findOne({
      $or: [
        { username: submittedIdentifier },
        { email: submittedIdentifier.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const storedPasswordHash = user.hashedPassword || user.passwordHash;
    const matches = storedPasswordHash
      ? await bcrypt.compare(password, storedPasswordHash)
      : false;

    if (!matches) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    req.session.userId = user._id.toString();
    req.session.loginTimestamp = new Date().toISOString();

    return res.status(200).json({
      message: 'Login successful',
      user: toUserResponse(user)
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error during login',
      error: error.message
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select(
      '-hashedPassword -passwordHash'
    );

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    return res.status(200).json({
      user: toUserResponse(user)
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error while loading profile',
      error: error.message
    });
  }
};

export const logout = async (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        message: 'Logout failed'
      });
    }

    res.clearCookie('securedocs.sid', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    });

    return res.status(200).json({
      message: 'Logout successful'
    });
  });
};