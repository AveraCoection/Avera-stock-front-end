import React, { useContext } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import NoPageFound from "./pages/NoPageFound";
import AuthContext from "./AuthContext";
import ProtectedWrapper from "./ProtectedWrapper";
import { useEffect, useState } from "react";
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
// import { ToastContainer } from "react-toastify";

const App = () => {
  const [users, setUser] = useState("");
  const [loader, setLoader] = useState(true);
  let myLoginUser = JSON.parse(localStorage.getItem("user"));
  const {user} = useContext(AuthContext)

  useEffect(() => {
    if (myLoginUser) {
      setUser(myLoginUser.user._id);
      setLoader(false);
      // console.log("inside effect", myLoginUser)
    } else {
      setUser("");
      setLoader(false);
    }
  }, [myLoginUser]);

  const signin = (newUser, callback) => {
    setUser(newUser);
    callback();
  };

  const signout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  let value = { users, signin, signout };

  if (loader)
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

  return (
    // <AuthContext.Provider value={value}>
    <BrowserRouter>
      {/* <ToastContainer/> */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path='/forget-password' element={<ForgetPassword />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />

        {/* <Route path="/register" element={<Register />} /> */}
        <Route
          path="/"
          element={
            <ProtectedWrapper>
              <Layout />
            </ProtectedWrapper>
          }
        >
          <Route index element={<Catalogue />} />
          {/* <Route path="/catalogue" element={<Catalogue />} /> */}
          <Route path="/catalogue-detail/:cataloge" element={<CatalogueDetail />} />
          <Route path="/buyer" element={<Buyers />} />
          <Route path="/sold-detail" element={<SoldCatalogeDetail />} />
          <Route path="/billing-detail" element={<Billing />} />


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
    // </AuthContext.Provider>
  );
};

export default App;
