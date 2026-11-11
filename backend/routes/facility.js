const express = require('express');
const router = express.Router();
const Facility = require('../models/Facility');

// GET all facilities
router.get('/', async (req, res) => {
  try {
    const facilities = await Facility.find().sort({ name: 1 });
    res.json(facilities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new facility
router.post('/', async (req, res) => {
  const facility = new Facility({
    name: req.body.name,
    description: req.body.description,
    location: req.body.location
  });
  try {
    const newFacility = await facility.save();
    res.status(201).json(newFacility);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE facility (only if no equipment)
router.delete('/:id', async (req, res) => {
  try {
    const equipmentCount = await require('../models/Equipment').countDocuments({ facility: req.params.id });
    if (equipmentCount > 0) {
      return res.status(400).json({ message: 'Cannot delete facility with equipment' });
    }
    await Facility.findByIdAndDelete(req.params.id);
    res.json({ message: 'Facility deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;