const express = require("express");
const mongoDB = require("./db");
const cors = require("cors"); // Import the cors module
const user = require("./routes/users");

const app = express();
app.use(cors()); // Use cors middleware
app.use(express.json());

const PORT = 3000;
mongoDB();

app.use("/api/v1/users", user);

//api test
app.get("/api/v1/test", (req, res) => {
	res.send("Hello World");
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
