import { useNotifications } from './NotificationContext';

const typeStyles = {
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-900',
    icon: '✓',
    dot: 'bg-emerald-500',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-900',
    icon: '✕',
    dot: 'bg-red-500',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    icon: '⚠',
    dot: 'bg-amber-500',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    icon: 'ⓘ',
    dot: 'bg-blue-500',
  },
};

export function NotificationToast() {
  const { notifications } = useNotifications();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-md">
      {notifications.map((notification) => {
        const style = typeStyles[notification.type] || typeStyles.info;
        return (
          <div
            key={notification.id}
            className={`${style.bg} border ${style.border} rounded-lg p-4 shadow-lg animate-in fade-in slide-in-from-right-5 duration-300`}
          >
            <div className="flex gap-3">
              <div className={`flex-shrink-0 w-5 h-5 rounded-full ${style.dot} flex items-center justify-center text-white text-xs font-bold`}>
                {style.icon}
              </div>
              <div className="flex-1">
                {notification.title && (
                  <p className={`text-sm font-semibold ${style.text}`}>
                    {notification.title}
                  </p>
                )}
                <p className={`text-sm ${style.text} ${notification.title ? 'mt-1' : ''}`}>
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
