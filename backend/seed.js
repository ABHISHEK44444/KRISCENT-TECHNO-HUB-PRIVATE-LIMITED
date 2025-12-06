const mongoose = require('mongoose');
const { User, Team, Project, Task, Message } = require('./models');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Clear existing data
    await User.deleteMany({});
    await Team.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Message.deleteMany({});

    // Create Users
    const users = await User.insertMany([
      { name: 'Alice Admin', email: 'alice@collab.com', role: 'ADMIN', avatar: 'https://ui-avatars.com/api/?name=Alice+Admin&background=random' },
      { name: 'Bob Manager', email: 'bob@collab.com', role: 'MANAGER', avatar: 'https://ui-avatars.com/api/?name=Bob+Manager&background=random' },
      { name: 'Charlie Dev', email: 'charlie@collab.com', role: 'MEMBER', avatar: 'https://ui-avatars.com/api/?name=Charlie+Dev&background=random' },
      { name: 'Diana Designer', email: 'diana@collab.com', role: 'MEMBER', avatar: 'https://ui-avatars.com/api/?name=Diana+Designer&background=random' }
    ]);

    // Create Team
    const team = await Team.create({
      name: 'Product Alpha',
      description: 'Core product development team',
      members: users.map(u => u._id)
    });

    // Create Projects
    const projects = await Project.insertMany([
      { name: 'Q3 Feature Launch', description: 'Main features for Q3 release', teamId: team._id },
      { name: 'Infrastructure Migration', description: 'Moving to cloud native', teamId: team._id }
    ]);

    // Create Tasks
    await Task.insertMany([
      { title: 'Setup Repo', description: 'Initial commit and linting config', status: 'done', priority: 'high', projectId: projects[0]._id, assignedTo: users[2]._id },
      { title: 'Design System', description: 'Create Figma tokens', status: 'in-progress', priority: 'medium', projectId: projects[0]._id, assignedTo: users[3]._id },
      { title: 'API Integration', description: 'Connect to Gemini API', status: 'todo', priority: 'high', projectId: projects[0]._id, assignedTo: users[2]._id }
    ]);

    // Create Messages
    await Message.insertMany([
      { content: 'Hey team, welcome to the new board!', senderId: users[0]._id, teamId: team._id, timestamp: new Date(Date.now() - 86400000) },
      { content: 'Looks great! I will start on the design tokens.', senderId: users[3]._id, teamId: team._id, timestamp: new Date(Date.now() - 82000000) }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();