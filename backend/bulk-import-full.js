// backend/bulk-import-full.js
require('dotenv').config();
const mongoose = require('mongoose');
const Equipment = require('./models/Equipment');
const Facility = require('./models/Facility');

const facilitiesData = [
  { name: "Compressed Air System", description: "Air compressors and dryers" },
  { name: "Closed Cooling Water System", description: "CCW pumps and coolers" },
  { name: "Condensate Water System", description: "Condensate pumps and tanks" },
  { name: "Steam Turbine Lube Oil System", description: "Lube oil system for ST" },
  { name: "Steam Turbine Control Oil System", description: "Control oil system for ST" },
  { name: "Feedwater System", description: "Feedwater pumps" },
  { name: "HRSG System", description: "Heat Recovery Steam Generator" },
  { name: "Liquid Fuel Filtering Skid", description: "DFO & LCO filtering" },
  { name: "Gas Fuel Conditioning System", description: "Gas fuel system" },
  { name: "Raw Water & Service Water System", description: "Raw and service water" },
  { name: "FOTP (Fuel Oil Treatment Plant)", description: "Fuel oil treatment" },
  { name: "Fire Fighting System", description: "Fire fighting pumps" },
  { name: "Tank Farm & Unloading Bay", description: "Fuel storage and unloading" },
  { name: "Electrical & Distribution Rooms", description: "MCC, UPS, Battery rooms" },
  { name: "Transformers", description: "All power transformers" },
  { name: "ACC (Air Cooled Condenser)", description: "ACC fans" }
];

