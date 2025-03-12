import cors from 'cors';
import express from 'express';
import { connectToDB, db } from "./db.js";

const app = express()
app.use(cors())
app.use(express.json())

app.post('/', (req, res) => {
    res.json("server is running successfully!");
})

app.post('/create', async (req, res) => {
    try {
        const { code } = req.body; 
        if (!code) {
            return res.status(400).json('Code is required');
        }

        const existingData = await db.collection('ex').findOne({ code });
        if (existingData) {
            return res.json('code already exists'); 
        }
        
        await db.collection('ex').insertOne({ code });
        res.json('success');
    } catch (e) {
        console.error('Error in /create:', e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/Open', async (req, res) => {
    try {
        const code = req.body.code;
        const data = await db.collection('ex').findOne({ code: code });
        if (data) {
            return res.json({success : true ,  data});
        } else {
            return res.json({ success : false , message : 'code doesn\'t exist'});    
        }
    } catch (e) {
        console.log(e);
        res.status(500).json('Internal Server Error');
    }
})

app.post('/Get', async (req, res) => {
    try {
        const code = req.body.code;
        const data = await db.collection('ex').findOne({ code: code });
        if (data.data) {
            return res.json(data);
        } else {
            return res.json('No data available');    
        }
    } catch (e) {
        console.log(e);
        res.status(500).json('Internal Server Error');
    }
})

app.post('/update', async (req, res) => {
    try {
        const code = req.body.code;
        if (!req.body.data) {
            return res.status(400).json({ message: 'Invalid input data' });
        }
        
        const result = await db.collection('ex').updateOne({ code: code }, { $set: { data: req.body.data } });
        if (result.modifiedCount > 0) {
            return res.json({message : 'updated'});
        } else {
            return res.json({message : 'No document found with the provided code'});    
        }
    } catch (e) {
        console.log(e);
        res.status(500).json('Internal Server Error');
    }
})


connectToDB(() => {
    app.listen(9000, () => {
        console.log("server running at 9000");
    })
})