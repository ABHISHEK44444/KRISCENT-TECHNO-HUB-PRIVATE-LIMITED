const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { User, Project, Task, Message, Team } = require('./models');
require('dotenv').config();

const app = express();

// Allow all origins to prevent CORS issues between Vercel and Render
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Database Connection
let isDbConnected = false;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    isDbConnected = true;
  })
  .catch(err => console.error('MongoDB connection error:', err));

// --- MIDDLEWARE ---
// Fail fast if DB isn't ready
app.use((req, res, next) => {
  // Skip check for health route
  if (req.path === '/' || req.path === '/api/health') return next();

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database not ready', isOffline: true });
  }
  next();
});

// --- SYSTEM ROUTES ---

// Root Route: Easy way to check if backend is live in browser
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h1 style="color: #4F46E5;">CollabFlow API is Running</h1>
      <p>Status: <strong>${isDbConnected ? 'Online & Connected to DB' : 'Waiting for DB...'}</strong></p>
      <p>Endpoint: <code>/api/health</code></p>
    </div>
  `);
});

// Health Check: Lightweight endpoint for frontend to ping
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(), 
    dbState: mongoose.connection.readyState 
  });
});

// --- API ROUTES ---

// --- AUTHENTICATION ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`[AUTH] Login attempt for: ${email}`);
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`[AUTH] User not found: ${email}`);
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`[AUTH] Login successful: ${user.name} (${user.role})`);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// USERS
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({
      name,
      email,
      role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    });
    await user.save();
    console.log(`[USER] New user registered: ${name}`);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PROJECTS
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    console.log(`[PROJECT] Created: ${project.name}`);
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    await Task.deleteMany({ projectId: req.params.id });
    console.log(`[PROJECT] Deleted project ID: ${req.params.id}`);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TASKS
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    console.log(`[TASK] Created: ${task.title}`);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    if (req.body.assignedTo) {
      const user = await User.findById(req.body.assignedTo);
      console.log(`[TASK] Assigning task ${req.params.id} to user: ${user ? user.name : req.body.assignedTo}`);
    }
    
    if (req.body.status) {
      console.log(`[TASK] Updating status for ${req.params.id} to: ${req.body.status}`);
    }

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    console.log(`[TASK] Deleted task: ${req.params.id}`);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// MESSAGES
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    console.log(`[CHAT] Message from ${message.senderId}: ${message.content}`);
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
