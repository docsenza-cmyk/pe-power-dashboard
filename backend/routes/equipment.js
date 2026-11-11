const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');
const multer = require('multer');

const upload = multer(); // memory storage for now

// Helper to validate customParameters (optional but prevents bad data)
const validateCustomParameters = (params) => {
  if (!Array.isArray(params)) return false;

  for (const param of params) {
    if (!param.name || typeof param.name !== 'string' || param.name.trim() === '') {
      return false;
    }
    if (!['number', 'text', 'select', 'checkbox', 'date'].includes(param.type)) {
      return false;
    }
    if (param.type === 'select' && (!Array.isArray(param.options) || param.options.length === 0)) {
      return false;
    }
    // Add more rules if needed (e.g. min/max only for number)
  }
  return true;
};

// GET all equipment
router.get('/', async (req, res) => {
  try {
    const equipments = await Equipment.find().populate('facility');
    res.json(equipments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single equipment
router.get('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id).populate('facility');
    if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new equipment
router.post('/', async (req, res) => {
  try {
    const { customParameters, ...rest } = req.body;

    // Validate customParameters if provided
    if (customParameters && !validateCustomParameters(customParameters)) {
      return res.status(400).json({ message: 'Invalid custom parameters format' });
    }

    const equipment = new Equipment({
      ...rest,
      customParameters: customParameters || [] // default to empty array
    });

    const newEquipment = await equipment.save();
    res.status(201).json(newEquipment);
  } catch (err) {
    console.error('Error creating equipment:', err);
    res.status(400).json({ message: err.message });
  }
});

// PUT update equipment
router.put('/:id', async (req, res) => {
  try {
    const { customParameters, ...rest } = req.body;

    // Validate customParameters if provided
    if (customParameters && !validateCustomParameters(customParameters)) {
      return res.status(400).json({ message: 'Invalid custom parameters format' });
    }

    const updated = await Equipment.findByIdAndUpdate(
      req.params.id,
      {
        ...rest,
        customParameters: customParameters !== undefined ? customParameters : undefined
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: 'Equipment not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating equipment:', err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE equipment
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Equipment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Equipment not found' });
    res.json({ message: 'Equipment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PHOTO UPLOAD ROUTE
router.post('/:id/photo', upload.single('photo'), async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ message: 'Equipment not found' });

    if (!req.file) return res.status(400).json({ message: 'No photo file received' });

    const photoBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    equipment.photos = equipment.photos || [];
    equipment.photos.push({
      url: photoBase64,
      caption: req.body.caption || `Photo ${new Date().toLocaleString()}`
    });

    await equipment.save();
    res.json(equipment);
  } catch (err) {
    console.error('Photo upload failed:', err);
    res.status(500).json({ message: 'Photo upload failed' });
  }
});

module.exports = router;