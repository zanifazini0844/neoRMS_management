/**
 * Notification Service
 * Handles creating and managing notifications/alerts
 */

// Store for notification callbacks
let notificationCallbacks = [];

/**
 * Subscribe to notifications
 * @param {Function} callback - Function to call when notification is triggered
 * @returns {Function} Unsubscribe function
 */
export const subscribeToNotifications = (callback) => {
  notificationCallbacks.push(callback);
  return () => {
    notificationCallbacks = notificationCallbacks.filter(cb => cb !== callback);
  };
};

/**
 * Send a notification
 * @param {Object} notification - Notification object
 * @param {string} notification.type - Type: 'success', 'error', 'warning', 'info'
 * @param {string} notification.title - Notification title
 * @param {string} notification.message - Notification message
 * @param {number} notification.duration - Duration in ms (default 3000)
 */
export const sendNotification = (notification) => {
  const {
    type = 'info',
    title = '',
    message = '',
    duration = 3000,
  } = notification;

  const id = Date.now() + Math.random();
  const notificationData = {
    id,
    type,
    title,
    message,
    duration,
    timestamp: new Date(),
  };

  // Notify all subscribers
  notificationCallbacks.forEach(callback => callback(notificationData));

  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => {
      notificationCallbacks.forEach(callback => callback({ ...notificationData, remove: true }));
    }, duration);
  }

  return id;
};

/**
 * Send low stock alert
 */
export const sendLowStockAlert = (itemName, currentQuantity, threshold) => {
  return sendNotification({
    type: 'warning',
    title: '⚠️ Low Stock Alert',
    message: `${itemName} is running low (${currentQuantity} / ${threshold})`,
    duration: 4000,
  });
};

/**
 * Send stock out alert
 */
export const sendStockOutAlert = (itemName) => {
  return sendNotification({
    type: 'error',
    title: '❌ Out of Stock',
    message: `${itemName} is out of stock`,
    duration: 4000,
  });
};

/**
 * Send success notification
 */
export const sendSuccessNotification = (message, title = '✓ Success') => {
  return sendNotification({
    type: 'success',
    title,
    message,
    duration: 3000,
  });
};

/**
 * Send error notification
 */
export const sendErrorNotification = (message, title = '✗ Error') => {
  return sendNotification({
    type: 'error',
    title,
    message,
    duration: 4000,
  });
};
