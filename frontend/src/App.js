import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import EquipmentTable from './components/EquipmentTable';
import FacilityForm from './components/FacilityForm';
import { useState, useEffect, useCallback } from 'react';
import { Tabs, Tab, Button, IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('all');
  const [openFacilityForm, setOpenFacilityForm] = useState(false);

  const fetchFacilities = useCallback(() => {
    axios.get(`${API_URL}/api/facilities`)
      .then(res => {
        if (res.data.length === 0) {
          axios.post(`${API_URL}/api/facilities`, {
            name: 'Main Plant',
            description: 'Default facility for all equipment',
            location: 'Amandi Energy Site'
          })
            .then(newRes => {
              setFacilities([newRes.data]);
              setSelectedFacility(newRes.data._id);
            })
            .catch(err => console.error('Error creating default facility:', err));
        } else {
          setFacilities(res.data);
        }
      })
      .catch(err => console.error('Error fetching facilities:', err));
  }, []);

  const handleFacilityAdded = (newFacility) => {
    setFacilities(prev => [...prev, newFacility]);
  };

  const deleteFacility = (id, name) => {
    if (window.confirm(`Are you sure you want to delete facility "${name}"?`)) {
      axios.delete(`${API_URL}/api/facilities/${id}`)
        .then(() => {
          setFacilities(prev => prev.filter(f => f._id !== id));
          if (selectedFacility === id) {
            setSelectedFacility('all');
          }
        })
        .catch(err => console.error(err));
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedFacility(newValue);
  };

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url(/power-plant-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Logo */}
        <Box sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center'
        }}>
          <img
            src="/amandi-logo.png"
            alt="Amandi Energy Logo"
            width="140"
            style={{
              borderRadius: '6px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              backgroundColor: 'white',
              padding: '8px'
            }}
          />
        </Box>

        {/* Title */}
        <Typography
          variant="h3"
          gutterBottom
          align="center"
          color="white"
          sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)', mt: 2 }}
        >
          PE Power - Operational Assets Dashboard
        </Typography>

        {/* Facility Tabs + Add Button */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs
            value={selectedFacility}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                height: '100%',
                borderRadius: '30px',
                backgroundColor: '#1976d2',
                zIndex: 0,
              },
              '& .MuiTab-root': {
                borderRadius: '30px',
                minHeight: 42,
                minWidth: 120,
                margin: '0 6px',
                color: 'black !important',
                fontWeight: '600',
                fontSize: '1rem',
                zIndex: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.08)',
                },
              },
              '& .Mui-selected': {
                color: 'white !important',
                fontWeight: 'bold',
              },
            }}
          >
            <Tab label="All Equipment" value="all" />
            {facilities.map((facility) => (
              <Tab
                key={facility._id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {facility.name}
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFacility(facility._id, facility.name);
                      }}
                      sx={{
                        color: 'black',
                        opacity: 0.7,
                        '&:hover': { opacity: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
                value={facility._id}
              />
            ))}
          </Tabs>

          <Button variant="contained" onClick={() => setOpenFacilityForm(true)}>
            Add New Facility
          </Button>
        </Box>

        {/* Equipment Table */}
        <EquipmentTable
          facilityId={selectedFacility === 'all' ? null : selectedFacility}
          showAll={selectedFacility === 'all'}
        />

        {/* Facility Form */}
        <FacilityForm
          open={openFacilityForm}
          onClose={() => setOpenFacilityForm(false)}
          onAdded={(newFacility) => {
            handleFacilityAdded(newFacility);
            fetchFacilities();
          }}
        />
      </Container>
    </Box>
  );
}

export default App;