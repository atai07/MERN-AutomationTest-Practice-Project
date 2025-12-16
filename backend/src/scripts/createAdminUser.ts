import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myevents');
    console.log('MongoDB Connected Successfully');

    const adminEmail = 'admin2025@myevent.com';
    const adminPassword = 'Password123$';
    
    // Check if user already exists
    let user = await User.findOne({ email: adminEmail.toLowerCase() }).select('+password');
    
    if (user) {
      console.log(`User with email ${adminEmail} already exists.`);
      console.log('Updating user to admin role and resetting password...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      // Update user to admin
      await User.updateOne(
        { _id: user._id },
        { 
          $set: { 
            role: 'admin',
            password: hashedPassword,
            isActive: true
          } 
        }
      );
      
      console.log('\n✓ User updated to admin successfully.');
    } else {
      console.log(`Creating new admin user: ${adminEmail}`);
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      // Create new admin user
      user = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail.toLowerCase(),
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        subscriptionTier: 'paid'
      });
      
      console.log('\n✓ Admin user created successfully.');
    }
    
    console.log('\n--- Admin Account Details ---');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Role: admin`);
    console.log('\nYou can now login with these credentials.');
    
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdminUser();
