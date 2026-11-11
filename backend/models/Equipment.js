const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Equipment name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },

    type: {
      type: String,
      required: [true, 'Equipment type is required'],
      trim: true,
      maxlength: [50, 'Type cannot exceed 50 characters']
    },

    status: {
      type: String,
      enum: ['Operational', 'Maintenance', 'Down', 'Standby', 'Under Repair'],
      default: 'Operational'
    },

    lastMaintenance: {
      type: Date
    },

    nextMaintenance: {
      type: Date
    },

    maintenanceReport: {
      type: String,
      default: '',
      maxlength: [1000, 'Report cannot exceed 1000 characters']
    },

    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      required: [true, 'Facility is required']
    },

    photos: [
      {
        url: {
          type: String,
          required: [true, 'Photo URL is required']
        },
        caption: {
          type: String,
          default: '',
          maxlength: [200, 'Caption cannot exceed 200 characters']
        },
        uploadedAt: {
          type: Date,
          default: Date.now
        },
        filename: String,
        mimetype: String,
        size: Number
      }
    ],

    // ── NEW: Custom parameters that must/can be logged for this specific equipment ──
    customParameters: [
      {
        name: {
          type: String,
          required: [true, 'Parameter name is required'],
          trim: true,
          maxlength: [100, 'Parameter name cannot exceed 100 characters']
        },

        label: {
          type: String,
          trim: true,
          maxlength: [120, 'Label cannot exceed 120 characters'],
          default: function () {
            return this.name; // default to name if no label is provided
          }
        },

        type: {
          type: String,
          enum: ['number', 'text', 'select', 'checkbox', 'date'],
          required: [true, 'Parameter type is required']
        },

        unit: {
          type: String,
          trim: true,
          maxlength: [20, 'Unit cannot exceed 20 characters'],
          default: ''
        },

        required: {
          type: Boolean,
          default: false
        },

        options: [
          {
            type: String,
            trim: true,
            maxlength: [100, 'Option cannot exceed 100 characters']
          }
        ], // only used when type = 'select'

        min: {
          type: Number,
          default: undefined
        }, // only meaningful for type = 'number'

        max: {
          type: Number,
          default: undefined
        }, // only meaningful for type = 'number'

        defaultValue: mongoose.Schema.Types.Mixed // can be string, number, boolean, date string, etc.
      }
    ]
  },
  {
    timestamps: true
  }
);

// Indexes for performance
equipmentSchema.index({ facility: 1 });
equipmentSchema.index({ status: 1 });
equipmentSchema.index({ nextMaintenance: 1 });
equipmentSchema.index({ 'customParameters.name': 1 }); // optional – helps if you ever query by parameter name

module.exports = mongoose.model('Equipment', equipmentSchema);