import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Drawer, IconButton, Menu, MenuItem, List, ListItem, ListItemText } from "@mui/material";
import { Menu as MenuIcon, Close as CloseIcon, Notifications as NotificationsIcon } from "@mui/icons-material";
import AuthContext from "../AuthContext";
import { Avatar } from "@mui/material";

const navigation = [
  { name: "Catalogue", href: "/", current: true },
  { name: "Buyer", href: "/buyer", current: false },
  { name: "Bills", href: "/billing-detail", current: false },
];

const userNavigation = [{ name: "Sign out", href: "./login" }];

export default function Header() {
  const authContext = useContext(AuthContext);
  const localStorageData = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [openDrawer, setOpenDrawer] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const toggleDrawer = (open) => {
    setOpenDrawer(open);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    authContext.signout();
    navigate("./login");
  };

  // Function to close the Drawer and navigate
  const handleNavigation = (href) => {
    navigate(href);
    toggleDrawer(false); // Close the Drawer after navigation
  };

  return (
    <div className="min-h-full bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex justify-center items-center gap-2">
                <img
                  className="h-11 w-11 rounded-full"
                  src={require("../assets/brandLogo.jpg")}
                  alt="Inventory Management System"
                  onClick={() => navigate("/")}
                />
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center">
            <IconButton
              color="inherit"
              aria-label="view notifications"
              onClick={handleMenuClick}
            >
              <NotificationsIcon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
              sx={{ backgroundColor: 'white' }}
            >
              {userNavigation.map((item) => (
                <MenuItem
                  key={item.name}
                  onClick={handleSignOut}
                  sx={{ color: 'black' }}
                >
                  {item.name}
                </MenuItem>
              ))}
            </Menu>
          </div>

          <div className="-mr-2 flex md:hidden">
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => toggleDrawer(true)}
              sx={{ color: 'white' }}
            >
              <MenuIcon sx={{ color: 'white' }} />
            </IconButton>
          </div>
        </div>
      </div>

      <Drawer
        anchor="left"
        open={openDrawer}
        onClose={() => toggleDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: '64vw',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between', // Ensure the bottom section stays at the bottom
            backgroundColor: '#ffffff', // Background color for better visibility
            color: '#000000',
          },
        }}
      >
        <div className="p-4">
          {/* Close Icon */}
          <IconButton sx={{ color: 'black' }} onClick={() => toggleDrawer(false)}>
            <CloseIcon />
          </IconButton>

          {/* Navigation Items */}
          <List>
            {navigation.map((item) => (
              <ListItem
                button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
              >
                <ListItemText primary={item.name} />
              </ListItem>
            ))}
            <ListItem
              button
              onClick={() => {
                handleSignOut();
                toggleDrawer(false);
              }}
              sx={{ color: 'black' }}
            >
              <ListItemText primary="Sign out" />
            </ListItem>
          </List>
        </div>

        {/* User Information */}
        <div className="p-4 border-t border-gray-300">
          {localStorageData && (
            <div className="flex flex-col items-center">
               <Avatar
                alt={localStorageData.name || "User"}
                src={localStorageData.profilePicture || ""}
                sx={{ width: 54, height: 54 }}
              />
              <p className="font-semibold">  {localStorageData.firstName + " " + localStorageData.lastName}</p>
              <p className="text-sm text-gray-500">{localStorageData.email}</p>
            </div>
          )}
        </div>
        
       
      </Drawer>

    </div>
  );
}
