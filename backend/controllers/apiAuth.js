const User = require("../Models/user.js");
const { signToken } = require("../utils/jwt.js");

module.exports = {
  // Register new user (customer by default; admin can specify staff roles)
  async register(req, res) {
    try {
      const { name, username, email, password, phone, role } = req.body;

      if (!name || !username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide name, username, email, and password.",
        });
      }

      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "An account with that email or username already exists.",
        });
      }

      // Only allow assigning staff roles if an authenticated admin is making the request
      let userRole = "customer";
      if (role && ["admin", "hotel_manager", "receptionist", "customer"].includes(role)) {
        if (req.user && req.user.role === "admin") {
          userRole = role;
        } else if (role !== "customer") {
          // If not admin, force customer
          userRole = "customer";
        }
      }

      const newUser = await User.create({
        name,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password,
        phone: phone || "",
        role: userRole,
      });

      const token = signToken(newUser);

      res.status(201).json({
        success: true,
        message: "User registered successfully.",
        token,
        user: newUser,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message || "Registration failed.",
      });
    }
  },

  // Login with username or email and password
  async login(req, res) {
    try {
      const { identifier, username, email, password } = req.body;
      const loginId = (identifier || username || email || "").toLowerCase().trim();

      if (!loginId || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide your email/username and password.",
        });
      }

      const user = await User.findOne({
        $or: [{ email: loginId }, { username: loginId }],
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials.",
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials.",
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: "Your account has been deactivated. Please contact an administrator.",
        });
      }

      const token = signToken(user);

      res.json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        token,
        user,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message || "Login failed.",
      });
    }
  },

  // Get currently logged-in user profile
  async getMe(req, res) {
    try {
      const user = await User.findById(req.user._id);
      res.json({
        success: true,
        user,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message || "Failed to fetch user.",
      });
    }
  },

  // List all users (admin only)
  async listUsers(req, res) {
    try {
      const users = await User.find().sort({ createdAt: -1 });
      res.json({
        success: true,
        count: users.length,
        users,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message || "Failed to fetch users.",
      });
    }
  },

  // Update user role or status (admin only)
  async updateUser(req, res) {
    try {
      const { role, isActive, name, phone } = req.body;
      const updates = {};
      if (role) updates.role = role;
      if (typeof isActive === "boolean") updates.isActive = isActive;
      if (name) updates.name = name;
      if (phone) updates.phone = phone;

      const user = await User.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }

      res.json({
        success: true,
        message: "User updated successfully.",
        user,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
