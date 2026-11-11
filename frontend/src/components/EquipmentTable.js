import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, IconButton, Box, Typography, CircularProgress,
  Button, Collapse, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Card, CardMedia, CardContent, CardActions
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  BarChart as ChartIcon,
  List as LogsIcon,
  CameraAlt as CameraIcon,
  PhotoLibrary as PhotoLibraryIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import axios from 'axios';
import * as XLSX from 'xlsx';
import EquipmentForm from './EquipmentForm';
import ParameterForm from './ParameterForm';
import ParameterLogForm from './ParameterLogForm';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const EquipmentTable = ({ facilityId, showAll = false, facilityName }) => {
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEquipmentForm, setOpenEquipmentForm] = useState(false);
  const [openParameterForm, setOpenParameterForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);
  const [expandedChartRow, setExpandedChartRow] = useState(null);
  const [expandedLogsRow, setExpandedLogsRow] = useState(null);
  const [parameters, setParameters] = useState({});
  const [openCameraModal, setOpenCameraModal] = useState(false);
  const [selectedCameraEquipment, setSelectedCameraEquipment] = useState(null);
  const [expandedGalleryRow, setExpandedGalleryRow] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [photoCaption, setPhotoCaption] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [logModalOpen, setLogModalOpen] = useState(false);
  const [selectedEquipmentForLog, setSelectedEquipmentForLog] = useState(null);

  // Debug function
  const checkBackendConnection = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/equipment');
      setDebugInfo(`Backend connected. Equipment count: ${response.data?.length || 0}`);
      return response.data;
    } catch (error) {
      setDebugInfo(`Backend error: ${error.message}`);
      return null;
    }
  }, []);

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/equipment');
      let data = response.data || [];

      if (!showAll && facilityId) {
        data = data.filter(item => {
          const matches = (item?.facility && item.facility._id === facilityId) ||
                         item?.facility === facilityId;
          return matches;
        });
      }

      setEquipment(data);
      setFilteredEquipment(data);
      setDebugInfo(`Loaded ${data.length} equipment`);
    } catch (err) {
      console.error('Error fetching equipment:', err);
      setDebugInfo(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [facilityId, showAll]);

  const fetchFacilities = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/facilities');
      setFacilities(response.data || []);
    } catch (err) {
      console.error('Error fetching facilities:', err);
    }
  }, []);

  const fetchParameters = useCallback((equipmentId) => {
    axios.get(`http://localhost:5000/api/parameters/equipment/${equipmentId}`)
      .then(res => setParameters(prev => ({ ...prev, [equipmentId]: res.data || [] })))
      .catch(err => console.error('Error fetching parameters:', err));
  }, []);

  // Initial load
  useEffect(() => {
    checkBackendConnection().then(() => {
      fetchEquipment();
      fetchFacilities();
    });
  }, [checkBackendConnection, fetchEquipment, fetchFacilities]);

  // Auto-fetch parameters
  useEffect(() => {
    if (filteredEquipment.length > 0) {
      filteredEquipment.forEach(eq => {
        if (!parameters[eq._id]) {
          fetchParameters(eq._id);
        }
      });
    }
  }, [filteredEquipment, parameters, fetchParameters]);

  // Search filter
  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = equipment.filter(item =>
      (item?.name?.toLowerCase().includes(lowerTerm) ||
       item?.type?.toLowerCase().includes(lowerTerm) ||
       item?.status?.toLowerCase().includes(lowerTerm))
    );
    setFilteredEquipment(filtered);
  }, [searchTerm, equipment]);

  // Delete equipment
  const handleDelete = (id) => {
    if (window.confirm('Delete this equipment and all its data?')) {
      axios.delete(`http://localhost:5000/api/equipment/${id}`)
        .then(() => fetchEquipment())
        .catch(err => {
          console.error('Delete error:', err);
          alert(`Delete failed: ${err.message}`);
        });
    }
  };

  // Delete photo
  const deletePhoto = async (equipmentId, photoIndex) => {
    if (window.confirm('Delete this photo?')) {
      try {
        await axios.delete(`http://localhost:5000/api/equipment/${equipmentId}/photo/${photoIndex}`);
        fetchEquipment();
        alert('Photo deleted successfully!');
      } catch (err) {
        console.error('Delete photo error:', err);
        alert('Failed to delete photo');
      }
    }
  };

  // Toggle functions
  const toggleChart = (id) => setExpandedChartRow(prev => prev === id ? null : id);
  const toggleLogs = (id) => setExpandedLogsRow(prev => prev === id ? null : id);
  const toggleGallery = (id) => setExpandedGalleryRow(prev => prev === id ? null : id);

  // Camera functions
  const openCamera = (item) => {
    setSelectedCameraEquipment(item);
    setPhotoCaption('');
    setOpenCameraModal(true);

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(err => {
        console.error('Camera error:', err);
        alert('Camera access denied. Please allow permission.');
      });
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !selectedCameraEquipment) return;

    setUploading(true);

    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, 640, 480);

    canvasRef.current.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('photo', blob, 'capture.jpg');
      formData.append('caption', photoCaption);

      try {
        await axios.post(
          `http://localhost:5000/api/equipment/${selectedCameraEquipment._id}/photo`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        fetchEquipment();
        alert('Photo uploaded successfully!');
        setPhotoCaption('');
      } catch (err) {
        console.error('Upload error:', err);
        alert('Failed to upload photo. Try again.');
      } finally {
        setUploading(false);
        setOpenCameraModal(false);

        if (videoRef.current?.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
      }
    }, 'image/jpeg', 0.8);
  };

  // Get status color
  const getStatusColor = (status) => {
    if (status === 'Operational') return 'success';
    if (status === 'Maintenance') return 'warning';
    return 'error';
  };

  // Dynamic Chart for ALL numeric parameters
  const getChartData = (eqId, customParameters) => {
    const logs = parameters[eqId] || [];
    const labels = logs.map(p => new Date(p.timestamp).toLocaleTimeString());

    const datasets = [];

    customParameters?.forEach((param, index) => {
      if (param.type === 'number') {
        const colors = ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 159, 64)', 'rgb(75, 192, 192)', 'rgb(153, 102, 255)'];
        datasets.push({
          label: `${param.label || param.name}${param.unit ? ` (${param.unit})` : ''}`,
          data: logs.map(log => log.values?.[param.name] || 0),
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length] + '33',
          tension: 0.2,
        });
      }
    });

    return { labels, datasets };
  };

  // Export to Excel
  const exportToExcel = () => {
    if (filteredEquipment.length === 0) {
      alert('No data to export in this facility');
      return;
    }

    const currentFacility = showAll 
      ? 'All_Facilities' 
      : facilities.find(f => f._id === facilityId)?.name || 'Unknown_Facility';
    const fileName = `PE_Power_${currentFacility.replace(/[^a-z0-9]/gi, '_')}_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;

    const wb = XLSX.utils.book_new();

    filteredEquipment.forEach(eq => {
      const sheetName = eq.name.substring(0, 31).replace(/[^a-zA-Z0-9]/g, '_');
      const wsData = [];

      wsData.push(['Equipment Information']);
      wsData.push(['Facility', 'Equipment Name', 'Type', 'Status', 'Last Maintenance', 'Next Maintenance']);
      wsData.push([
        facilities.find(f => f._id === (eq.facility?._id || eq.facility))?.name || 'Unassigned',
        eq.name,
        eq.type,
        eq.status,
        eq.lastMaintenance ? new Date(eq.lastMaintenance).toLocaleDateString() : '-',
        eq.nextMaintenance ? new Date(eq.nextMaintenance).toLocaleDateString() : '-'
      ]);

      wsData.push([]);

      wsData.push(['Parameter Log History']);
      const headerRow = ['Timestamp'];
      eq.customParameters?.forEach(param => {
        headerRow.push(`${param.label || param.name}${param.unit ? ` (${param.unit})` : ''}`);
      });
      wsData.push(headerRow);

      const params = parameters[eq._id] || [];
      if (params.length === 0) {
        wsData.push(['No parameter logs recorded yet']);
      } else {
        params.forEach(p => {
          const row = [new Date(p.timestamp).toLocaleString()];
          eq.customParameters?.forEach(param => {
            row.push(p.values?.[param.name] ?? '-');
          });
          wsData.push(row);
        });
      }

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = headerRow.map(() => ({ wch: 18 }));
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    XLSX.writeFile(wb, fileName);
  };

  return (
    <>
{/* MOVED LOGO TO THE RED SHADED AREA (Top-Left) */}
{!showAll && facilityName && (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: 2.5, 
    mb: 3,
    px: 2,
    py: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    borderBottom: '2px solid #1976d2'
  }}>
    {/* AMANDI Logo */}
    <img 
      src="/amandi-logo.png" 
      alt="AMANDI ENERGY" 
      style={{ 
        maxWidth: '170px', 
        height: 'auto',
        flexShrink: 0
      }} 
    />

    {/* Facility Name */}
    <Box>
      <Typography 
        variant="h5" 
        component="h1" 
        fontWeight="bold" 
        color="primary.main"
      >
        {facilityName}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Operational Assets Dashboard
      </Typography>
    </Box>
  </Box>
)}

      {/* Toolbar */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            label="Search equipment in this facility"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            sx={{ width: '400px' }}
          />
          {debugInfo && (
            <Typography variant="caption" color="textSecondary">
              {debugInfo}
            </Typography>
          )}
        </Box>
        <Box>
          <IconButton onClick={fetchEquipment} color="primary" title="Refresh" sx={{ mr: 1 }}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            onClick={() => {
              setEditingItem(null);
              setOpenEquipmentForm(true);
            }}
            sx={{ mr: 2 }}
          >
            Add Equipment
          </Button>
          <Button variant="outlined" onClick={exportToExcel}>
            Export Facility Workbook
          </Button>
        </Box>
      </Box>

      {/* Loading or content */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" mt={8} gap={2}>
          <CircularProgress />
          <Typography color="textSecondary">Loading equipment data...</Typography>
          <Button variant="outlined" size="small" onClick={fetchEquipment}>
            Retry Loading
          </Button>
        </Box>
      ) : filteredEquipment.length === 0 ? (
        <Box textAlign="center" mt={4} p={4}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No equipment found
          </Typography>
          <Typography color="textSecondary" paragraph>
            {searchTerm ? `No equipment matches "${searchTerm}"` : 'No equipment available in this facility'}
          </Typography>
          <Button variant="contained" onClick={() => {
            setEditingItem(null);
            setOpenEquipmentForm(true);
          }}>
            Add Your First Equipment
          </Button>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Last Maintenance</strong></TableCell>
                <TableCell><strong>Next Maintenance</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEquipment.map((item) => (
                <React.Fragment key={item._id}>
                  <TableRow hover>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.status} 
                        color={getStatusColor(item.status)} 
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {item.lastMaintenance ? new Date(item.lastMaintenance).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      {item.nextMaintenance ? new Date(item.nextMaintenance).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => toggleChart(item._id)} color="secondary" title="Chart">
                        <ChartIcon />
                      </IconButton>
                      <IconButton onClick={() => toggleLogs(item._id)} color="secondary" title="Logs">
                        <LogsIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          setSelectedEquipmentForLog(item);
                          setLogModalOpen(true);
                        }}
                        color="success"
                        title="Log Parameters"
                      >
                        Log
                      </IconButton>
                      <IconButton onClick={() => openCamera(item)} color="primary" title="Take Photo">
                        <CameraIcon />
                      </IconButton>
                      <IconButton onClick={() => toggleGallery(item._id)} color="secondary" title="View Gallery">
                        <PhotoLibraryIcon />
                      </IconButton>
                      <IconButton onClick={() => {
                        setEditingItem(item);
                        setOpenEquipmentForm(true);
                      }} color="primary" title="Edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(item._id)} color="error" title="Delete">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>

                  {/* Collapsible Sections */}
                  <TableRow>
                    <TableCell colSpan={6} sx={{ p: 0 }}>
                      {/* Dynamic Chart */}
                      <Collapse in={expandedChartRow === item._id} timeout="auto" unmountOnExit>
                        <Box sx={{ m: 3 }}>
                          <Typography variant="h6" gutterBottom>
                            Parameter Chart - {item.name}
                          </Typography>
                          {parameters[item._id]?.length > 0 && item.customParameters?.some(p => p.type === 'number') ? (
                            <Line 
                              data={getChartData(item._id, item.customParameters)} 
                              options={{ 
                                responsive: true,
                                plugins: { legend: { position: 'top' } },
                                scales: { y: { beginAtZero: true } }
                              }} 
                            />
                          ) : (
                            <Typography color="textSecondary">No numeric data logged yet.</Typography>
                          )}
                        </Box>
                      </Collapse>

                      {/* Dynamic Logs */}
                      <Collapse in={expandedLogsRow === item._id} timeout="auto" unmountOnExit>
                        <Box sx={{ m: 3 }}>
                          <Typography variant="h6" gutterBottom>
                            Parameter Logs - {item.name}
                          </Typography>

                          {item.customParameters?.length === 0 ? (
                            <Typography color="textSecondary">No parameters defined yet.</Typography>
                          ) : parameters[item._id]?.length > 0 ? (
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell><strong>Date/Time</strong></TableCell>
                                  {item.customParameters.map((param) => (
                                    <TableCell key={param.name}>
                                      <strong>{param.label || param.name}{param.unit ? ` (${param.unit})` : ''}</strong>
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {parameters[item._id].map((log, idx) => (
                                  <TableRow key={idx} hover>
                                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                                    {item.customParameters.map((param) => (
                                      <TableCell key={param.name}>
                                        {log.values?.[param.name] !== undefined ? log.values[param.name] : '-'}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <Typography color="textSecondary">No logs yet. Click "Log" to add the first entry!</Typography>
                          )}
                        </Box>
                      </Collapse>

                      {/* Gallery Section */}
                      <Collapse in={expandedGalleryRow === item._id} timeout="auto" unmountOnExit>
                        <Box sx={{ m: 3 }}>
                          <Typography variant="h6" gutterBottom>
                            Photo Gallery - {item.name}
                          </Typography>
                          {item.photos?.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                              {item.photos.map((photo, idx) => (
                                <Card key={idx} sx={{ width: 200 }}>
                                  <CardMedia
                                    component="img"
                                    height="140"
                                    image={photo.url}
                                    alt={`Photo ${idx + 1}`}
                                    sx={{ cursor: 'pointer', objectFit: 'cover' }}
                                    onClick={() => window.open(photo.url, '_blank')}
                                  />
                                  <CardContent sx={{ py: 1 }}>
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                      {photo.caption || 'No caption'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {photo.uploadedAt ? new Date(photo.uploadedAt).toLocaleString() : 'No date'}
                                    </Typography>
                                  </CardContent>
                                  <CardActions sx={{ justifyContent: 'flex-end', py: 0 }}>
                                    <IconButton size="small" color="error" onClick={() => deletePhoto(item._id, idx)}>
                                      <CloseIcon fontSize="small" />
                                    </IconButton>
                                  </CardActions>
                                </Card>
                              ))}
                            </Box>
                          ) : (
                            <Typography color="textSecondary">No photos yet. Use camera to add!</Typography>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Forms */}
      <EquipmentForm
        open={openEquipmentForm}
        onClose={() => setOpenEquipmentForm(false)}
        onSaved={fetchEquipment}
        equipmentToEdit={editingItem}
        facilities={facilities}
      />

      <ParameterForm
        open={openParameterForm}
        onClose={() => setOpenParameterForm(false)}
        equipmentId={selectedEquipmentId}
        onAdded={() => fetchParameters(selectedEquipmentId)}
      />

      {/* Parameter Logging Modal */}
      <ParameterLogForm
        open={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        equipment={selectedEquipmentForLog}
        onLogSaved={(newLog) => {
          if (selectedEquipmentForLog) {
            fetchParameters(selectedEquipmentForLog._id);
          }
          alert('Parameter log saved successfully!');
        }}
      />

      {/* Camera Modal */}
      <Dialog 
        open={openCameraModal} 
        onClose={() => {
          setOpenCameraModal(false);
          if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
          }
        }} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Camera - {selectedCameraEquipment?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ 
            position: 'relative', 
            width: '100%', 
            height: '480px', 
            background: '#000', 
            borderRadius: 2, 
            overflow: 'hidden', 
            mb: 2 
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480" />
          </Box>
          
          <TextField
            fullWidth
            label="Photo Caption (Optional)"
            value={photoCaption}
            onChange={(e) => setPhotoCaption(e.target.value)}
            placeholder="Enter a description for this photo..."
            variant="outlined"
            sx={{ mb: 2 }}
          />
          
          {uploading && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="body2" color="primary">Uploading...</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenCameraModal(false);
              if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={capturePhoto} 
            disabled={uploading || !selectedCameraEquipment}
          >
            {uploading ? 'Capturing...' : 'Capture & Save Photo'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EquipmentTable;