const express = require("express");
const { body, validationResult } = require("express-validator");
const fetchUser = require("../middleware/auth");
const Note = require("../models/Notes");

const router = express.Router();

// Route 1: Get all notes of a user using: GET "/api/notes/". Login required
router.get("/fetchallnote", fetchUser, async (req, res) => {
	try {
		const notes = await Note.find({ user: req.user.id });
		res.json(notes);
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Internal Server Error");
	}
});

// Route 2: Add a new note using: POST "/api/notes/". Login required
router.post(
	"/createnote",
	fetchUser,
	[
		body("title", "Title must be at least 3 characters").isLength({ min: 3 }),
		body("description", "Description must be at least 5 characters").isLength({
			min: 5,
		}),
	],
	async (req, res) => {
		try {
			const { title, description, tag } = req.body;

			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			const note = new Note({
				title,
				description,
				tag,
				user: req.user.id, //associate note with user id
			});

			const savedNote = await note.save();

			res.status(201).json(savedNote);
		} catch (error) {
			console.error(error.message);
			res.status(500).send("Internal Server Error");
		}
	}
);

//route 3: Update an existing note using: PUT "/api/notes/:id". Login required
router.put("/updatenote/:id", fetchUser, async (req, res) => {
	try {
		const { title, description, tag } = req.body;
		// Create a newNote object
		const newNote = {};
		if (title) {
			newNote.title = title;
		}
		if (description) {
			newNote.description = description;
		}
		if (tag) {
			newNote.tag = tag;
		}

		// Find the note to be updated and update it
		let note = await Note.findById(req.params.id); //id of notes
		if (!note) {
			return res.status(404).send("Not Found");
		}
		if (note.user.toString() !== req.user.id) {
			return res.status(401).send("Not Allowed");
		}
		note = await Note.findByIdAndUpdate(
			req.params.id,
			{ $set: newNote },
			{ new: true }
		);
		res.status(201).json(note);
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Internal Server Error");
	}
});

//route 4: Delete an existing note using: DELETE "/api/notes/:id". Login required
router.delete("/deletenote/:id", fetchUser, async (req, res) => {
	try {
		// Find the note to be deleted and delete it
		let note = await Note.findById(req.params.id);
		if (!note) {
			return res.status(404).send("Not Found");
		}

		//allow deletion only if user owns this note
		if (note.user.toString() !== req.user.id) {
			return res.status(401).send("Not Allowed");
		}
		note = await Note.findByIdAndDelete(req.params.id);
		res.json({ Success: "Note has been deleted", note: note });
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Internal Server Error");
	}
});

module.exports = router;
