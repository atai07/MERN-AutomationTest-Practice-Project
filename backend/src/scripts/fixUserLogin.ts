import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const fixUserLogin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myevents');
    console.log('MongoDB Connected Successfully');

    const email = 'abby.jessica55+1@gmail.com';
    
    // Try to find the user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      console.log(`User with email ${email} not found in database.`);
      console.log('\nSearching for similar emails...');
      
      // Search for similar emails
      const allUsers = await User.find({ email: /abby\.jessica/ });
      if (allUsers.length > 0) {
        console.log('Found similar users:');
        allUsers.forEach(u => {
          console.log(`  - ${u.email} (Active: ${u.isActive}, Role: ${u.role})`);
        });
      } else {
        console.log('No similar users found.');
      }
    } else {
      console.log(`Found user: ${user.email}`);
      console.log(`User details:`);
      console.log(`  - Name: ${user.firstName} ${user.lastName}`);
      console.log(`  - Email: ${user.email}`);
      console.log(`  - Active: ${user.isActive}`);
      console.log(`  - Role: ${user.role}`);
      console.log(`  - Subscription: ${user.subscriptionTier}`);
      console.log(`  - Has password: ${user.password ? 'Yes' : 'No'}`);
      
      if (!user.isActive) {
        console.log('\n⚠️  User account is INACTIVE. Activating...');
        user.isActive = true;
        await user.save();
        console.log('✓ User account has been activated.');
      } else {
        console.log('\n✓ User account is already active.');
      }
      
      console.log('\nUser should now be able to login.');
    }
    
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixUserLogin();
