import AppRouter from './app/router';
import { NotificationProvider } from './shared/notifications/NotificationContext';
import { NotificationToast } from './shared/notifications/NotificationToast';

function App() {
  return (
    <NotificationProvider>
      <AppRouter />
      <NotificationToast />
    </NotificationProvider>
  );
}

export default App;
