// backend/models/Settings.js
import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    // Global discount percentage (0-100)
    globalDiscountPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    // Flag to enable/disable global discount
    globalDiscountEnabled: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({
            globalDiscountPercentage: 0,
            globalDiscountEnabled: false,
        });
    }
    return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
