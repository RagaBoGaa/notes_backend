import User from '../models/User.js';
import generateToken, { setTokenCookie } from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
export const registerUser = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: `name, email, password are required`,
    });
  }

  const { name, email, password, username } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'All fields are required',
    });
  }

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: 'User already exists',
      });
    }

    // Check if username exists if provided
    if (username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({
          status: false,
          code: 400,
          message: 'Username already taken',
        });
      }
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      username: username || undefined, // Only set if provided
    });

    if (user) {
      // Set token in cookie
      const token = setTokenCookie(res, user._id);

      res.status(201).json({
        status: true,
        code: 201,
        message: 'User registered successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          token: token,
        },
      });
    } else {
      res.status(400).json({
        status: false,
        code: 400,
        message: 'Invalid user data',
      });
    }
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).json({
      status: false,
      code: 500,
      message: 'Internal server error',
    });
  }
};

// @desc    Login user & get token
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      // Set token in cookie
      const token = setTokenCookie(res, user._id);

      res.status(200).json({
        status: true,
        code: 200,
        message: 'Login successful',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          token: token,
        },
      });
    } else {
      res.status(401).json({
        status: false,
        code: 401,
        message: 'Invalid email or password',
      });
    }
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({
      status: false,
      code: 500,
      message: 'Internal server error',
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
      res.status(200).json({
        status: true,
        code: 200,
        message: 'User profile retrieved successfully',
        data: user,
      });
    } else {
      res.status(404).json({
        status: false,
        code: 404,
        message: 'User not found',
      });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      status: false,
      code: 500,
      message: 'Internal server error',
    });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Private
export const logoutUser = async (req, res) => {
  try {
    // Clear the Token cookie
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      status: true,
      code: 200,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Error logging out user:', error);
    res.status(500).json({
      status: false,
      code: 500,
      message: 'Internal server error',
    });
  }
};
