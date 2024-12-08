import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../constants.js";

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader) {
            return res.status(401).send({ error: "Authentication token missing" });
        }

        const token = authHeader.replace("Bearer ", "");
        const decoded = jwt.verify(token, SECRET_KEY);
        req.businessId = decoded.id;
        next();
    } catch (err) {
        console.error(err);
        res.status(401).send({ error: "Authentication Error: Invalid or expired token" });
    }
};

export default authMiddleware;