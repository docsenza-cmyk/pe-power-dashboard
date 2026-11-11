import React, { useState } from 'react';
import { Box, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import axios from 'axios';

const FacilityForm = ({ open, onClose, onAdded }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = () => {
    axios.post('http://localhost:5000/api/facilities', {
      name, description, location
    })
      .then(res => {
        onAdded(res.data);
        setName('');
        setDescription('');
        setLocation('');
        onClose();
      })
      .catch(err => console.error(err));
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Facility</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Facility Name (e.g., Boiler Room)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="dense"
            required
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            margin="dense"
            multiline
            rows={2}
          />
          <TextField
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            fullWidth
            margin="dense"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Create Facility</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FacilityForm;