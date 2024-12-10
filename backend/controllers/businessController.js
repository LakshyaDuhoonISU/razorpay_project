import Business from '../models/Business.js';
import admin from '../firebase.cjs'; // Firebase Admin SDK initialization

// Register a new business
export const registerBusiness = async (req, res) => {
    const { email, password, name, phone, address } = req.body;

    try {
        // Step 1: Check if the email or phone already exists in MongoDB
        const existingBusiness = await Business.findOne({ $or: [{ email }, { phone }] });
        if (existingBusiness) {
            return res.status(400).json({ error: 'Email or phone number already exists in MongoDB' });
        }

        let userRecord;

        try {
            // Step 2: Create a new user in Firebase Authentication using email and password
            userRecord = await admin.auth().createUser({
                email,
                password,
            });
        } catch (error) {
            if (error.code === 'auth/email-already-exists') {
                // Step 3: Fetch the Firebase user if it already exists
                userRecord = await admin.auth().getUserByEmail(email);

                // Check if the Firebase UID exists in MongoDB
                const firebaseBusiness = await Business.findOne({ firebaseUid: userRecord.uid });
                if (firebaseBusiness) {
                    return res.status(400).json({ error: 'Business already exists in both Firebase and MongoDB' });
                }

                // Step 4: If Firebase user exists but not in MongoDB, add the business to MongoDB
                const newBusiness = new Business({
                    name,
                    email,
                    phone,
                    address,
                    firebaseUid: userRecord.uid, // Store Firebase UID
                });

                await newBusiness.save();

                return res.status(201).json({
                    message: 'Business registered in MongoDB successfully (from existing Firebase account)',
                    business: { name, email, phone, address },
                });
            }

            // If another Firebase error occurs, throw it
            throw error;
        }

        // Step 5: Store the new business in MongoDB after successful Firebase creation
        const business = new Business({
            name,
            email,
            phone,
            address,
            firebaseUid: userRecord.uid, // Store Firebase UID
        });

        await business.save();

        res.status(201).json({
            message: 'Business registered successfully',
            business: { name, email, phone, address },
        });
    } catch (error) {
        console.error('Error registering business:', error);
        res.status(500).json({ error: 'Error registering business' });
    }
};

// Login a business
export const loginBusiness = async (req, res) => {
    const { idToken } = req.body;  // Expecting ID token from the client

    console.log("Received ID Token:", idToken);  // Log the token to check it

    try {
        // Verify the ID token received from the client
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        const firebaseUid = decodedToken.uid;

        const business = await Business.findOne({ firebaseUid });

        if (!business) {
            return res.status(404).json({ error: 'Business not found' });
        }

        res.status(200).json({
            message: 'Login successful',
            token: idToken,
            business: {
                name: business.name,
                email: business.email,
                phone: business.phone,
                address: business.address
            }
        });

    } catch (error) {
        console.error('Error logging in business:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
};


// Get the profile of the authenticated business
export const getBusinessProfile = async (req, res) => {
    try {
        const firebaseUid = req.firebaseUid; // Extracted from authMiddleware

        // Find the business by firebaseUid
        const business = await Business.findOne({ firebaseUid }).select('-__v');

        if (!business) {
            return res.status(404).send({ error: 'Business not found' });
        }

        res.status(200).send({ message: 'Business profile retrieved successfully', data: business });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
};

// import Business from "../models/Business.js";
// import { SECRET_KEY } from "../constants.js";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";

// export const registerBusiness = async (req, res) => {
//     try {
//         const { name, email, phone, address, password } = req.body;

//         const existingBusiness = await Business.findOne({ email });
//         if (existingBusiness) {
//             return res.status(400).send({ error: 'Email is already registered' });
//         }

//         // Encrypt password
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         await Business.create({ name, email, phone, address, password: hashedPassword });
//         res.status(201).send({ message: 'Business registered successfully' });
//     } catch (err) {
//         res.status(500).send({ error: err.message });
//     }
// };

// export const loginBusiness = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         const business = await Business.findOne({ email });
//         if (!business) {
//             return res.status(400).send({ error: 'Invalid email or password' });
//         }

//         const isMatch = await bcrypt.compare(password, business.password);
//         if (!isMatch) {
//             return res.status(400).send({ error: 'Invalid email or password' });
//         }

//         // Generate JWT token
//         const token = jwt.sign({ id: business._id, email: business.email }, SECRET_KEY, {
//             expiresIn: '1d',
//         });

//         res.status(200).send({ token, message: 'Login successful' });
//     } catch (err) {
//         res.status(500).send({ error: err.message });
//     }
// };