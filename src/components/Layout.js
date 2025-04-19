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
      <div className="flex flex-1 h-[100vh] bg-gray-100">

        <div className="hidden lg:flex w-64 h-[100vh] sticky top-0 bottom-0 bg-white shadow-md">
          <SideMenu />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 h-[100vh] overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
