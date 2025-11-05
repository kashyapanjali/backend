const express = require("express");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");

const router = express.Router();

router.post(
	"/",
	[
		body("name")
			.isLength({ min: 3 })
			.withMessage("Name must be at least 3 characters long"),

		body("email").isEmail().withMessage("Please enter a valid email address"),

		body("password")
			.isLength({ min: 6 })
			.withMessage("Password must be at least 6 characters long"),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const User = await User.findOne({ email: req.body.email });
			if (User) {
				return res
					.status(400)
					.json({ error: "Sorry a user with this email already exists" });
			}
			// Create a new user
			const user = new User({
				name: req.body.name,
				email: req.body.email,
				password: req.body.password,
			});

			await user.save(); //save in the database

			res.send(req.body);
			res.status(201).json({
				message: "User created successfully",
				user,
			});
		} catch (error) {
			console.error(error.message);
			res.status(500).send("Internal Server Error");
		}
	}
);

module.exports = router;
