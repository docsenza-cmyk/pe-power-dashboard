import React, { useState } from 'react';
import { Box, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import axios from 'axios';

const ParameterForm = ({ open, onClose, equipmentId, onAdded }) => {
  const [pressure, setPressure] = useState('');
  const [temperature, setTemperature] = useState('');
  const [flow, setFlow] = useState('');

  const handleSubmit = () => {
    axios.post('http://localhost:5000/api/parameters', {
      equipmentId,
      pressure: Number(pressure),
      temperature: Number(temperature),
      flow: Number(flow)
    })
      .then(res => {
        onAdded(res.data);
        setPressure('');
        setTemperature('');
        setFlow('');
        onClose();
      })
      .catch(err => console.error(err));
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Log Parameters</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField label="Pressure (bar)" type="number" value={pressure} onChange={(e) => setPressure(e.target.value)} fullWidth margin="dense" />
          <TextField label="Temperature (°C)" type="number" value={temperature} onChange={(e) => setTemperature(e.target.value)} fullWidth margin="dense" />
          <TextField label="Flow (m³/h)" type="number" value={flow} onChange={(e) => setFlow(e.target.value)} fullWidth margin="dense" />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Log Reading</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ParameterForm;