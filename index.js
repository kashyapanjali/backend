const express = require("express");
const mongoDB = require("./db");
const cors = require("cors"); // Import the cors module

const app = express();
app.use(cors()); // Use cors middleware
app.use(express.json());

const PORT = 5000;
mongoDB();

console.log("first api called");

app.get("/api", (req, res) => {
	res.send("Hello World");
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
