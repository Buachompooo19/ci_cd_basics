require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');

const app = express();
const updatedAt = new Date();

// Middleware for parsing JSON requests
app.use(express.json({
    verify: (req, res, buf, encoding) => {
        req.rawBody = buf.toString(encoding || 'utf-8');
    }
}));

// Function to verify GitHub Webhook signature
function verifySignature(req, res, buf) {
    const signature = req.headers['x-hub-signature-256']; // GitHub sends the signature here

    if (!signature) {
        console.log('❌ No signature found on request');
        return false;
    }

    console.log("🔍 Checking signature...");

    const hmac = crypto.createHmac('sha256', process.env.REPO_WEBHOOK_SECRET);
    const digest = 'sha256=' + hmac.update(buf).digest('hex');

    console.log("✅ Digest:", digest);
    console.log("✅ Received Signature:", signature);

    if (signature !== digest) {
        console.log('❌ Signature does not match');
        return false;
    }

    console.log('✅ Signature is valid');
    return true;
}

// Webhook endpoint
app.post('/cicd/github-cicd', (req, res) => {
    console.log("Webhook received!");
    const buf = JSON.stringify(req.body);
    const isValid = verifySignature(req, res, buf);
 
    if (!isValid) {
        return res.status(401).send('Invalid signature');
    }
 
    const { ref } = req.body;
    if (ref === 'refs/heads/main') {
        exec('git pull origin main && pm2 restart cicd_app');
    }
    res.sendStatus(200);
 });

// Test route to check server status
app.get('/cicd/time', (req, res) => {
    res.send(`<h1>${updatedAt}</h1>`);
});

// Start server
app.listen(5000, () => {
    console.log("🚀 Listening on Port 5000...");
});

app.get('/', (req, res) => {
    res.send('<h1>Server is Running 🚀</h1>');
});