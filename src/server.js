import cors from 'cors';
import express from 'express';
import { connectToDB, db } from "./db.js";
import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const secretKey = process.env.SECRET_KEY; // Store the secret key in an environment variable
if (!secretKey) {
    throw new Error('SECRET_KEY is not defined in the environment variables');
}

// Function to encrypt data
const encryptData = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
};

// Function to decrypt data
const decryptData = (encryptedData) => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

const app = express();
app.use(cors({ origin: ['http://localhost:3000', 'https://codedpad-frontend.vercel.app'] }));
app.use(express.json());

app.post('/', (req, res) => {
    res.json("server is running successfully!");
});

// Create route
app.post('/create', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json('Code is required');
        }

        const existingData = await db.collection('ex').findOne({ code: code });
        if (existingData) {
            return res.json('code already exists');
        }

        await db.collection('ex').insertOne({ code: code });
        res.json('success');
    } catch (e) {
        console.error('Error in /create:', e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Open route
app.post('/Open', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json('Code is required');
        }

        const data = await db.collection('ex').findOne({ code: code });
        if (data) {

            const decryptedData = data.data ? decryptData(data.data) : null;
            return res.json({ success: true, code: code, data: decryptedData });
        } else {
            return res.json({ success: false, message: "code doesn't exist" });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json('Internal Server Error');
    }
});

// Get route
app.post('/Get', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json('Code is required');
        }

        
        const data = await db.collection('ex').findOne({ code: code });
        if (data) {
            const decryptedData = data.data ? decryptData(data.data) : null;
            return res.json({ code: code, data: decryptedData });
        } else {
            return res.json('No data available');
        }
    } catch (e) {
        console.log(e);
        res.status(500).json('Internal Server Error');
    }
});

app.post('/Delete', async(req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json('Code is required');
        }

        const result = await db.collection('ex').deleteOne({ code: code });
        if (result.deletedCount > 0) {
            return res.json({ message: 'Document deleted successfully' });
        } else {
            return res.json({ message: 'No document found with the provided code' });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json('Internal Server Error');
    }
});

// Update route
app.post('/update', async (req, res) => {
    try {
        const { code, data } = req.body;
        if (!code || !data) {
            return res.status(400).json({ message: 'Code and data are required' });
        }
        const encryptedData = encryptData(data);
        const result = await db.collection('ex').updateOne(
            { code: code },
            { $set: { data: encryptedData } },
            { upsert: true } // Optional: creates document if it doesn't exist
        );

        if (result.modifiedCount > 0 || result.upsertedCount > 0) {
            return res.json({ message: 'updated' });
        } else {
            return res.json({ message: 'No document found with the provided code' });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json('Internal Server Error');
    }
});



// Start the server
connectToDB(() => {
    app.listen(9000, () => {
        console.log("server running at 9000");
    });
});