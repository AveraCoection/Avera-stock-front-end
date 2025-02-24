import React from "react";
import { Link } from "react-router-dom";
import { GrCatalog } from 'react-icons/gr';
import { IoIosPerson } from "react-icons/io";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { ImPriceTags } from "react-icons/im";
import { MdPersonAdd } from "react-icons/md";
import { Avatar } from "@mui/material";

function SideMenu() {
  const localStorageData = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="h-full flex-col justify-between  bg-white hidden lg:flex ">
      <div className="px-4 py-6">
        <nav aria-label="Main Nav" className="mt-6 flex flex-col space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            {/* <img alt="sale-icon" src={require("../assets/supplier-icon.png")} /> */}
            <GrCatalog size={20} color="grey" />
            <span className="text-sm font-medium">Catalogue</span>
          </Link>

          <Link
            to="/buyer"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            {/* <img alt="sale-icon" src={require("../assets/supplier-icon.png")} /> */}
            <IoIosPerson size={20} color="grey" />
            <span className="text-sm font-medium">Buyer</span>
          </Link>
          <Link
            to="/billing-detail"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            {/* <img alt="sale-icon" src={require("../assets/supplier-icon.png")} /> */}
            <FaFileInvoiceDollar size={20} color="grey" />
            <span className="text-sm font-medium">Bills</span>
          </Link>
          {
            localStorageData?.user?.role === "Admin" && (
              <Link
                to="/cost-price"
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <ImPriceTags size={20} color="grey" />
                <span className="text-sm font-medium">Cost Price</span>
              </Link>
            )
          }

        </nav>
      </div>

      <div >
        {
          localStorageData?.user?.role === "Admin" && (
            <div>
              <Link
                to="/staff"
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <MdPersonAdd size={20} color="grey" />
                <span className="text-sm font-medium">Staff</span>
              </Link>
            </div>
          )
        }

        <div className="inset-x-0 bottom-0 border-t border-gray-100">
          <div className="flex items-center gap-2 bg-white p-4 hover:bg-gray-50">
            <Avatar
              alt={localStorageData?.user?.name || "User"}
              src={localStorageData?.user?.imageUrl || ""}
              sx={{ width: 54, height: 54, mb: 2 }}
            />

            <div>
              <p className="text-xs">
                <strong className="block font-medium">
                  {localStorageData?.user?.firstName + " " + localStorageData?.user?.lastName}
                </strong>

                <span> {localStorageData?.user?.email} </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
