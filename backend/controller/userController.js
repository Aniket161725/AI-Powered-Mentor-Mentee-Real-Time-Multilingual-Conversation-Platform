import user from '../model/usermodel.js';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import dotenv from 'dotenv';
dotenv.config();

const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    try {
        // Check if user already exists
        const existingUser = await user.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new user({
            name,
            email,
            password: hashedPassword,
            role: role || 'Mentee', // Default to Mentee if no role is provided
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;


    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Find user by email
        const existingUser = await user.findOne({ email });



        if (!existingUser) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        console.log(isMatch);

        // Generate JWT token
        const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        console.log(token);

        // local storage
        res.status(200).json({ message: 'Login successful', token, user: existingUser , userId: existingUser._id , role: existingUser.role});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

const getUserProfile = async (req, res) => {
    const userId = req.user.id; // Assuming user ID is stored in req.user after authentication

    try {
        const userProfile = await user.findById(userId).select('-password'); // Exclude password from response
        if (!userProfile) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(userProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

const updateUserProfile = async (req, res) => {
    const userId = req.user.id; // Assuming user ID is stored in req.user after authentication
    const { name, email, role } = req.body;

    try {
        // Validate input
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Update user profile
        const updatedUser = await user.findByIdAndUpdate(userId, { name, email, role }, { new: true }).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

const updateUserDetails = async (req, res) => {
  const { userId,skills, language } = req.body;
  console.log("Received skills:", skills);
  console.log("Received language:", language);
  console.log("User ID:", userId);

  try {
    // Validate
    if (skills && !Array.isArray(skills)) {
      return res.status(400).json({ message: "Skills must be an array of strings" });
    }
    if (language && typeof language !== "string") {
      return res.status(400).json({ message: "Language must be a string" });
    }

    // Update user details
    const updatedUser = await user.findByIdAndUpdate(
      userId,
      {
        ...(skills && { skills }),     // overwrite skills
        ...(language && { language }), // set language
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User details updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getMentors = async (req,res) => {
  try {
    const mentors = await user.find({ role: "Mentor" });
    console.log("----------------------------------");
    console.log("All Mentors:", mentors);
    console.log("----------------------------------");
    return res.status(200).json(mentors);
    
  } catch (error) {
    console.error("Error fetching mentors:", error);
    throw error;
  }
};



export { getMentors ,registerUser, loginUser, getUserProfile, updateUserProfile ,updateUserDetails} ;