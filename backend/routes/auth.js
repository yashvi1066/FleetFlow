const express = require("express");
const router = express.Router();
const Note = require("../models/Note");

// CREATE NOTE
router.post("/", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    const newNote = new Note({ title, content });
    const savedNote = await newNote.save();

    res.status(201).json(savedNote);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;