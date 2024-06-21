const express = require('express');
const router = express.Router();
const db = require('../models');

router.post('/', async (req, res) => {
  try {
    const grade = await db.grades.create(req.body);
    res.json(grade);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const grade = await db.grades.findByPk(req.params.id);
    if (grade) {
      await grade.update(req.body);
      res.json(grade);
    } else {
      res.status(404).json({ error: 'Grade not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
