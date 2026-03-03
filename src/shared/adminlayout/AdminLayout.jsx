import { Outlet } from 'react-router-dom';
import AdminNavbar from '../navbar/AdminNavbar';
import AdminSidebar from '../sidebar/AdminSidebar';

function AdminLayout() {
  return (
    <div className="h-screen flex bg-[#f9fafb] text-slate-900">
      {/* Sidebar - fixed width and height */}
      <aside className="w-[260px] h-full border-r border-slate-200 bg-[#C3110C] overflow-y-auto">
        <AdminSidebar />
      </aside>

      {/* Main content */}
      <div className="flex-1 h-full flex flex-col">
        {/* Navbar - fixed height */}
        <header className="h-16 border-b border-slate-200 bg-white">
          <AdminNavbar />
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;

