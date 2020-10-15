const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const scheduler = require('./course_scheduler.js')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {extended: true} ));

app.get('/', (req, res) => {
	res.render('index', {
		title: "NU Schedule Creator",
	})
});

app.post("/build", (req, res) => {
	if (req.body.courses.length > 20) {
		block(req, res, "You cannot create a schedule that has more than 20 courses.");
		return;
	}
	if (req.body.year.length != 4) {
		block(req, res, "Invalid format.");
		return;
	}
	if (req.body.semester.length != 2) {
		block(req, res, "Invalid format.");
		return;
	}
	req.body.include_full = req.body.include_full == 'true' ? true : false;
	let termcode = "" + (req.body.year + req.body.semester);
	scheduler.build_schedule_and_fulfil_request(req.body.courses, termcode, req.body.include_full, res);
});

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
const server = app.listen(process.env.PORT || 3000, () => {
	console.log(`Express running → port ${server.address().port}`)
});

function block(req, res, msg) {
	console.log("- Request blocked -");
	console.log("Reason: " + msg);
	console.log("IP: " + req.connection.remoteAddress);
	res.status(400).send(msg);
	res.status(400).end();
}