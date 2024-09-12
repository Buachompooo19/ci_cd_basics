require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const app = express();

const updatedAt = new Date();

function verifySignature(req, res, buf, encoding) {
    const signature = req.headers['x-hub-signature-256']; // GitHub sends the signature here

    if (!signature) {
        console.log('No signature found on request');
        return false;
    }

    const hmac = crypto.createHmac('sha256', process.env.REPO_WEBHOOK_SECRET);
    const digest = 'sha256=' + hmac.update(buf).digest('hex');

    if (signature !== digest) {
        console.log('Signature does not match');
        return false;
    }

    console.log('Signature is valid');
    return true;
}

app.use(bodyParser.json());

app.post('/cicd/github-cicd', (req, res) => {
	const buf = JSON.stringify(req.body); // The raw body of the request
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

app.get('/cicd/time', (req, res) => {
	res.send(`<h1>${updatedAt}</h1>`);
});

app.listen(5000, () => {
	console.log("Listening on Port 5000...");
});
