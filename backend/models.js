const mongoose = require('mongoose');

const toJSONConfig = {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['ADMIN', 'MANAGER', 'MEMBER'], default: 'MEMBER' },
  avatar: { type: String }
}, { toJSON: toJSONConfig });

// Team Schema
const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { toJSON: toJSONConfig });

// Project Schema
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true }
}, { toJSON: toJSONConfig });

// Task Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Nullable
}, { toJSON: toJSONConfig });

// Message Schema
const messageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  timestamp: { type: Date, default: Date.now }
}, { toJSON: toJSONConfig });

module.exports = {
  User: mongoose.model('User', userSchema),
  Team: mongoose.model('Team', teamSchema),
  Project: mongoose.model('Project', projectSchema),
  Task: mongoose.model('Task', taskSchema),
  Message: mongoose.model('Message', messageSchema)
};