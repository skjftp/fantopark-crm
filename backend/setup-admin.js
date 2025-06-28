require('dotenv').config();
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.GOOGLE_CLOUD_PROJECT
});

const db = admin.firestore();

async function setupInitialAdmin() {
  try {
    const email = 'admin@fantopark.com';
    const password = 'admin123';
    
    // Check if admin exists
    const existingUser = await db.collection('users').where('email', '==', email).get();
    if (!existingUser.empty) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const userRef = await db.collection('users').add({
      email,
      password: hashedPassword,
      name: 'Admin User',
      role: 'super_admin',
      department: 'Administration',
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Admin user created successfully');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User ID:', userRef.id);
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin:', error);
    process.exit(1);
  }
}

setupInitialAdmin();
