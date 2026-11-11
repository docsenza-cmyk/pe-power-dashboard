import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Tabs, Tab, Box, Button, IconButton, AppBar, Toolbar
} from '@mui/material';
import { Delete as DeleteIcon, Logout as LogoutIcon } from '@mui/icons-material';
import axios from 'axios';
import EquipmentTable from './components/EquipmentTable';
import FacilityForm from './components/FacilityForm';
import LoginPage from './components/LoginPage'; // ← new import

function App() {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('all');
  const [openFacilityForm, setOpenFacilityForm] = useState(false);
  const [user, setUser] = useState(null); // logged-in user

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchFacilities = useCallback(() => {
    axios.get('http://localhost:5000/api/facilities')
      .then(res => {
        if (res.data.length === 0) {
          axios.post('http://localhost:5000/api/facilities', {
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

  useEffect(() => {
    if (user) {
      fetchFacilities(); // only fetch when logged in
    }
  }, [fetchFacilities, user]);

  const handleFacilityAdded = (newFacility) => {
    setFacilities(prev => [...prev, newFacility]);
  };

  const handleFacilityDeleted = (deletedId) => {
    setFacilities(prev => prev.filter(f => f._id !== deletedId));
    if (selectedFacility === deletedId) {
      setSelectedFacility('all');
    }
  };

  const deleteFacility = (facilityId, facilityName) => {
    if (window.confirm(`Delete facility "${facilityName}"? Equipment will become unassigned.`)) {
      axios.delete(`http://localhost:5000/api/facilities/${facilityId}`)
        .then(() => {
          handleFacilityDeleted(facilityId);
          alert(`Facility "${facilityName}" deleted successfully.`);
        })
        .catch(err => {
          if (err.response?.status === 400) {
            alert('Cannot delete: This facility has equipment assigned. Please reassign or delete equipment first.');
          } else {
            console.error(err);
            alert('Error deleting facility.');
          }
        });
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedFacility(newValue);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setFacilities([]);
    setSelectedFacility('all');
  };

  // If not logged in → show LoginPage
  if (!user) {
    return <LoginPage onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  // Logged in → show dashboard
  return (
    <>
      {/* Top Bar with Logout */}
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            PE Power - Operational Assets Dashboard
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              Welcome, {user.name || user.email}
            </Typography>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ fontWeight: 'bold' }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ position: 'relative' }}>
        {/* Amandi Energy Logo */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 16,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center'
          }}
        >
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

        {/* Facility Tabs + Add Button */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                textTransform: 'none',
                minWidth: 'auto',
                padding: '10px 24px',
                marginRight: '12px',
                borderRadius: '30px',
                backgroundColor: 'transparent',
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

        {/* Facility Form Modal */}
        <FacilityForm
          open={openFacilityForm}
          onClose={() => setOpenFacilityForm(false)}
          onAdded={(newFacility) => {
            handleFacilityAdded(newFacility);
            fetchFacilities();
          }}
        />
      </Container>
    </>
  );
}

export default App;