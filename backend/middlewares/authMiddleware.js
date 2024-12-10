import admin from "../firebase.cjs"; // Firebase Admin SDK

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).send({ error: "Authentication token missing" });
        }

        const token = authHeader.replace("Bearer ", "");

        // Verify the Firebase token
        const decoded = await admin.auth().verifyIdToken(token);

        // Attach the Firebase UID to the request
        req.firebaseUid = decoded.uid;

        next();
    } catch (err) {
        console.error(err);
        res.status(401).send({ error: "Authentication Error: Invalid or expired token" });
    }
};

export default authMiddleware;
