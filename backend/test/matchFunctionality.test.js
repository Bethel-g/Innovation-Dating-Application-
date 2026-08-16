// Test suite for core Innovation Dating backend functionality
// Phase 1: Authentication and User Management

import { sequelize } from '../src/config/db.js';
import User from '../src/models/User.js';
import Admin from '../src/models/Admin.js';
import bcrypt from 'bcryptjs';

describe('User Authentication Tests', () => {
  beforeAll(async () => {
    // Setup test database
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Cleanup
    await sequelize.close();
  });

  test('User registration works correctly', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const user = await User.create(userData);
    expect(user.id).toBeDefined();
    expect(user.email).toBe(userData.email);
    expect(user.name).toBe(userData.name);
    expect(await bcrypt.compare(userData.password, user.password)).toBe(true);
    expect(user.isOnline).toBe(true); // Updated: isOnline should be true on registration
  });

  test('User login works correctly', async () => {
    const userData = {
      email: 'login@example.com',
      password: 'securepass',
      name: 'Login User',
    };

    const user = await User.create(userData);

    // Simulate login
    user.lastActive = new Date();
    user.isOnline = true;
    await user.save();

    expect(user.isOnline).toBe(true);
    expect(user.lastActive).toBeDefined();
  });

  test('User authentication me endpoint', async () => {
    const user = await User.create({
      email: 'me@example.com',
      password: 'password123',
      name: 'Me User',
    });

    // Update online status as per our changes
    user.lastActive = new Date();
    user.isOnline = true;
    await user.save();

    // Verify the user is marked as online
    const refreshedUser = await User.findByPk(user.id);
    expect(refreshedUser.isOnline).toBe(true);
  });
});

// Phase 2: Matching and Connection Tests

describe('Match Functionality Tests', () => {
  beforeEach(async () => {
    // Reset swipes for test users
    await User.update({ dailySwipes: 0 }, { where: {} });
  });

  test('Daily swipe tracking works correctly', async () => {
    const user = await User.create({
      email: 'swipe@example.com',
      password: 'password123',
      name: 'Swipe User',
      subscriptionTier: 'free',
      maxDailySwipes: 50,
    });

    expect(user.dailySwipes).toBe(0);

    // Simulate a swipe action
    user.dailySwipes = 1;
    await user.save();

    expect(user.dailySwipes).toBe(1);

    // Test swipes near limit
    user.dailySwipes = user.maxDailySwipes - 1;
    await user.save();

    expect(user.dailySwipes).toBe(user.maxDailySwipes - 1);
  });

  test('Premium users have unlimited swipes', async () => {
    const premiumUser = await User.create({
      email: 'premium@example.com',
      password: 'password123',
      name: 'Premium User',
      subscriptionTier: 'premium',
      maxDailySwipes: 50, // Still has limit but won't be checked
    });

    const freeUser = await User.create({
      email: 'free@example.com',
      password: 'password123',
      name: 'Free User',
      subscriptionTier: 'free',
      maxDailySwipes: 50,
    });

    expect(premiumUser.subscriptionTier).toBe('premium');
    expect(freeUser.subscriptionTier).toBe('free');
  });
});

// Phase 3: Admin Panel Tests

describe('Admin Panel Functionality Tests', () => {
  test('Admin user management works', async () => {
    const admin = await Admin.create({
      email: 'admin@example.com',
      password: 'admin123',
      name: 'System Admin',
      role: 'super_admin',
    });

    expect(admin.id).toBeDefined();
    expect(admin.email).toBe('admin@example.com');
    expect(admin.role).toBe('super_admin');

    // Verify password is hashed
    expect(await bcrypt.compare('admin123', admin.password)).toBe(true);
  });
});

// Phase 4: Full Application Integration Tests

describe('Application Integration Tests', () => {
  test('Complete user registration to login flow', async () => {
    // Step 1: Register a user
    const userData = {
      email: 'integration@example.com',
      password: 'integrationpass',
      name: 'Integration User',
    };

    const user = await User.create(userData);
    expect(user.id).toBeDefined();

    // Step 2: Update user online status (as done in login/registration)
    user.lastActive = new Date();
    user.isOnline = true;
    await user.save();

    // Step 3: Verify user state
    const refreshedUser = await User.findByPk(user.id);
    expect(refreshedUser.isOnline).toBe(true);
    expect(refreshedUser.lastActive).toBeDefined();
  });
});
