import React, { useContext, useEffect, useState } from "react";
import GlobalApiState from "../utilis/globalVariable";
import AuthContext from "../AuthContext";
import { ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import DeleteBill from "../components/DeleteBill";
import { FaEye } from "react-icons/fa";


const Billing = () => {
  const [sold, setAllSold] = useState([]);
  const authContext = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteBillModal, setDeleteBillModal] = useState(false);
  const [singleBill, setSingleBill] = useState([])
  const [updatePage, setUpdatePage] = useState(true);


  const filteredCatalogue = sold.filter((element) => {
    const buyer = element?.buyer;
    const buyerLabel = typeof buyer === 'object' ? buyer?.label : buyer;

    return buyerLabel?.toLowerCase().includes(searchTerm.toLowerCase());
  });


  const deleteBillModel = (element) => {
    setDeleteBillModal(!showDeleteBillModal);
    setSingleBill(element)
  };


  const fetchSalesData = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/sold_design/get-sales/${authContext.user}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAllSold(data);
    } catch (err) {
      console.error("Failed to fetch sales data:", err); // Log the error
    } finally {
      setIsLoading(false)
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [updatePage]);
  return (
    <>
      <div className="col-span-12 lg:col-span-10  flex justify-center mb-12">
        {showDeleteBillModal && (
          <DeleteBill
            deleteBillModel={deleteBillModel}
            updatePage={updatePage}
            setUpdatePage={setUpdatePage}
            singleBill={singleBill}
          />
        )}
        <div className=" flex flex-col gap-5 w-11/12">
          <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 ">
            <ToastContainer />
            <div className="flex gap-4 justify-between items-start p-5 ">
              <span className="font-bold text-[16px]">Billing Details</span>
            </div>
            <div className="flex justify-between pt-5 pb-3 px-3">
              <div className="flex justify-center items-center px-2 border-2 rounded-md ">
                <img
                  alt="search-icon"
                  className="w-5 h-5"
                  src={require("../assets/search-icon.png")}
                />
                <input
                  className="border-none outline-none text-xs"
                  type="text"
                  placeholder="Search here"
                  value={searchTerm} // Bind the input value to searchTerm state
                  onChange={(e) => setSearchTerm(e.target.value)} // Handle search term change
                />
              </div>
              <div className="flex gap-4">
                {/* <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs  rounded"
                  // onClick={addCatalogueModel}
                >
                  Add Catalogue
                </button> */}
              </div>
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-700"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
                <thead>
                  <tr>
                    <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900 lg:text-[17px] text-[14px]">
                      Sr No
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900 lg:text-[17px] text-[14px]">
                      Party Name
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900 lg:text-[17px] text-[14px]">
                      Date
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900 lg:text-[17px] text-[14px]">
                      Time
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900 lg:text-[17px] text-[14px]">
                      Total
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900 lg:text-[17px] text-[14px]">
                      Preview
                    </th>

                    <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900 lg:text-[17px] text-[14px]">
                      Delete
                    </th>
                  </tr>
                </thead>


                <tbody className="divide-y divide-gray-200">
                  {
                    filteredCatalogue.length == 0 ? (
                      <tr>
                        <td colSpan="4" className="whitespace-nowrap p-6 text-blue-600 text-center">
                          Record Not Found
                        </td>
                      </tr>) : (

                      filteredCatalogue.map((element, index) => {
                        const formattedDate = new Date(element.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        });

                        const formattedTime = new Date(element.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          // second: "2-digit",
                          hour12: true,
                        });
                        const currentInvoice = element?.inVoice
                          ? element.inVoice.toString().padStart(4, "0")
                          : "0000";

                        return (
                          <tr key={element._id}>

                            <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-[15px] font-bold">
                              {currentInvoice}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-[15px] font-bold">
                              {element.buyer.label || element.buyer}

                            </td>
                            <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-[15px] font-bold">
                              {formattedDate}

                            </td>
                            <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-[15px] font-bold">
                              {formattedTime}

                            </td>
                            <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-[15px] font-bold">
                              {element?.grandTotal}

                            </td>
                            <Link to={`/bill-history/${element._id}`}>
                              <td className="whitespace-nowrap px-4 py-2 text-gray-700">

                                <FaEye color="#138808" size={22} cursor={'pointer'}
                                />
                              </td>
                            </Link>

                            <td className="whitespace-nowrap px-4 py-2 text-gray-700">

                              <RiDeleteBinLine color="#CC0000" size={22} cursor={'pointer'}
                                // onClick={() => deleteItem(element._id)}
                                onClick={() => {
                                  // fetchSingleCatalogeData(element._id);
                                  deleteBillModel(element)
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })

                    )
                  }

                </tbody>
              </table>
            )}


          </div>
        </div>
      </div>



    </>
  );
};

export default Billing;
