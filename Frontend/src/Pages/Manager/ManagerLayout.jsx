import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

import { Menu, X, LayoutDashboard } from "lucide-react";
import MobileSidebar from "./MobileSidebar";
const menuItems = [
  { label: "Dashboard", icon: <LayoutDashboard />, path: "/manager" },
];

export default function ManagerLayout() {
  const location = useLocation();
  const showSidebar = location.pathname !== "/";

  return (
    <>
      <MobileSidebar />

      <div className="h-screen bg-black p-5 pl-0 hidden md:block">
        <div className={`flex min-h-full bg-black rounded-2xl overflow-hidden`}>
          {showSidebar && (
            <aside className="w-70 bg-black text-white flex flex-col ">
              <div className="p-6 text-center border-b border-gray-700">
                {/* <div className="mb-2">
                <img
                  src="/avatar.jpg"
                  alt="Avatar"
                  className="w-16 h-16 rounded-full mx-auto"
                />
              </div> */}
                <h2 className="text-sm font-semibold">Samantha</h2>
                <p className="text-xs text-gray-400">+998 (99) 436-46-15</p>
              </div>

              <nav className="flex-1 overflow-y-auto p-5  ">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-2 transition-all
                  ${
                    location.pathname === item.path
                      ? "bg-white text-blue-600 font-semibold rounded-full"
                      : "text-white hover:bg-gray-800 rounded-lg"
                  }
                `}
                  >
                    <span
                      className={`text-lg ${
                        location.pathname === item.path
                          ? "text-blue-600"
                          : "text-white"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </aside>
          )}

          <div className="flex-grow p-6 bg-white rounded-2xl">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
