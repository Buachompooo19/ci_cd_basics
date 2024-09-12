const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const app = express();

const updatedAt = new Date();

app.use(bodyParser.json());

app.post('/cicd/github-cicd', (req, res) => {
	const { ref } = req.body;
	console.log(req.body);
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
