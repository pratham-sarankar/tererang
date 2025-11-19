// backend/setup-admin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import connectDB from './config/db.js';

// Load environment variables
dotenv.config({ path: '.env' });

// Connect to database
connectDB();

const setupAdmin = async () => {
    try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne();
        if (existingAdmin) {
            console.log('Admin already exists:');
            console.log(`Username: ${existingAdmin.username}`);
            console.log('Use the existing credentials to login.');
            process.exit(0);
        }

        // Create default admin
        const adminData = {
            username: 'admin',
            password: 'admin123'  // Change this to a secure password
        };

        const admin = new Admin(adminData);
        await admin.save();

        console.log('✅ Admin user created successfully!');
        console.log('Login credentials:');
        console.log(`Username: ${adminData.username}`);
        console.log(`Password: ${adminData.password}`);
        console.log('\n⚠️  Please change the password after first login for security!');

    } catch (error) {
        console.error('❌ Error setting up admin:', error.message);
    } finally {
        mongoose.connection.close();
    }
};

setupAdmin();