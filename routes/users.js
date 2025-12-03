const express = require("express");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchUser = require("../middleware/auth");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

//Add some validation rules by express-validator
const ValidateUser = [
	body("name")
		.isLength({ min: 3 })
		.withMessage("Name must be at least 3 characters long"),

	body("email").isEmail().withMessage("Please enter a valid email address"),
	body("password")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters long"),
];

router.post("/", ValidateUser, async (req, res) => {
	let success = false;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ success, errors: errors.array() });
	}

	try {
		let user = await User.findOne({ email: req.body.email });
		if (user) {
			return res.status(400).json({
				success,
				error: "Sorry a user with this email already exists",
			});
		}

		const salt = await bcrypt.genSalt(10);
		const securePassword = await bcrypt.hash(req.body.password, salt);
		// Create a new user
		user = new User({
			name: req.body.name,
			email: req.body.email,
			password: securePassword,
		});

		await user.save();

		const data = {
			user: {
				id: user.id,
			},
		};
		const authToken = jwt.sign(data, JWT_SECRET);
		success = true;
		res.status(201).json({
			success,
			message: "User created successfully",
			authToken,
		});
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Internal Server Error");
	}
});

router.post("/login", [ValidateUser[1], ValidateUser[2]], async (req, res) => {
	let success = false;

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ success, errors: errors.array() });
	}

	const { email, password } = req.body;
	try {
		let user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({
				success,
				error: "Please try to login with correct credentials",
			});
		}
		//compare to correct password in db
		const passwordCompare = await bcrypt.compare(password, user.password);
		if (!passwordCompare) {
			return res.status(400).json({
				success,
				error: "Please try to login with correct credentials",
			});
		}

		const data = {
			user: {
				id: user.id,
			},
		};
		const authToken = jwt.sign(data, JWT_SECRET);
		success = true;
		res.json({ success, authToken, id: user.id });
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ success: false, error: "Internal Server Error" });
	}
});

//get the logged in user details using: POST "/api/v1/users/getuser". login required
//fetchuser middleware is used here for user information

router.post("/getuser", fetchUser, async (req, res) => {
	try {
		const userId = req.user.id;
		const user = await User.findById(userId).select("-password");
		res.send(user);
	} catch (error) {
		console.error(error.message);
		res, status(500).send("Internal Server Error");
	}
});
module.exports = router;
