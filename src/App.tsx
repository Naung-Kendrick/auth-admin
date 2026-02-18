import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  ReceiptText,
  UserCircle,
  Users,
  LogOut,
  Mail,
} from "lucide-react";
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
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import { clearUser } from "./store/user/userSlice";
import type { AppState } from "./store";
import AdminProtected from "./routes/AdminProtected";
import Chat from "./pages/Chat";
import { io } from "socket.io-client";
import { useEffect } from "react";
import ChatList from "./pages/ChatList"
import { setNewMessage, setOnlineUserIds } from "./store/message/messageSlice";
import type { TMessage } from "./types/TMessage";

const navlist = [
  { id: 1, title: "Categories", link: "/", icon: <LayoutGrid size={20} /> },
  {
    id: 2,
    title: "Expenses",
    link: "/expenses",
    icon: <ReceiptText size={20} />,
  },
  { id: 3, title: "Profile", link: "/profile", icon: <UserCircle size={20} /> },
  { id: 4, title: "User List", link: "/user-list", icon: <Users size={20} /> },
  { id: 5, title: "Chat", link: "/chat", icon: <Mail size={20} /> },
];

function App() {
  const { user } = useSelector((state: AppState) => state.user);
  const { isLoading } = useLoadUserQuery();
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?._id) {
      const socket = io(import.meta.env.VITE_API_URL, {
        query: {
          userId: user?._id,
        },
      });

      socket.on("connect", () => {
        console.log("Connected with socketId >>>", socket.id);
      });

      socket.on("getOnlineUsers", (users: string[]) => {
        console.log("Online users >>>", users);
        dispatch(setOnlineUserIds(users))
      })

      socket.on("newMessage", (message: TMessage) => {
        console.log("New Message >>>", message);
        dispatch(setNewMessage(message))
      })
    }
  }, [user?._id]);

  const handleLogout = () => {
    Cookies.remove("access_token");
    dispatch(clearUser());
  };

  // Logic to hide sidebar on Login/Register pages
  const isAuthPage = ["/login", "/register"].includes(pathname);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <h1 className="text-xl font-semibold animate-pulse text-slate-600">
          App Loading...
        </h1>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      {!isAuthPage && (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen transition-all duration-300">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Expense<span className="text-indigo-600">Tracker</span>
            </h2>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4">
            {navlist.map((item) => (
              <NavLink
                key={item.id}
                to={item.link}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                  ${item.link === "/user-list" && user?.role === 0 && "hidden"}
                  ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`
                }
              >
                {item.icon}
                {item.title}
              </NavLink>
            ))}
          </nav>
          {/* Bottom Sidebar Section */}
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main
        className={`flex-1 transition-all duration-300 ${isAuthPage ? "flex items-center justify-center" : "p-8"}`}
      >
        <div className={isAuthPage ? "w-full" : "max-w-6xl mx-auto"}>
          <Routes>
            <Route
              path="/register"
              element={
                <AuthProtected>
                  <Register />
                </AuthProtected>
              }
            />
            <Route
              path="/login"
              element={
                <AuthProtected>
                  <Login />
                </AuthProtected>
              }
            />

            <Route
              path="/"
              element={
                <UserProtected>
                  <Category />
                </UserProtected>
              }
            />
            <Route
              path="/expenses"
              element={
                <UserProtected>
                  <Expense />
                </UserProtected>
              }
            />
            <Route
              path="/profile"
              element={
                <UserProtected>
                  <Profile />
                </UserProtected>
              }
            />
            <Route
              path="/chat"
              element={
                <UserProtected>
                  <ChatList />
                </UserProtected>
              }
            />
            <Route
              path="/chat/:receiverId"
              element={
                <UserProtected>
                  <Chat />
                </UserProtected>
              }
            />
            <Route
              path="/user-list"
              element={
                <AdminProtected>
                  <UserList />
                </AdminProtected>
              }
            />

            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;