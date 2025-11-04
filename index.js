const express = require("express");
const app = express();
const mongoDB = require("./db");

const PORT = 5000;
mongoDB();

console.log("first api called");

app.get("/", (req, res) => {
	res.send("Hello World");
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
