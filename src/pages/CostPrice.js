import React, { useContext, useEffect, useState } from 'react';
import AddCatalogue from '../components/AddCatalogue';
import { Link } from 'react-router-dom';
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import AuthContext from '../AuthContext';
import EditCatalogue from '../components/EditCatalogue';
import DeleteCataloge from '../components/DeleteCataloge';
import { ToastContainer } from 'react-toastify';
import GlobalApiState from '../utilis/globalVariable';
import AddCostPrice from '../components/AddCostPrice';
import EditCostPrice from '../components/EditCostPrice';
import DeleteCostPrice from '../components/DeleteCostPrice';

function CostPrice() {
    const { user } = useContext(AuthContext);
    const [sold, setAllSold] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCostPriceModal, setCostPriceModal] = useState(false);
    const [showEditCostPriceModal, setEditCostPriceModal] = useState(false);
    const [showDeleteCostPriceModal, setDeleteCostPriceModal] = useState(false);
    const [costPrice, setAllCostPrice] = useState([]);
    const [singlecostPrice, setSingleCostPrice] = useState([]);
    const [updatePage, setUpdatePage] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("");

    const addCostPriceModel = () => {
        setCostPriceModal(!showCostPriceModal);
    };
    const deleteCostPriceModel = () => {
        setDeleteCostPriceModal(!showDeleteCostPriceModal);
    };
    const editCostPriceModel = (element) => {
        setEditCostPriceModal(!showEditCostPriceModal);
        setSingleCostPrice(element);
    };
    const handlePageUpdate = () => {
        setUpdatePage(!updatePage);
    };
    const filteredCostPrice = costPrice.filter((element) =>
        element.cost_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchCostPriceData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/cost_price/list_costPrice/${user.user._id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setAllCostPrice(data);
        } catch (error) {
            console.error("Error fetching costprice data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSingleCostPriceData = (id) => {
        fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/cost_price/edit_costPrice/${id}`)
            .then((response) => response.json())
            .then((data) => {
                setSingleCostPrice(data);
            })
            .catch((err) => console.log(err));
    };


    const fetchSalesData = async () => {
        setIsLoading(true)

        try {
            const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/sold_design/get-sales/${user.user._id}`);
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
        fetchCostPriceData();
        fetchSalesData();

    }, [updatePage]);

    return (
        <>
            <div className="col-span-12 lg:col-span-10 flex justify-center px-2 sm:px-4 ">
                <div className="flex flex-col gap-5 w-full lg:w-11/12">
                    {showCostPriceModal && (
                        <AddCostPrice
                            addCostPriceModel={addCostPriceModel}
                            handlePageUpdate={handlePageUpdate}
                            sold={sold}
                        />
                    )}
                    {showEditCostPriceModal && (
                        <EditCostPrice
                            editCostPriceModel={editCostPriceModel}
                            handlePageUpdate={handlePageUpdate}
                            singlecostPrice={singlecostPrice}
                            sold={sold}

                        />
                    )}
                    {showDeleteCostPriceModal && (
                        <DeleteCostPrice
                            deleteCostPriceModel={deleteCostPriceModel}
                            updatePage={updatePage}
                            setUpdatePage={setUpdatePage}
                            singlecostPrice={singlecostPrice}
                        />
                    )}
                    <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 pb-5">
                        <ToastContainer />
                        <div className="flex  justify-between items-center p-5 font-bold gap-16">
                            <span className="text-md sm:text-lg font-bold">CostPrice Details</span>
                        </div>
                        <div className="flex  sm:justify-between gap-5 px-3 py-2 w-full">
                            {/* <div className="flex items-center px-2 border-2 rounded-md md:w-auto w-1/2 ">
                                <img
                                    alt="search-icon"
                                    className="w-5 h-5"
                                    src={require("../assets/search-icon.png")}
                                />
                                <input
                                    className="border-none outline-none text-xs  w-full"
                                    type="text"
                                    placeholder="Search here"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div> */}
                            <div className="flex flex-col">
                                {/* <label className="mb-1">Type</label> */}
                                <div className="flex items-center px-2 border-2 rounded-md">
                                    <select
                                        className="border-none outline-none text-sm w-full h-full"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    >
                                        <option value="">Select Cost Type</option>
                                        <option value="Delivery Charges">Delivery Charges</option>
                                        <option value="Commission on Sales">Commission on Sales</option>
                                        <option value="Commission for Agent">Commission for Agent</option>
                                        <option value="Cataloge Expense">Cataloge Expense</option>
                                        <option value="Others">Others</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded md:w-auto "
                                    onClick={addCostPriceModel}
                                >
                                    Add CostPrice
                                </button>
                            </div>
                        </div>
                        {isLoading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-700"></div>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y-2 divide-gray-200 text-xs ">
                                <thead>
                                    <tr>
                                        <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900 lg:text-[17px] text-[14px]">Cost Price type</th>
                                        <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900 lg:text-[17px] text-[14px]">Cost Amount </th>
                                        <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900 lg:text-[17px] text-[14px]">Bill Detail</th>
                                        <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900 lg:text-[17px] text-[14px]">Edit</th>
                                        <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900 lg:text-[17px] text-[14px]">Delete</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredCostPrice.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="whitespace-nowrap p-6 text-blue-600 text-center">
                                                Record Not Found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCostPrice.map((element) => (
                                            <tr key={element._id}>
                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700 font-bold">
                                                    {element.cost_type}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700 font-bold">
                                                    {element.cost_name}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700 font-bold">
                                                    {(() => {
                                                        const foundBuyer = sold?.find((buyer) => buyer._id === element.design_bill);
                                                        return foundBuyer?.buyer?.label || foundBuyer?.buyer || "N/A";
                                                    })()}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                    <FaRegEdit
                                                        color="#138808"
                                                        size={20}
                                                        cursor="pointer"
                                                        onClick={() => editCostPriceModel(element)}
                                                    />
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                    <RiDeleteBinLine
                                                        color="#CC0000"
                                                        size={20}
                                                        cursor="pointer"
                                                        onClick={() => {
                                                            fetchSingleCostPriceData(element._id);
                                                            deleteCostPriceModel();
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default CostPrice;
