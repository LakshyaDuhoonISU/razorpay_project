import Business from '../models/Business.js';
import admin from '../firebase.js'; // Firebase Admin SDK initialization

export const registerBusiness = async (req, res) => {
    const { email, password, name, phone, address } = req.body;

    try {
        // Step 1: Create a new business in Firebase Authentication using email and password
        const userRecord = await admin.auth().createUser({
            email,
            password
        });

        // Step 2: Store business information in MongoDB
        const business = new Business({
            name,
            email,
            phone,
            address,
            firebaseUid: userRecord.uid // Store the Firebase UID
        });

        await business.save();

        // Respond with the created business data (excluding password)
        res.status(201).json({
            message: 'Business registered successfully',
            business: { name, email, phone, address }
        });
    } catch (error) {
        console.error('Error registering business:', error);
        res.status(500).json({ error: 'Error registering business' });
    }
};

export const loginBusiness = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Step 1: Authenticate with Firebase Authentication
        const userRecord = await admin.auth().getUserByEmail(email);
        
        // Verify password by using Firebase Authentication's signInWithEmailAndPassword method
        const firebaseUser = await admin.auth().signInWithEmailAndPassword(email, password);

        if (!firebaseUser) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Step 2: Retrieve the business details from MongoDB using the firebaseUid
        const business = await Business.findOne({ firebaseUid: userRecord.uid });

        if (!business) {
            return res.status(404).json({ error: 'Business not found' });
        }

        res.status(200).json({
            message: 'Business logged in successfully',
            business: {
                name: business.name,
                email: business.email,
                phone: business.phone,
                address: business.address,
            }
        });
    } catch (error) {
        console.error('Error logging in business:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
};

export const getBusinessProfile = async (req, res) => {
    try {
        const businessId = req.businessId; // Extracted from authMiddleware
        const business = await Business.findById(businessId).select('-password'); // Exclude password
        
        if (!business) {
            return res.status(404).send({ error: 'Business not found' });
        }
        
        res.status(200).send({ message: 'Business profile retrieved successfully', data: business });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};

// TODO: Implement register and login via google firebase

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