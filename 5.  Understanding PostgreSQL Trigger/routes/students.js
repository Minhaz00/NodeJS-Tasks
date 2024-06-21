const express = require('express');
const router = express.Router();
const db = require('../models');

router.post('/', async (req, res) => {
  try {
    const student = await db.students.create(req.body);
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const student = await db.students.findByPk(req.params.id);
    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ error: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
