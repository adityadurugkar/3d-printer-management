const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const getUsers = async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  res.json(users);
};

const getUser = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
};

const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const user = await User.create({ name, email, password, role: role || 'technician' });
  await AuditLog.create({
    user: req.user._id,
    action: 'create',
    resource: 'user',
    resourceId: user._id,
    details: { name: user.name, email: user.email, role: user.role },
  });
  res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, status: user.status });
};

const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const { name, email, role, status, password } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (status) user.status = status;
  if (password) user.password = password;
  const updated = await user.save();
  await AuditLog.create({
    user: req.user._id,
    action: 'update',
    resource: 'user',
    resourceId: user._id,
    details: { name: updated.name, email: updated.email, role: updated.role, status: updated.status },
  });
  res.json({ _id: updated._id, name: updated.name, email: updated.email, role: updated.role, status: updated.status });
};

const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: 'Cannot delete yourself' });
  }
  await User.findByIdAndDelete(req.params.id);
  await AuditLog.create({
    user: req.user._id,
    action: 'delete',
    resource: 'user',
    resourceId: req.params.id,
    details: { name: user.name, email: user.email },
  });
  res.json({ message: 'User removed' });
};

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser };
