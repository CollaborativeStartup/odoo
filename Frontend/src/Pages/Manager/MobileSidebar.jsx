import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LayoutDashboard } from "lucide-react";

import { Outlet } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", icon: <LayoutDashboard />, path: "/dashboard" },
];

const MobileSidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Topbar */}
      <div className="bg-black text-white p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Samantha</h2>
        <Menu className="cursor-pointer" onClick={() => setIsOpen(true)} />
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 backdrop-blur-sm transition duration-300">
          <div className="w-64 bg-black h-full p-4">
            <div className="flex justify-between items-center mb-4 text-white">
              <h2 className="text-lg font-semibold">Samantha</h2>
              <X onClick={() => setIsOpen(false)} className="cursor-pointer" />
            </div>

            <p className="text-xs text-gray-400 mb-4">+998 (99) 436-46-15</p>

            <nav className="flex flex-col gap-2">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2 text-sm transition-all ${
                    location.pathname === item.path
                      ? "bg-white text-blue-600 font-semibold rounded-full"
                      : "text-white hover:bg-gray-800 rounded-lg"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
      <div className="flex-grow p-6 bg-white rounded-2xl">
        <Outlet />
      </div>
    </div>
  );
};

export default MobileSidebar;
