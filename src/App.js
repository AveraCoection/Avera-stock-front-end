import React, { useContext, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import "./index.css";
import Layout from "./components/Layout";
import NoPageFound from "./pages/NoPageFound";
import AuthContext from "./AuthContext";
import ProtectedWrapper from "./ProtectedWrapper";
import Catalogue from "./pages/Catalogue";
import CatalogueDetail from "./pages/CatalogueDetail";
import Buyers from "./pages/Buyers";
import SoldCatalogeDetail from "./pages/SoldCatalogeDetail";
import Billing from "./pages/Billing";
import BillHistory from "./pages/BillHistory";
import Staff from "./pages/Staff";
import CostPrice from "./pages/CostPrice";
import CreateStaff from "./components/CreateStaff";
import RoleProtectedRoute from "./utilis/RoleProtectedRoutes";
import ForgetPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
import Commision from "./pages/Commision";
import BuyerBillDetail from "./pages/BuyerBillDetail";
import BuyerBillTransaction from "./pages/BuyerBillAndTransaction";
import BuyerBillAndTransaction from "./pages/BuyerBillAndTransaction";
import Report from "./pages/ReportGenerator";

const App = () => {
  const [users, setUser] = useState(null);
  const [loader, setLoader] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const myLoginUser = JSON.parse(localStorage.getItem("user"));
    if (myLoginUser) {
      setUser(myLoginUser.user._id);
    }
    setLoader(false);
  }, []);

  const signin = (newUser, callback) => {
    setUser(newUser);
    callback();
  };

  const signout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const value = { users, signin, signout };

  if (loader) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1>LOADING...</h1>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={users ? <Navigate to="/" replace /> : <Login />} 
        />
        <Route path="/forget-password"  element={users ? <Navigate to="/" replace /> : <ForgetPassword />} />
        <Route path="/reset-password/:token"  element={users ? <Navigate to="/" replace /> : <ResetPassword />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedWrapper>
              <Layout />
            </ProtectedWrapper>
          }
        >
          <Route index element={<Catalogue />} />
          <Route path="/catalogue-detail/:cataloge" element={<CatalogueDetail />} />
          <Route path="/buyer" element={<Buyers />} />
          <Route path="/sold-detail" element={<SoldCatalogeDetail />} />
          <Route path="/billing-detail" element={<Billing />} />
          <Route path="/report" element={<Report />} />

          <Route
            element={<RoleProtectedRoute allowedRoles={["Admin"]} userRole={user?.user?.role} />}
          >
            <Route path="/cost-price" element={<CostPrice />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/create-staff" element={<CreateStaff />} />
            <Route path="/commision" element={<Commision />} />
            <Route path="/buyer-bills/:id" element={<BuyerBillAndTransaction />} />
          </Route>

          <Route path="/billing-detail/bill-preview/:id" element={<BillHistory />} />
        </Route>
        <Route path="*" element={<NoPageFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;