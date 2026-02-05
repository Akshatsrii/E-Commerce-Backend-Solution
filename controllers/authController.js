const User = require('../models/User');
const bcrypt = require('bcryptjs');



// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      req.session.error = "Please fill all fields";
      return res.redirect("/register");
    }

    if (password !== confirmPassword) {
      req.session.error = "Passwords do not match";
      return res.redirect("/register");
    }

    if (password.length < 6) {
      req.session.error = "Password must be at least 6 characters";
      return res.redirect("/register");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      req.session.error = "User already exists";
      return res.redirect("/register");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword
    });

    req.session.success = "Registration successful. Please login.";
    res.redirect("/login");

  } catch (error) {
    console.log(error);
    req.session.error = "Error registering user";
    res.redirect("/register");
  }
};



// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.session.error = "Please provide email and password";
      return res.redirect("/login");
    }

    const user = await User.findOne({ email });

    if (!user) {
      req.session.error = "Invalid credentials";
      return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      req.session.error = "Invalid credentials";
      return res.redirect("/login");
    }

    // Save safe data in session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.session.success = "Login successful";
    res.redirect("/");

  } catch (error) {
    console.log(error);
    req.session.error = "Error logging in";
    res.redirect("/login");
  }
};



// ================= LOGOUT =================
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};



// ================= CURRENT USER =================
exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const user = await User.findById(req.session.user.id).select("-password");

    res.json({
      success: true,
      user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user"
    });
  }
};
