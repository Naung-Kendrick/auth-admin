import { useState } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  ReceiptText,
  UserCircle,
  Users,
  LogOut,
  Menu,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";

// UI Components (Shadcn UI)
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Page Imports
import Login from "./pages/Login";
import Register from "./pages/Register";
import Category from "./pages/Category";
import Expense from "./pages/Expense";
import Profile from "./pages/Profile";
import UserList from "./pages/UserList";
import PageNotFound from "./pages/PageNotFound";
import { useLoadUserQuery } from "./store/apiSlice";
import AuthProtected from "./routes/AuthProtected";
import UserProtected from "./routes/UserProtected";
import AdminProtected from "./routes/AdminProtected";
import { clearUser } from "./store/user/userSlice";
import type { AppState } from "./store";

const navlist = [
  { id: 1, title: "Categories", link: "/", icon: <LayoutGrid size={20} /> },
  { id: 2, title: "Expenses", link: "/expenses", icon: <ReceiptText size={20} /> },
  { id: 3, title: "Profile", link: "/profile", icon: <UserCircle size={20} /> },
  { id: 4, title: "User List", link: "/user-list", icon: <Users size={20} />, adminOnly: true },
];

function App() {
  const { user } = useSelector((state: AppState) => state.user);
  const { isLoading } = useLoadUserQuery();
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    Cookies.remove("access_token");
    dispatch(clearUser());
  };

  const isAuthPage = ["/login", "/register"].includes(pathname);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse text-sm">Initializing App...</p>
        </div>
      </div>
    );
  }

  // --- Reusable Navigation Component ---
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Branding */}
      <div className="p-6 landscape:py-3">
        <h2 className="text-2xl landscape:text-xl font-bold text-slate-800 tracking-tight">
          Expense<span className="text-indigo-600">Tracker</span>
        </h2>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 space-y-1.5 md:space-y-2 mt-2 overflow-y-auto custom-scrollbar">
        {navlist.map((item) => {
          if (item.adminOnly && user?.role === 0) return null;
          return (
            <NavLink
              key={item.id}
              to={item.link}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 landscape:py-2 rounded-xl font-medium transition-all duration-200
                text-sm md:text-base landscape:text-xs
                ${isActive 
                  ? "bg-indigo-50 text-indigo-600 shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`
              }
            >
              <span className="landscape:scale-90">{item.icon}</span>
              {item.title}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-100 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 landscape:py-2 text-sm md:text-base landscape:text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut size={20} className="landscape:scale-90" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 flex-col md:flex-row">
      
      {/* --- MOBILE HEADER (Phone/Tablet Portrait) --- */}
      {!isAuthPage && (
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-50">
          <h2 className="text-xl font-bold text-slate-800">
            Expense<span className="text-indigo-600">Tracker</span>
          </h2>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>
      )}

      {/* --- DESKTOP SIDEBAR (Laptop/PC & Tablet Landscape) --- */}
      {!isAuthPage && (
        <aside className="hidden md:flex w-64 border-r border-slate-200 sticky top-0 h-screen overflow-hidden">
          <SidebarContent />
        </aside>
      )}

      {/* --- MAIN CONTENT --- */}
      <main className={`flex-1 overflow-x-hidden ${
        isAuthPage 
          ? "flex items-center justify-center p-4" 
          : "p-4 sm:p-6 md:p-8 lg:p-10 landscape:p-4"
      }`}>
        <div className={isAuthPage ? "w-full max-w-md" : "max-w-6xl mx-auto w-full h-full"}>
          <Routes>
            <Route path="/register" element={<AuthProtected><Register /></AuthProtected>} />
            <Route path="/login" element={<AuthProtected><Login /></AuthProtected>} />
            
            <Route path="/" element={<UserProtected><Category /></UserProtected>} />
            <Route path="/expenses" element={<UserProtected><Expense /></UserProtected>} />
            <Route path="/profile" element={<UserProtected><Profile /></UserProtected>} />
            
            <Route path="/user-list" element={<AdminProtected><UserList /></AdminProtected>} />
            
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;