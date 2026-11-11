// frontend/src/components/EquipmentForm.js
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, Select, FormControl, InputLabel,
  Box, Typography, IconButton, Checkbox, FormControlLabel,
  Chip, Grid, Divider
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

const EquipmentForm = ({ open, onClose, onSaved, equipmentToEdit, facilities }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    status: 'Operational',
    facility: '',
    lastMaintenance: '',
    nextMaintenance: '',
    maintenanceReport: '',
    customParameters: [] // NEW: array of parameter objects
  });

  // For adding/editing a single parameter
  const [newParam, setNewParam] = useState({
    name: '',
    type: 'number',
    unit: '',
    required: false,
    options: [],
    min: '',
    max: '',
    defaultValue: ''
  });

  // For editing options (chips)
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    if (equipmentToEdit) {
      setFormData({
        name: equipmentToEdit.name || '',
        type: equipmentToEdit.type || '',
        status: equipmentToEdit.status || 'Operational',
        facility: equipmentToEdit.facility?._id || equipmentToEdit.facility || '',
        lastMaintenance: equipmentToEdit.lastMaintenance 
          ? new Date(equipmentToEdit.lastMaintenance).toISOString().slice(0,10) 
          : '',
        nextMaintenance: equipmentToEdit.nextMaintenance 
          ? new Date(equipmentToEdit.nextMaintenance).toISOString().slice(0,10) 
          : '',
        maintenanceReport: equipmentToEdit.maintenanceReport || '',
        customParameters: equipmentToEdit.customParameters || []
      });
    } else {
      setFormData({
        name: '',
        type: '',
        status: 'Operational',
        facility: '',
        lastMaintenance: '',
        nextMaintenance: '',
        maintenanceReport: '',
        customParameters: []
      });
    }
  }, [equipmentToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ── Parameter handlers ──
  const handleParamChange = (e) => {
    const { name, value, checked, type } = e.target;
    setNewParam(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addOption = () => {
    if (newOption.trim()) {
      setNewParam(prev => ({
        ...prev,
        options: [...prev.options, newOption.trim()]
      }));
      setNewOption('');
    }
  };

  const removeOption = (index) => {
    setNewParam(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const addParameter = () => {
    if (!newParam.name.trim()) {
      alert('Parameter name is required');
      return;
    }

    const paramToAdd = { ...newParam };

    // Clean up based on type
    if (paramToAdd.type !== 'number') {
      delete paramToAdd.min;
      delete paramToAdd.max;
      delete paramToAdd.unit;
    }
    if (paramToAdd.type !== 'select') {
      delete paramToAdd.options;
    }

    setFormData(prev => ({
      ...prev,
      customParameters: [...prev.customParameters, paramToAdd]
    }));

    // Reset form
    setNewParam({
      name: '',
      type: 'number',
      unit: '',
      required: false,
      options: [],
      min: '',
      max: '',
      defaultValue: ''
    });
  };

  const removeParameter = (index) => {
    setFormData(prev => ({
      ...prev,
      customParameters: prev.customParameters.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      const url = equipmentToEdit 
        ? `http://localhost:5000/api/equipment/${equipmentToEdit._id}`
        : 'http://localhost:5000/api/equipment';
      
      const method = equipmentToEdit ? 'put' : 'post';
      
      const res = await axios[method](url, formData);
      onSaved(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error saving equipment: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {equipmentToEdit ? `Edit ${equipmentToEdit.name}` : 'Add New Equipment'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* Basic fields - your existing ones */}
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            fullWidth
            required
          />
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              label="Status"
              onChange={handleChange}
            >
              <MenuItem value="Operational">Operational</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Down">Down</MenuItem>
              <MenuItem value="Standby">Standby</MenuItem>
              <MenuItem value="Under Repair">Under Repair</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Facility</InputLabel>
            <Select
              name="facility"
              value={formData.facility}
              label="Facility"
              onChange={handleChange}
            >
              {facilities.map(fac => (
                <MenuItem key={fac._id} value={fac._id}>
                  {fac.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Last Maintenance"
            name="lastMaintenance"
            type="date"
            value={formData.lastMaintenance}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Next Maintenance"
            name="nextMaintenance"
            type="date"
            value={formData.nextMaintenance}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Maintenance Report"
            name="maintenanceReport"
            value={formData.maintenanceReport}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
          />

          {/* ── NEW SECTION: Custom Parameters ── */}
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>
            Parameters to be logged for this equipment
          </Typography>

          {formData.customParameters.length > 0 && (
            <Box sx={{ mb: 3 }}>
              {formData.customParameters.map((param, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: '1px solid #ddd',
                    borderRadius: 2,
                    backgroundColor: '#f9f9f9',
                    position: 'relative'
                  }}
                >
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeParameter(index)}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    <DeleteIcon />
                  </IconButton>

                  <Typography variant="subtitle1" gutterBottom>
                    {param.name} ({param.type})
                  </Typography>

                  {param.unit && <Typography variant="body2">Unit: {param.unit}</Typography>}
                  {param.required && <Typography variant="body2" color="error">Required</Typography>}
                  {param.type === 'select' && param.options.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">Options:</Typography>
                      {param.options.map((opt, i) => (
                        <Chip key={i} label={opt} size="small" sx={{ mr: 1, mt: 0.5 }} />
                      ))}
                    </Box>
                  )}
                  {(param.min !== undefined || param.max !== undefined) && (
                    <Typography variant="body2">
                      Range: {param.min ?? '-∞'} to {param.max ?? '∞'}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {/* Form to add new parameter */}
          <Box sx={{ border: '1px dashed #ccc', p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Add New Parameter
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Parameter Name"
                  name="name"
                  value={newParam.name}
                  onChange={handleParamChange}
                  fullWidth
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={newParam.type}
                    label="Type"
                    onChange={handleParamChange}
                  >
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="select">Dropdown (Select)</MenuItem>
                    <MenuItem value="checkbox">Checkbox (Yes/No)</MenuItem>
                    <MenuItem value="date">Date</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {newParam.type === 'number' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Unit (e.g. bar, °C)"
                      name="unit"
                      value={newParam.unit}
                      onChange={handleParamChange}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      label="Min"
                      name="min"
                      type="number"
                      value={newParam.min}
                      onChange={handleParamChange}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      label="Max"
                      name="max"
                      type="number"
                      value={newParam.max}
                      onChange={handleParamChange}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                </>
              )}

              {newParam.type === 'select' && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    {newParam.options.map((opt, i) => (
                      <Chip
                        key={i}
                        label={opt}
                        onDelete={() => removeOption(i)}
                        size="small"
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Add Option"
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <Button variant="outlined" size="small" onClick={addOption}>
                      Add
                    </Button>
                  </Box>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="required"
                      checked={newParam.required}
                      onChange={handleParamChange}
                    />
                  }
                  label="Required when logging"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={addParameter}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Add This Parameter
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {equipmentToEdit ? 'Update' : 'Add'} Equipment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EquipmentForm;