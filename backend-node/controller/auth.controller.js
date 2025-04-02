import { db } from "../lib/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const COOKIE_OPTIONS = {
    httpOnly: true, // Prevent JavaScript access to the cookie
    secure: true, // Use secure cookies in production
    sameSite: "None", // Prevent CSRF attacks
    maxAge: 24 * 60 * 60 * 1000 // 1 day
};

export const registerUser = async (req, res) => {
    console.log("Register request body:");
    
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.user.create({
        data: { username, email, password: hashedPassword }
    });

    if (!newUser) {
        return res.status(500).json({ message: "Failed to create user" });
    }

    // Generate access token
    const accessToken = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Send token in HTTP-only cookie
    res.cookie("token", accessToken , COOKIE_OPTIONS) ;
    console.log("Set-Cookie Header:", res.getHeaders()["set-cookie"]);

    res.status(201).json({ message: "User registered successfully" });
};

export const loginUser = async (req, res) => {



    console.log("Login request body:");

    
    
    const { email, password } = req.body;
    console.log("Login request body:", req.body);
    console.log("Login request email:", email);
    console.log("Login request password:", password);
    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Set HTTP-only cookie
    res.cookie("token", accessToken , COOKIE_OPTIONS);
    console.log("Set-Cookie Header:", res.getHeaders()["set-cookie"]);

    res.status(200).json({ message: "User logged in successfully" , loggeduser: user.username, });
};

export const logoutUser = async (req, res) => {
    res.clearCookie("token", COOKIE_OPTIONS);
    res.status(200).json({ message: "User logged out successfully" });
};
