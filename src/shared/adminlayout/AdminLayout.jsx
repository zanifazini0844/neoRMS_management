import { Outlet } from 'react-router-dom';
import AdminNavbar from '../navbar/AdminNavbar';
import AdminSidebar from '../sidebar/AdminSidebar';

function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-[#f9fafb] text-slate-900">
      {/* Sidebar - fixed width */}
      <aside className="w-[260px] border-r border-slate-200 bg-[#C3110C]">
        <AdminSidebar />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
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

