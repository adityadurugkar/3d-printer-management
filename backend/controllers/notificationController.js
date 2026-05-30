const Notification = require('../models/Notification');
const { getIO } = require('../config/socket');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ read: false });
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    const io = getIO();
    io.emit('notifications:read-all');
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAndEmitNotification = async ({ type, title, message, resourceId, resourceModel }) => {
  try {
    const notification = await Notification.create({
      type, title, message, resourceId, resourceModel,
    });
    const io = getIO();
    io.emit('notification:new', notification);
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};
