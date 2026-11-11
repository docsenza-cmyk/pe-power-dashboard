import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, 
} from '@mui/material';
import axios from 'axios';

const MaintenanceForm = ({ open, onClose, equipment, onSaved }) => {
  const [lastMaintenance, setLastMaintenance] = useState(
    equipment?.lastMaintenance 
      ? new Date(equipment.lastMaintenance).toISOString().slice(0, 10) 
      : ''
  );
  const [nextMaintenance, setNextMaintenance] = useState(
    equipment?.nextMaintenance 
      ? new Date(equipment.nextMaintenance).toISOString().slice(0, 10) 
      : ''
  );
  const [maintenanceReport, setMaintenanceReport] = useState(equipment?.maintenanceReport || '');

  const handleSubmit = () => {
    const updatedData = {
      ...equipment,
      lastMaintenance: lastMaintenance || null,
      nextMaintenance: nextMaintenance || null,
      maintenanceReport: maintenanceReport.trim() || ''
    };

    axios.put(`http://localhost:5000/api/equipment/${equipment._id}`, updatedData)
      .then(res => {
        onSaved(res.data);
        onClose();
      })
      .catch(err => {
        console.error(err);
        alert('Error saving maintenance data');
      });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Maintenance for {equipment?.name || 'Equipment'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Last Maintenance Date"
            type="date"
            value={lastMaintenance}
            onChange={(e) => setLastMaintenance(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Next Scheduled Maintenance"
            type="date"
            value={nextMaintenance}
            onChange={(e) => setNextMaintenance(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Maintenance Report / Notes (Optional)"
            multiline
            rows={5}
            value={maintenanceReport}
            onChange={(e) => setMaintenanceReport(e.target.value)}
            fullWidth
            placeholder="Enter findings, repairs done, recommendations, observations..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Save Maintenance
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MaintenanceForm;