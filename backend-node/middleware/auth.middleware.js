import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    
    const token = req.cookies.token; // Read token from cookies

    if (!token) {
        return res.status(403).json({ message: "Not authenticated" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token" });
        }
        req.userId = decoded.id;
        next();
    });
};