const equipmentData = [
  // 1. Compressed Air System
  {
    name: "#1 Air Compressor",
    type: "Air Compressor",
    facility: "Compressed Air System",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] },
      { name: "Enclosure", type: "select", required: true, options: ["Norm", "Abnorm"] }
    ]
  },
  {
    name: "#2 Air Compressor",
    type: "Air Compressor",
    facility: "Compressed Air System",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] },
      { name: "Enclosure", type: "select", required: true, options: ["Norm", "Abnorm"] }
    ]
  },
  {
    name: "#1 Air Dryer",
    type: "Air Dryer",
    facility: "Compressed Air System",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] }
    ]
  },
  {
    name: "#2 Air Dryer",
    type: "Air Dryer",
    facility: "Compressed Air System",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] }
    ]
  },

  // 2. Closed Cooling Water System
  {
    name: "CCW Pump",
    type: "Pump",
    facility: "Closed Cooling Water System",
    customParameters: [
      { name: "Pump Status", type: "select", required: true, options: ["Run", "Standby"] },
      { name: "Inlet Pressure", type: "number", unit: "barg" },
      { name: "Outlet Pressure", type: "number", unit: "barg" }
    ]
  },
  {
    name: "#1 CCWP Non-Drive End Bearing",
    type: "Bearing",
    facility: "Closed Cooling Water System",
    customParameters: [
      { name: "Oil Level", type: "select", required: true, options: ["OK", "Low", "High"] }
    ]
  },
  {
    name: "#1 CCWP Drive End Bearing",
    type: "Bearing",
    facility: "Closed Cooling Water System",
    customParameters: [
      { name: "Oil Level", type: "select", required: true, options: ["OK", "Low", "High"] }
    ]
  },
  {
    name: "#2 CCWP Non-Drive End Bearing",
    type: "Bearing",
    facility: "Closed Cooling Water System",
    customParameters: [
      { name: "Oil Level", type: "select", required: true, options: ["OK", "Low", "High"] }
    ]
  },
  {
    name: "#2 CCWP Drive End Bearing",
    type: "Bearing",
    facility: "Closed Cooling Water System",
    customParameters: [
      { name: "Oil Level", type: "select", required: true, options: ["OK", "Low", "High"] }
    ]
  },
  {
    name: "Fin Fans Row 1",
    type: "Fan",
    facility: "Closed Cooling Water System",
    customParameters: [
      { name: "Running", type: "checkbox", required: false },
      { name: "Inlet Pressure", type: "number", unit: "barg" },
      { name: "Inlet Temp", type: "number", unit: "°C" },
      { name: "Outlet Pressure", type: "number", unit: "barg" },
      { name: "Outlet Temp", type: "number", unit: "°C" }
    ]
  },
  {
    name: "Fin Fans Row 2",
    type: "Fan",
    facility: "Closed Cooling Water System",
    customParameters: [
      { name: "Running", type: "checkbox", required: false },
      { name: "Inlet Pressure", type: "number", unit: "barg" },
      { name: "Inlet Temp", type: "number", unit: "°C" },
      { name: "Outlet Pressure", type: "number", unit: "barg" },
      { name: "Outlet Temp", type: "number", unit: "°C" }
    ]
  },
  {
    name: "Fin Fans Row 3",
    type: "Fan",
    facility: "Closed Cooling Water System",
    customParameters: [
      { name: "Running", type: "checkbox", required: false },
      { name: "Inlet Pressure", type: "number", unit: "barg" },
      { name: "Inlet Temp", type: "number", unit: "°C" },
      { name: "Outlet Pressure", type: "number", unit: "barg" },
      { name: "Outlet Temp", type: "number", unit: "°C" }
    ]
  },
  {
    name: "Fin Fans Row 4",
    type: "Fan",
    facility: "Closed Cooling Water System",
    customParameters: [
      { name: "Running", type: "checkbox", required: false },
      { name: "Inlet Pressure", type: "number", unit: "barg" },
      { name: "Inlet Temp", type: "number", unit: "°C" },
      { name: "Outlet Pressure", type: "number", unit: "barg" },
      { name: "Outlet Temp", type: "number", unit: "°C" }
    ]
  },
  {
    name: "ST Generator Air Cooler",
    type: "Cooler",
    facility: "Closed Cooling Water System",
    customParameters: [
      { name: "Inlet Pressure", type: "number", unit: "barg" },
      { name: "Inlet Temp", type: "number", unit: "°C" },
      { name: "Outlet Pressure", type: "number", unit: "barg" },
      { name: "Outlet Temp", type: "number", unit: "°C" }
    ]
  },
  {
    name: "GT Generator Air Cooler",
    type: "Cooler",
    facility: "Closed Cooling Water System",
    customParameters: [
      { name: "Inlet Pressure", type: "number", unit: "barg" },
      { name: "Inlet Temp", type: "number", unit: "°C" },
      { name: "Outlet Pressure", type: "number", unit: "barg" },
      { name: "Outlet Temp", type: "number", unit: "°C" }
    ]
  },
  {
    name: "HRSG Air Cooler",
    type: "Cooler",
    facility: "Closed Cooling Water System",
    customParameters: [
      { name: "Inlet Pressure", type: "number", unit: "barg" },
      { name: "Inlet Temp", type: "number", unit: "°C" },
      { name: "Outlet Pressure", type: "number", unit: "barg" },
      { name: "Outlet Temp", type: "number", unit: "°C" }
    ]
  },
  {
    name: "Lube Oil Cooler",
    type: "Cooler",
    facility: "Closed Cooling Water System",
    customParameters: [
      { name: "Inlet Pressure", type: "number", unit: "barg" },
      { name: "Inlet Temp", type: "number", unit: "°C" },
      { name: "Outlet Pressure", type: "number", unit: "barg" },
      { name: "Outlet Temp", type: "number", unit: "°C" }
    ]
  },

  // 3. Condensate Water System
  {
    name: "Condensate Pump",
    type: "Pump",
    facility: "Condensate Water System",
    customParameters: [
      { name: "Pump Status", type: "select", required: true, options: ["Run", "Standby"] },
      { name: "Inlet Pressure", type: "number", unit: "barg" },
      { name: "Outlet Pressure", type: "number", unit: "barg" },
      { name: "Oil Level", type: "select", options: ["OK", "Low", "High"] }
    ]
  },
  {
    name: "Polishing Filter",
    type: "Filter",
    facility: "Condensate Water System",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] }
    ]
  },
  {
    name: "Condensate Tank",
    type: "Tank",
    facility: "Condensate Water System",
    customParameters: [
      { name: "Level", type: "number", unit: "% or mm" }
    ]
  },
  {
    name: "ACC Drain Pot",
    type: "Pot",
    facility: "Condensate Water System",
    customParameters: [
      { name: "Level", type: "number", unit: "% or mm" }
    ]
  },

  // 4. Steam Turbine Lube Oil System
  {
    name: "Lube Oil Pump",
    type: "Pump",
    facility: "Steam Turbine Lube Oil System",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] },
      { name: "Outlet Pressure", type: "number", unit: "barg" }
    ]
  },
  {
    name: "Lube Oil Cooler",
    type: "Cooler",
    facility: "Steam Turbine Lube Oil System",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] }
    ]
  },
  {
    name: "Lube Clarifier",
    type: "Clarifier",
    facility: "Steam Turbine Lube Oil System",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["ON", "OFF"] }
    ]
  },
  {
    name: "ST Front Bearing",
    type: "Bearing",
    facility: "Steam Turbine Lube Oil System",
    customParameters: [
      { name: "Inlet Oil Pressure", type: "number", unit: "barg" },
      { name: "Return Oil Temperature", type: "number", unit: "°C" },
      { name: "Jacking Oil Pressure", type: "number", unit: "barg" }
    ]
  },
  {
    name: "ST Rear Bearing",
    type: "Bearing",
    facility: "Steam Turbine Lube Oil System",
    customParameters: [
      { name: "Inlet Oil Pressure", type: "number", unit: "barg" },
      { name: "Return Oil Temperature", type: "number", unit: "°C" },
      { name: "Jacking Oil Pressure", type: "number", unit: "barg" }
    ]
  },
  {
    name: "Lube Oil Extractor Fan",
    type: "Fan",
    facility: "Steam Turbine Lube Oil System",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] }
    ]
  },
  {
    name: "Jacking Oil Pump",
    type: "Pump",
    facility: "Steam Turbine Lube Oil System",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] },
      { name: "Outlet Pressure", type: "number", unit: "barg" }
    ]
  },

  // 5. Steam Turbine Control Oil System
  {
    name: "Control Oil Pump",
    type: "Pump",
    facility: "Steam Turbine Control Oil System",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] },
      { name: "Outlet Pressure", type: "number", unit: "barg" }
    ]
  },
  {
    name: "Control Oil Tank",
    type: "Tank",
    facility: "Steam Turbine Control Oil System",
    customParameters: [
      { name: "Level", type: "number", unit: "% or mm" }
    ]
  },
  {
    name: "Control Oil Purification Unit",
    type: "Purifier",
    facility: "Steam Turbine Control Oil System",
    customParameters: [
      { name: "Status", type: "select", options: ["OK", "Not OK"] }
    ]
  },
  {
    name: "Control Oil Filter",
    type: "Filter",
    facility: "Steam Turbine Control Oil System",
    customParameters: [
      { name: "Status", type: "select", options: ["OK", "Not OK"] }
    ]
  },
  {
    name: "Control Oil Recirc. Pump",
    type: "Pump",
    facility: "Steam Turbine Control Oil System",
    customParameters: [
      { name: "Status", type: "select", options: ["Run", "Standby", "Maint"] }
    ]
  },
  {
    name: "HP Control Oil Pressure",
    type: "Pressure Sensor",
    facility: "Steam Turbine Control Oil System",
    customParameters: [
      { name: "Pressure", type: "number", unit: "barg" }
    ]
  },
  {
    name: "LP Control Oil Pressure",
    type: "Pressure Sensor",
    facility: "Steam Turbine Control Oil System",
    customParameters: [
      { name: "Pressure", type: "number", unit: "barg" }
    ]
  },

  // 6. Feedwater System
  {
    name: "Feedwater Pump",
    type: "Pump",
    facility: "Feedwater System",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] },
      { name: "Inlet Pressure", type: "number", unit: "barg" },
      { name: "Outlet Pressure", type: "number", unit: "barg" },
      { name: "Bearing Temperature", type: "number", unit: "°C" },
      { name: "Oil Level", type: "select", options: ["OK", "Low", "High"] }
    ]
  },

  // 7. HRSG System
  {
    name: "LP Drum",
    type: "Drum",
    facility: "HRSG System",
    customParameters: [
      { name: "Level", type: "number", unit: "mm" },
      { name: "Pressure", type: "number", unit: "barg" }
    ]
  },
  {
    name: "HP Drum",
    type: "Drum",
    facility: "HRSG System",
    customParameters: [
      { name: "Level", type: "number", unit: "mm" },
      { name: "Pressure", type: "number", unit: "barg" }
    ]
  },
  {
    name: "LP Economizer",
    type: "Economizer",
    facility: "HRSG System",
    customParameters: [
      { name: "Pressure", type: "number", unit: "barg" },
      { name: "Temperature", type: "number", unit: "°C" }
    ]
  },
  {
    name: "HP Economizer",
    type: "Economizer",
    facility: "HRSG System",
    customParameters: [
      { name: "Pressure", type: "number", unit: "barg" },
      { name: "Temperature", type: "number", unit: "°C" }
    ]
  },
  {
    name: "Main Steam",
    type: "Line",
    facility: "HRSG System",
    customParameters: [
      { name: "Pressure", type: "number", unit: "barg" },
      { name: "Temperature", type: "number", unit: "°C" }
    ]
  },
  {
    name: "Superheater",
    type: "Superheater",
    facility: "HRSG System",
    customParameters: [
      { name: "Pressure", type: "number", unit: "barg" },
      { name: "Temperature", type: "number", unit: "°C" }
    ]
  },
  {
    name: "IBD Drain Pump",
    type: "Pump",
    facility: "HRSG System",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] }
    ]
  },
  {
    name: "Soot Blower System",
    type: "System",
    facility: "HRSG System",
    customParameters: [
      { name: "Status", type: "select", options: ["OK", "Not OK"] }
    ]
  },

  // 8. Liquid Fuel Filtering Skid (DFO & LCO)
  {
    name: "DFO Filtering Skid",
    type: "Skid",
    facility: "Liquid Fuel Filtering Skid",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] }
    ]
  },
  {
    name: "LCO Filtering Skid",
    type: "Skid",
    facility: "Liquid Fuel Filtering Skid",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] }
    ]
  },
  {
    name: "LCO Heater",
    type: "Heater",
    facility: "Liquid Fuel Filtering Skid",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["ON", "OFF"] }
    ]
  },
  {
    name: "Transfer Valve",
    type: "Valve",
    facility: "Liquid Fuel Filtering Skid",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Normal", "Abnormal"] }
    ]
  },

  // 9. Gas Fuel Conditioning & Regulating System
  {
    name: "Gas Conditioning Filter",
    type: "Filter",
    facility: "Gas Fuel Conditioning System",
    customParameters: [
      { name: "Differential Pressure", type: "number", unit: "barg" },
      { name: "Status", type: "select", required: true, options: ["OK", "Not OK"] }
    ]
  },
  {
    name: "Gas Conditioning Electric Heater",
    type: "Heater",
    facility: "Gas Fuel Conditioning System",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["ON", "OFF"] },
      { name: "Temperature", type: "number", unit: "°C" }
    ]
  },
  {
    name: "Gas Supply",
    type: "Line",
    facility: "Gas Fuel Conditioning System",
    customParameters: [
      { name: "Pressure", type: "number", unit: "barg" }
    ]
  },

  // 10. Raw Water & Service Water System
  {
    name: "Raw Water Pump",
    type: "Pump",
    facility: "Raw Water & Service Water System",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] },
      { name: "Discharge Pressure", type: "number", unit: "barg" }
    ]
  },
  {
    name: "Service Water Pump",
    type: "Pump",
    facility: "Raw Water & Service Water System",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] },
      { name: "Discharge Pressure", type: "number", unit: "barg" }
    ]
  },
  {
    name: "Potable Water Pump",
    type: "Pump",
    facility: "Raw Water & Service Water System",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] }
    ]
  },
  {
    name: "Demin Water Pump",
    type: "Pump",
    facility: "Raw Water & Service Water System",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] }
    ]
  },

  // 11. FOTP (Fuel Oil Treatment Plant)
  {
    name: "Demulsifier Pump",
    type: "Pump",
    facility: "FOTP (Fuel Oil Treatment Plant)",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] }
    ]
  },
  {
    name: "FOTP Train 2",
    type: "Train",
    facility: "FOTP (Fuel Oil Treatment Plant)",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] }
    ]
  },
  {
    name: "Air Compressor & Dryer",
    type: "Compressor",
    facility: "FOTP (Fuel Oil Treatment Plant)",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] }
    ]
  },
  {
    name: "Nitrogen Generator",
    type: "Generator",
    facility: "FOTP (Fuel Oil Treatment Plant)",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["ON", "OFF"] },
      { name: "Purity", type: "number", unit: "%" }
    ]
  },

  // 12. Fire Fighting System
  {
    name: "Jockey Fire Fighting Pump",
    type: "Pump",
    facility: "Fire Fighting System",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] }
    ]
  },
  {
    name: "Main Fire Fighting Pump",
    type: "Pump",
    facility: "Fire Fighting System",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] }
    ]
  },
  {
    name: "Diesel Fire Fighting Pump",
    type: "Pump",
    facility: "Fire Fighting System",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] }
    ]
  },
  {
    name: "Fire Fighting System Pressure",
    type: "Pressure Sensor",
    facility: "Fire Fighting System",
    customParameters: [
      { name: "Pressure", type: "number", unit: "barg" }
    ]
  },
  {
    name: "Diesel Fuel Tank",
    type: "Tank",
    facility: "Fire Fighting System",
    customParameters: [
      { name: "Level", type: "number", unit: "% or mm" }
    ]
  },
  {
    name: "Expansion Tank",
    type: "Tank",
    facility: "Fire Fighting System",
    customParameters: [
      { name: "Pressure", type: "number", unit: "barg" }
    ]
  },

  // 13. Tank Farm & Unloading Bay
  {
    name: "Untreated LCO Tank",
    type: "Tank",
    facility: "Tank Farm & Unloading Bay",
    customParameters: [
      { name: "Level", type: "number", unit: "% or mm" },
      { name: "Temperature", type: "number", unit: "°C" }
    ]
  },
  {
    name: "Treated LCO Tank",
    type: "Tank",
    facility: "Tank Farm & Unloading Bay",
    customParameters: [
      { name: "Level", type: "number", unit: "% or mm" },
      { name: "Temperature", type: "number", unit: "°C" }
    ]
  },
  {
    name: "Certified LCO Tank",
    type: "Tank",
    facility: "Tank Farm & Unloading Bay",
    customParameters: [
      { name: "Level", type: "number", unit: "% or mm" },
      { name: "Temperature", type: "number", unit: "°C" }
    ]
  },
  {
    name: "DFO Tank",
    type: "Tank",
    facility: "Tank Farm & Unloading Bay",
    customParameters: [
      { name: "Level", type: "number", unit: "% or mm" },
      { name: "Temperature", type: "number", unit: "°C" }
    ]
  },
  {
    name: "Unloading Bay",
    type: "Bay",
    facility: "Tank Farm & Unloading Bay",
    customParameters: [
      { name: "Grounding", type: "select", required: true, options: ["OK", "Not OK"] },
      { name: "Physical condition", type: "select", required: true, options: ["OK", "Not OK"] },
      { name: "Spill containment", type: "select", options: ["OK", "Not OK"] }
    ]
  },

  // 14. Electrical & Distribution Rooms (one entry per room type)
  {
    name: "FOTP Distribution Room",
    type: "Room",
    facility: "Electrical & Distribution Rooms",
    customParameters: [
      { name: "MCC bus voltage", type: "select", required: true, options: ["OK", "Not OK"] },
      { name: "Room lighting", type: "select", required: true, options: ["OK", "Not OK"] },
      { name: "Room condition", type: "select", required: true, options: ["OK", "Not OK"] }
    ]
  },
  {
    name: "ACC Distribution Room",
    type: "Room",
    facility: "Electrical & Distribution Rooms",
    customParameters: [
      { name: "MCC bus voltage", type: "select", required: true, options: ["OK", "Not OK"] },
      { name: "Room lighting", type: "select", required: true, options: ["OK", "Not OK"] },
      { name: "Room condition", type: "select", required: true, options: ["OK", "Not OK"] }
    ]
  },
  {
    name: "Main Building Distribution Room",
    type: "Room",
    facility: "Electrical & Distribution Rooms",
    customParameters: [
      { name: "MCC bus voltage", type: "select", required: true, options: ["OK", "Not OK"] },
      { name: "Room lighting", type: "select", required: true, options: ["OK", "Not OK"] },
      { name: "Room condition", type: "select", required: true, options: ["OK", "Not OK"] }
    ]
  },
  {
    name: "WTP Distribution Room",
    type: "Room",
    facility: "Electrical & Distribution Rooms",
    customParameters: [
      { name: "MCC bus voltage", type: "select", required: true, options: ["OK", "Not OK"] },
      { name: "Room lighting", type: "select", required: true, options: ["OK", "Not OK"] },
      { name: "Room condition", type: "select", required: true, options: ["OK", "Not OK"] }
    ]
  },
  {
    name: "GIS Control Room",
    type: "Room",
    facility: "Electrical & Distribution Rooms",
    customParameters: [
      { name: "Control panels", type: "select", required: true, options: ["OK", "Not OK"] },
      { name: "Room lighting", type: "select", required: true, options: ["OK", "Not OK"] },
      { name: "Room condition", type: "select", required: true, options: ["OK", "Not OK"] }
    ]
  },
  {
    name: "Battery Room",
    type: "Room",
    facility: "Electrical & Distribution Rooms",
    customParameters: [
      { name: "Batteries", type: "select", required: true, options: ["OK", "Not OK"] },
      { name: "Room lighting", type: "select", required: true, options: ["OK", "Not OK"] },
      { name: "Room condition", type: "select", required: true, options: ["OK", "Not OK"] }
    ]
  },
  {
    name: "UPS Room",
    type: "Room",
    facility: "Electrical & Distribution Rooms",
    customParameters: [
      { name: "UPS", type: "select", required: true, options: ["OK", "Not OK"] },
      { name: "Charger panels", type: "select", required: true, options: ["OK", "Not OK"] },
      { name: "Room condition", type: "select", required: true, options: ["OK", "Not OK"] }
    ]
  },
  {
    name: "MCC Room",
    type: "Room",
    facility: "Electrical & Distribution Rooms",
    customParameters: [
      { name: "MCC bus voltage", type: "select", required: true, options: ["OK", "Not OK"] },
      { name: "Room lighting", type: "select", required: true, options: ["OK", "Not OK"] },
      { name: "Room condition", type: "select", required: true, options: ["OK", "Not OK"] }
    ]
  },

  // 15. Transformers
  {
    name: "ST Excitation Transformer",
    type: "Transformer",
    facility: "Transformers",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] },
      { name: "Fans state", type: "select", required: true, options: ["Run", "Standby", "Maint"] },
      { name: "Oil temperature", type: "number", unit: "°C" },
      { name: "Winding temperature", type: "number", unit: "°C" },
      { name: "Oil level", type: "select", required: true, options: ["OK", "Not OK"] },
      { name: "Sound", type: "select", required: true, options: ["Norm", "Abnorm"] },
      { name: "Surroundings", type: "select", required: true, options: ["Clean", "Not clean"] },
      { name: "Tap changer position", type: "text" },
      { name: "Breather silica gel", type: "select", required: true, options: ["OK", "Not OK"] }
    ]
  },
  {
    name: "ST Unit Aux Transformer",
    type: "Transformer",
    facility: "Transformers",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] },
      { name: "Fans state", type: "select", required: true, options: ["Run", "Standby", "Maint"] },
      { name: "Oil temperature", type: "number", unit: "°C" },
      { name: "Winding temperature", type: "number", unit: "°C" },
      { name: "Oil level", type: "select", required: true, options: ["OK", "Not OK"] },
      { name: "Sound", type: "select", required: true, options: ["Norm", "Abnorm"] },
      { name: "Surroundings", type: "select", required: true, options: ["Clean", "Not clean"] },
      { name: "Tap changer position", type: "text" },
      { name: "Breather silica gel", type: "select", required: true, options: ["OK", "Not OK"] }
    ]
  },
  {
    name: "ST Unit Step Up Transformer",
    type: "Transformer",
    facility: "Transformers",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] },
      { name: "Fans state", type: "select", required: true, options: ["Run", "Standby", "Maint"] },
      { name: "Oil temperature", type: "number", unit: "°C" },
      { name: "Winding temperature", type: "number", unit: "°C" },
      { name: "Oil level", type: "select", required: true, options: ["OK", "Not OK"] },
      { name: "Sound", type: "select", required: true, options: ["Norm", "Abnorm"] },
      { name: "Surroundings", type: "select", required: true, options: ["Clean", "Not clean"] },
      { name: "Tap changer position", type: "text" },
      { name: "Breather silica gel", type: "select", required: true, options: ["OK", "Not OK"] }
    ]
  },
  {
    name: "GT Excitation Transformer",
    type: "Transformer",
    facility: "Transformers",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] },
      { name: "Fans state", type: "select", required: true, options: ["Run", "Standby", "Maint"] },
      { name: "Oil temperature", type: "number", unit: "°C" },
      { name: "Winding temperature", type: "number", unit: "°C" },
      { name: "Oil level", type: "select", required: true, options: ["OK", "Not OK"] },
      { name: "Sound", type: "select", required: true, options: ["Norm", "Abnorm"] },
      { name: "Surroundings", type: "select", required: true, options: ["Clean", "Not clean"] },
      { name: "Tap changer position", type: "text" },
      { name: "Breather silica gel", type: "select", required: true, options: ["OK", "Not OK"] }
    ]
  },
  {
    name: "GT Unit Aux Transformer",
    type: "Transformer",
    facility: "Transformers",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] },
      { name: "Fans state", type: "select", required: true, options: ["Run", "Standby", "Maint"] },
      { name: "Oil temperature", type: "number", unit: "°C" },
      { name: "Winding temperature", type: "number", unit: "°C" },
      { name: "Oil level", type: "select", required: true, options: ["OK", "Not OK"] },
      { name: "Sound", type: "select", required: true, options: ["Norm", "Abnorm"] },
      { name: "Surroundings", type: "select", required: true, options: ["Clean", "Not clean"] },
      { name: "Tap changer position", type: "text" },
      { name: "Breather silica gel", type: "select", required: true, options: ["OK", "Not OK"] }
    ]
  },
  {
    name: "GT Unit Step Up Transformer",
    type: "Transformer",
    facility: "Transformers",
    customParameters: [
      { name: "Status", type: "select", required: true, options: ["Run", "Standby", "Maint"] },
      { name: "Fans state", type: "select", required: true, options: ["Run", "Standby", "Maint"] },
      { name: "Oil temperature", type: "number", unit: "°C" },
      { name: "Winding temperature", type: "number", unit: "°C" },
      { name: "Oil level", type: "select", required: true, options: ["OK", "Not OK"] },
      { name: "Sound", type: "select", required: true, options: ["Norm", "Abnorm"] },
      { name: "Surroundings", type: "select", required: true, options: ["Clean", "Not clean"] },
      { name: "Tap changer position", type: "text" },
      { name: "Breather silica gel", type: "select", required: true, options: ["OK", "Not OK"] }
    ]
  },

  // 16. ACC (Air Cooled Condenser)
  {
    name: "ACC Fan Row 1",
    type: "Fan",
    facility: "ACC (Air Cooled Condenser)",
    customParameters: [
      { name: "Oil Pressure", type: "number", unit: "barg or psi" }
    ]
  },
  {
    name: "ACC Fan Row 2",
    type: "Fan",
    facility: "ACC (Air Cooled Condenser)",
    customParameters: [
      { name: "Oil Pressure", type: "number", unit: "barg or psi" }
    ]
  },
  {
    name: "ACC Fan Row 3",
    type: "Fan",
    facility: "ACC (Air Cooled Condenser)",
    customParameters: [
      { name: "Oil Pressure", type: "number", unit: "barg or psi" }
    ]
  },
  {
    name: "ACC Fan Row 4",
    type: "Fan",
    facility: "ACC (Air Cooled Condenser)",
    customParameters: [
      { name: "Oil Pressure", type: "number", unit: "barg or psi" }
    ]
  }
];

async function bulkImport() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create or get facilities
    const facilityMap = {};
    for (const fac of facilitiesData) {
      let facility = await Facility.findOne({ name: fac.name });
      if (!facility) {
        facility = await Facility.create(fac);
        console.log(`Created facility: ${fac.name}`);
      }
      facilityMap[fac.name] = facility._id;
    }

    // Create equipment
    for (const eq of equipmentData) {
      const facilityId = facilityMap[eq.facility];
      if (!facilityId) {
        console.log(`Facility not found: ${eq.facility}`);
        continue;
      }

      const exists = await Equipment.findOne({ name: eq.name, facility: facilityId });
      if (!exists) {
        await Equipment.create({
          ...eq,
          facility: facilityId,
          status: "Operational" // default
        });
        console.log(`Created equipment: ${eq.name} in ${eq.facility}`);
      } else {
        console.log(`Equipment already exists: ${eq.name} in ${eq.facility}`);
      }
    }

    console.log('Full bulk import completed successfully!');
    console.log(`Total facilities created/used: ${facilitiesData.length}`);
    console.log(`Total equipment created/skipped: ${equipmentData.length}`);
    process.exit(0);
  } catch (err) {
    console.error('Bulk import failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

bulkImport();