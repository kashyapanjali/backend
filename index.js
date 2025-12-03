const express = require("express");
require("dotenv").config();
const mongoDB = require("./db");
const cors = require("cors"); // Import the cors module
const user = require("./routes/users");
const notes = require("./routes/notes");

const app = express();
app.use(cors()); // Use cors middleware
app.use(express.json());

const PORT = process.env.PORT;
mongoDB();

app.use("/api/v1/users", user);
app.use("/api/v1/notes", notes);

//api test
app.get("/api/v1/test", (req, res) => {
	res.send("Hello World");
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
