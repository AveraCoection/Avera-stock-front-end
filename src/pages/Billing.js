import React, { useContext, useEffect, useState } from "react";
import GlobalApiState from "../utilis/globalVariable";
import AuthContext from "../AuthContext";

const Billing = () => {
    const [sold, setAllSold] = useState([]);
    const authContext = useContext(AuthContext);


    const fetchSalesData = () => {
        fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/sold_design/get-sales/${authContext.user}`)
            .then((response) => response.json())
            .then((data) => {
                setAllSold(data);
            })
            .catch((err) => console.log(err));
    };
    useEffect(() => {
        fetchSalesData();
    }, []);
    return (
    <div className="p-6 min-h-screen w-[50vw]">
      {/* Header */}
      <div className="bg-orange-600 text-white p-4 pb-4 rounded-t-lg h-[100px]">
        <div>
        <h1 className="text-2xl font-bold">Business 1</h1>
        <p>03008941482</p>
        </div>
      </div>

      <div className="bg-white shadow-md  p-6 -mt-6">
        <h2 className="text-xl font-bold mb-2">Johnny Statement</h2>
        <p className="text-gray-600">Phone Number: +92-19174002487</p>
        <p className="text-gray-500 text-sm">08 Feb 23 - 20 Nov 24</p>

<div className="flex items-center justify-start gap-2 mt-6">
<div className="w-[20%]">
    <h1 className="font-bold">Banam Bill : </h1>
</div>
<div className="border-b-2 border-cyan-800 w-full ">
    <h1 className="pl-4">catalogues 1-A 34 gaz</h1>
</div>

</div>
        <div className="mt-8">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Sr No</th>
                <th className="border p-2">Details</th>
                <th className="border p-2">Debit(-)</th>
                <th className="border p-2">Credit(+)</th>
                <th className="border p-2">Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 text-center">08 Feb 23</td>
                <td className="border p-2">—</td>
                <td className="border p-2 text-red-500 text-center">$ 8,900</td>
                <td className="border p-2 text-center">—</td>
                <td className="border p-2 text-center">$ 8,900</td>
              </tr>
                       </tbody>
          </table>
        </div>

        <p className="text-gray-500 text-sm mt-6 text-right">
          Report Generated: 08:07 AM | 20 Nov 24
        </p>
      </div>
    </div>
  );
};

export default Billing;
