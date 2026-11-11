const express = require('express');
const router = express.Router();
const Parameter = require('../models/Parameter');

// GET all parameters for an equipment
router.get('/equipment/:equipmentId', async (req, res) => {
  try {
    const parameters = await Parameter.find({ equipmentId: req.params.equipmentId })
      .sort({ timestamp: -1 });
    res.json(parameters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new parameter reading - UPDATED for dynamic values
router.post('/', async (req, res) => {
  try {
    const parameter = new Parameter({
      equipmentId: req.body.equipmentId,
      values: req.body.values || {},           // ← This is the key fix
      timestamp: req.body.timestamp || new Date()
    });

    const newParameter = await parameter.save();
    res.status(201).json(newParameter);
  } catch (err) {
    console.error('Parameter save error:', err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;