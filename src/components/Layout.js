import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import SideMenu from "./SideMenu";

function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="h-16 shadow-md z-10">
        <Header />
      </header>

      {/* Content Wrapper */}
      <div className="flex flex-1 overflow-hidden bg-gray-100">
        {/* Sidebar - now with visible shadow */}
        <div className="hidden lg:flex w-64 bg-white shadow-lg z-0 relative">
          <SideMenu />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;