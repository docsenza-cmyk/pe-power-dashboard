// frontend/src/components/ParameterLogForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Select, MenuItem, FormControl, InputLabel,
  Checkbox, FormControlLabel, Box, Typography, Grid,
  FormHelperText
} from '@mui/material';
import axios from 'axios';

const ParameterLogForm = ({ open, onClose, equipment, onLogSaved }) => {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  // Initialize form values
  useEffect(() => {
    if (!open || !equipment?.customParameters) return;

    const initial = {};
    equipment.customParameters.forEach(param => {
      if (param.defaultValue !== undefined) {
        initial[param.name] = param.defaultValue;
      } else if (param.type === 'checkbox') {
        initial[param.name] = false;
      } else if (param.type === 'date') {
        initial[param.name] = new Date().toISOString().slice(0, 10);
      } else {
        initial[param.name] = '';
      }
    });
    setValues(initial);
    setErrors({});
  }, [open, equipment]);

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    equipment?.customParameters?.forEach(param => {
      const val = values[param.name];

      if (param.required && (val === undefined || val === '' || val === null)) {
        newErrors[param.name] = 'This field is required';
      }

      if (param.type === 'number') {
        const num = Number(val);
        if (val !== '' && isNaN(num)) {
          newErrors[param.name] = 'Must be a valid number';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async () => {
    if (!validate() || !equipment) return;

    try {
      const payload = {
        equipmentId: equipment._id,
        values: { ...values },           // make sure it's a clean object
        timestamp: new Date().toISOString()
      };

      console.log("Sending payload to backend:", payload);   // ← DEBUG LINE
      console.log("=== SENDING TO BACKEND ===");
      console.log("equipmentId:", equipment._id);
      console.log("values being sent:", values);
      console.log("payload:", { equipmentId: equipment._id, values: { ...values } });
      const res = await axios.post('http://localhost:5000/api/parameters', payload);

      console.log("Response from backend:", res.data);     // ← DEBUG LINE

      if (onLogSaved) {
        onLogSaved(res.data);
      }

      alert('Log saved successfully!');
      onClose();
    } catch (err) {
      console.error('Log save failed:', err.response?.data || err.message);
      alert('Failed to save log: ' + (err.response?.data?.message || err.message));
    }
  };

  const renderField = (param) => {
    const commonProps = {
      fullWidth: true,
      margin: 'normal',
      size: 'small',
      error: !!errors[param.name],
      helperText: errors[param.name] || (param.unit ? param.unit : ''),
      label: param.label || param.name,
      required: param.required
    };

    switch (param.type) {
      case 'number':
        return (
          <TextField
            {...commonProps}
            type="number"
            value={values[param.name] ?? ''}
            onChange={(e) => handleChange(param.name, e.target.value)}
          />
        );

      case 'text':
        return (
          <TextField
            {...commonProps}
            value={values[param.name] ?? ''}
            onChange={(e) => handleChange(param.name, e.target.value)}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth margin="normal" size="small" error={!!errors[param.name]}>
            <InputLabel>{param.label || param.name}</InputLabel>
            <Select
              value={values[param.name] ?? ''}
              label={param.label || param.name}
              onChange={(e) => handleChange(param.name, e.target.value)}
            >
              <MenuItem value="" disabled>Select...</MenuItem>
              {param.options?.map((opt, i) => (
                <MenuItem key={i} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!values[param.name]}
                onChange={(e) => handleChange(param.name, e.target.checked)}
              />
            }
            label={param.label || param.name}
            sx={{ mt: 2 }}
          />
        );

      case 'date':
        return (
          <TextField
            {...commonProps}
            type="date"
            value={values[param.name] ? new Date(values[param.name]).toISOString().slice(0, 10) : ''}
            onChange={(e) => handleChange(param.name, e.target.value ? new Date(e.target.value) : null)}
            InputLabelProps={{ shrink: true }}
          />
        );

      default:
        return null;
    }
  };

  if (!open || !equipment) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Log Parameters – {equipment.name || 'Equipment'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {equipment.customParameters?.length === 0 ? (
            <Typography color="textSecondary" align="center">
              No parameters defined for this equipment yet.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {equipment.customParameters.map((param, index) => (
                <Grid item xs={12} key={index}>
                  {renderField(param)}
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={equipment.customParameters?.length === 0}
        >
          Save Log
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ParameterLogForm;