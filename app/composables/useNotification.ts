export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

// =========================================
// Notification State
// =========================================

const notifications = ref<Notification[]>([]);

export function useNotification() {
  // Add notification
  const notify = (
    type: NotificationType,
    message: string,
    duration: number = 4000
  ) => {
    const id = Date.now().toString();

    notifications.value.push({
      id,
      type,
      message,
      duration,
    });

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }

    return id;
  };

  // Remove notification
  const remove = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  // Clear all notifications
  const clear = () => {
    notifications.value = [];
  };

  // Shortcuts
  const success = (message: string, duration?: number) =>
    notify("success", message, duration);
  const error = (message: string, duration?: number) =>
    notify("error", message, duration);
  const warning = (message: string, duration?: number) =>
    notify("warning", message, duration);
  const info = (message: string, duration?: number) =>
    notify("info", message, duration);

  return {
    notifications: readonly(notifications),
    notify,
    remove,
    clear,
    success,
    error,
    warning,
    info,
  };
}

