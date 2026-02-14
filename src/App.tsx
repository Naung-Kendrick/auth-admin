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
  { id: 4, title: "Users", link: "/user-list", icon: <Users size={20} />, adminOnly: true },
];

function App() {
  const { user } = useSelector((state: AppState) => state.user);
  const { isLoading } = useLoadUserQuery();
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      Cookies.remove("access_token");
      dispatch(clearUser());
    }
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

  // --- Sidebar Content (PC) ---
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          Expense<span className="text-indigo-600">Tracker</span>
        </h2>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-2">
        {navlist.map((item) => {
          if (item.adminOnly && user?.role !== 2) return null;
          return (
            <NavLink
              key={item.id}
              to={item.link}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                ${isActive 
                  ? "bg-indigo-50 text-indigo-600 shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`
              }
            >
              {item.icon}
              {item.title}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 flex-col md:flex-row">
      
      {/* --- DESKTOP SIDEBAR --- */}
      {!isAuthPage && (
        <aside className="hidden md:flex w-64 border-r border-slate-200 sticky top-0 h-screen">
          <SidebarContent />
        </aside>
      )}

      {/* --- MOBILE BOTTOM NAVIGATION (MenuBar) --- */}
      {!isAuthPage && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 px-2 py-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <nav className="flex justify-around items-center">
            {navlist.map((item) => {
              if (item.adminOnly && user?.role !== 2) return null;
              return (
                <NavLink
                  key={item.id}
                  to={item.link}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-xl transition-all
                    ${isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`
                  }
                >
                  <div className={`p-1.5 rounded-lg transition-colors ${pathname === item.link ? "bg-indigo-50" : ""}`}>
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wide">{item.title.split(' ')[0]}</span>
                </NavLink>
              );
            })}
            
            {/* More Menu for Mobile */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button className="flex flex-col items-center justify-center gap-1 px-3 py-1.5 text-slate-400">
                  <div className="p-1.5">
                    <Menu size={20} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wide">More</span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-3xl p-0 h-75">
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-4 border-b pb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                      {user?.name?.slice(0,1)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{user?.name}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { handleLogout(); setOpen(false); }}
                    className="flex items-center gap-3 w-full p-4 text-red-600 bg-red-50 rounded-2xl font-bold transition-all"
                  >
                    <LogOut size={20} /> Logout Account
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      <main className={`flex-1 overflow-x-hidden ${
        isAuthPage 
          ? "flex items-center justify-center p-4" 
          : "p-4 sm:p-6 md:p-8 lg:p-10 pb-24 md:pb-10" // Added pb-24 for mobile nav space
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