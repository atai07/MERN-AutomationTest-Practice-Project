import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const resetUserPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myevents');
    console.log('MongoDB Connected Successfully');

    const email = 'abby.jessica55+1@gmail.com';
    const newPassword = 'Password123!'; // Meets all validation requirements
    
    // Find the user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`User with email ${email} not found in database.`);
      process.exit(1);
    }

    console.log(`Found user: ${user.email}`);
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the password directly
    await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );
    
    console.log('\n✓ Password has been reset successfully.');
    console.log(`New password: ${newPassword}`);
    console.log('\nUser can now login with this password.');
    
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetUserPassword();
