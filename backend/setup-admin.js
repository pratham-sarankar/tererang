// backend/setup-admin.js
import mongoose from 'mongoose';
import './config/env.js';
import Admin from './models/Admin.js';
import connectDB from './config/db.js';

// Connect to database
connectDB();

const setupAdmin = async () => {
    try {
        const adminData = {
            username: process.env.ADMIN_USERNAME || 'admin',
            password: process.env.ADMIN_PASSWORD || 'admin123'
        };

        if (adminData.password.length < 6) {
            throw new Error('ADMIN_PASSWORD must be at least 6 characters long');
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: adminData.username });
        if (existingAdmin) {
            if (process.env.RESET_ADMIN_PASSWORD === 'true') {
                existingAdmin.password = adminData.password;
                await existingAdmin.save();

                console.log('Admin password reset successfully.');
                console.log(`Username: ${existingAdmin.username}`);
                console.log('Use the configured ADMIN_PASSWORD to login.');
                process.exit(0);
            }

            console.log('Admin already exists:');
            console.log(`Username: ${existingAdmin.username}`);
            console.log('Use the existing credentials to login, or set RESET_ADMIN_PASSWORD=true and ADMIN_PASSWORD to reset it.');
            process.exit(0);
        }

        // Create default admin
        const admin = new Admin(adminData);
        await admin.save();

        console.log('Admin user created successfully.');
        console.log('Login credentials:');
        console.log(`Username: ${adminData.username}`);
        console.log('Password: value from ADMIN_PASSWORD, or admin123 if unset');
        console.log('\nPlease change the password after first login for security.');

    } catch (error) {
        console.error('Error setting up admin:', error.message);
    } finally {
        mongoose.connection.close();
    }
};

setupAdmin();
