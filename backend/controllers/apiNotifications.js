const Notification = require("../Models/notification.js");

module.exports = {
  // Get notifications for current user / user role
  async getNotifications(req, res) {
    try {
      const user = req.user;
      const query = {
        $or: [
          { recipient: user._id },
          { targetRoles: user.role },
          { targetRoles: { $size: 0 } },
        ],
      };

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(30);

      const unreadCount = notifications.filter((n) => !n.isRead).length;

      res.json({
        success: true,
        unreadCount,
        notifications,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Mark single notification as read
  async markAsRead(req, res) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        req.params.id,
        { isRead: true },
        { new: true }
      );
      res.json({ success: true, notification });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Mark all as read
  async markAllAsRead(req, res) {
    try {
      const user = req.user;
      await Notification.updateMany(
        {
          $or: [
            { recipient: user._id },
            { targetRoles: user.role },
          ],
          isRead: false,
        },
        { isRead: true }
      );

      res.json({ success: true, message: "All notifications marked as read." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
