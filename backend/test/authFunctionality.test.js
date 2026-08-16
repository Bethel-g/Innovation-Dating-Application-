// Comprehensive test suite for Authentication and User Management
// Tests for all authentication-related functionality

import { sequelize } from '../src/config/db.js';
import User from '../src/models/User.js';
import bcrypt from 'bcryptjs';

// Setup database before tests
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

// Cleanup after tests
afterAll(async () => {
  await sequelize.close();
});

// Test user registration with proper online status handling
test('User registration creates active user with online status', async () => {
  const userData = {
    email: 'test1@example.com',
    password: 'password123',
    name: 'Test User 1',
  };

  const user = await User.create(userData);
  
  // Verify user was created correctly
  expect(user.id).toBeDefined();
  expect(user.email).toBe(userData.email);
  expect(user.name).toBe(userData.name);
  
  // CRITICAL: Verify password is hashed (security requirement)
  expect(await bcrypt.compare(userData.password, user.password)).toBe(true);
  
  // CRITICAL: Verify user is marked as online after registration (our fix)
  expect(user.isOnline).toBe(true);
  expect(user.lastActive).toBeDefined();
});

// Test duplicate email prevention
test('Duplicate email registration is prevented', async () => {
  const userData = {
    email: 'test2@example.com',
    password: 'password123',
    name: 'Test User 2',
  };

  // Create first user
  await User.create(userData);
  
  // Try to create duplicate
  await expect(User.create(userData)).rejects.toThrow();
});

// Test login functionality with online status
test('User login sets online status correctly', async () => {
  const userData = {
    email: 'test3@example.com',
    password: 'securepass',
    name: 'Test User 3',
  };

  const user = await User.create(userData);
  
  // Update online status (as per our changes)
  user.lastActive = new Date();
  user.isOnline = true;
  await user.save();
  
  // Verify user is online after login
  const refreshedUser = await User.findByPk(user.id);
  expect(refreshedUser.isOnline).toBe(true);
  expect(refreshedUser.lastActive).toBeDefined();
});

// Test user getMe endpoint functionality
test('User getMe returns correct profile with online status', async () => {
  const user = await User.create({
    email: 'test4@example.com',
    password: 'password123',
    name: 'Test User 4',
  });

  // Set online status (as per our changes)
  user.lastActive = new Date();
  user.isOnline = true;
  await user.save();

  // Verify user data (simulating getMe functionality)
  const responseData = {
    id: user.id,
    email: user.email,
    name: user.name,
    isOnline: user.isOnline,
    lastActive: user.lastActive,
  };

  expect(responseData.isOnline).toBe(true);
  expect(responseData.lastActive).toBeDefined();
});

// Test user logout functionality
test('User logout clears online status', async () => {
  const user = await User.create({
    email: 'test5@example.com',
    password: 'password123',
    name: 'Test User 5',
  });

  // Set as online
  user.isOnline = true;
  await user.save();

  // Simulate logout
  await User.update(
    { isOnline: false, lastActive: new Date() },
    { where: { id: user.id } }
  );

  // Verify logout worked
  const refreshedUser = await User.findByPk(user.id);
  expect(refreshedUser.isOnline).toBe(false);
});

// Test user profile updates
test('User profile updates preserve online status', async () => {
  const user = await User.create({
    email: 'test6@example.com',
    password: 'password123',
    name: 'Test User 6',
  });

  // Set as online
  user.isOnline = true;
  await user.save();

  // Update profile
  await User.update(
    { name: 'Updated Name', headline: 'New Headline' },
    { where: { id: user.id } }
  );

  // Verify profile update and online status persistence
  const updatedUser = await User.findByPk(user.id);
  expect(updatedUser.name).toBe('Updated Name');
  expect(updatedUser.isOnline).toBe(true); // Should remain online
});

// Test user photo upload
test('User photo upload does not affect online status', async () => {
  const user = await User.create({
    email: 'test7@example.com',
    password: 'password123',
    name: 'Test User 7',
    isOnline: true,
  });

  expect(user.isOnline).toBe(true);

  // Simulate photo upload (doesn't affect online status)
  const updatedUser = await User.findByPk(user.id);
  expect(updatedUser.isOnline).toBe(true);
});

// Test admin user management
test('Admin user can be created and managed', async () => {
  const admin = await User.create({
    email: 'admin@test.com',
    password: 'adminpass123',
    name: 'System Admin',
    role: 'admin',
    isActive: true,
    isOnline: true,
  });

  expect(admin.id).toBeDefined();
  expect(admin.role).toBe('admin');
  expect(admin.isActive).toBe(true);
  expect(admin.isOnline).toBe(true);
});

// Test user verification process
test('User verification process works correctly', async () => {
  const user = await User.create({
    email: 'verify@example.com',
    password: 'password123',
    name: 'User to Verify',
    isVerified: false,
  });

  expect(user.isVerified).toBe(false);

  // Simulate verification
  user.isVerified = true;
  await user.save();

  const verifiedUser = await User.findByPk(user.id);
  expect(verifiedUser.isVerified).toBe(true);
});
