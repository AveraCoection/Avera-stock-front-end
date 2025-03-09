import React, { useContext, useEffect, useState } from "react";
import GlobalApiState from "../utilis/globalVariable";
import AuthContext from "../AuthContext";
import { toast, ToastContainer } from "react-toastify";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import DeleteBill from "../components/DeleteBill";
import { FaEye } from "react-icons/fa";
import BillPaidModel from "../components/BillPaidModel";
import { IoMdArrowBack } from "react-icons/io";
import DeductTotalModal from "../components/DeductTotalModel";


const BuyerTransaction = () => {
    const params = useParams()
    const navigate = useNavigate()
    const [sold, setAllSold] = useState([]);
    const { user } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteBillModal, setDeleteBillModal] = useState(false);
    const [singleBill, setSingleBill] = useState([])
    const [updatePage, setUpdatePage] = useState(true);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedBill, setSelectedBill] = useState({});
    const [showDeductModal, setShowDeductModal] = useState(false);
    const [totalBillAmount, setTotalBillAmount] = useState()
    const [buyer, setAllBuyer] = useState([]);

    const handleOpenDeductModal = () => {
        setShowDeductModal(true);
    };

    const handlePaidClick = (bill) => {
        if (!bill.paid) {
            setSelectedBill(bill);
            setShowConfirmModal(true);
        }
    };
    const handlePageUpdate = () => {
        setUpdatePage(!updatePage);
    };

    const filterPaymentsByDate = buyer?.paymentHistory?.filter((element) => {
        const elementDate = new Date(element.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Remove time component for consistency

        let filterDate = null;
        let dateMatch = true;

        if (selectedDate === "1_week") {
            filterDate = new Date(today);
            filterDate.setDate(today.getDate() - 7);
            dateMatch = elementDate >= filterDate; // Shows items from last 7 days
        } else if (selectedDate === "1_month") {
            filterDate = new Date(today);
            filterDate.setMonth(today.getMonth() - 1);
            dateMatch = elementDate >= filterDate; // Shows items from last 1 month
        } else if (selectedDate === "3_months") {
            filterDate = new Date(today);
            filterDate.setMonth(today.getMonth() - 3);
            dateMatch = elementDate <= filterDate; // Shows items older than 3 months
        }

        return dateMatch;
    });




    const onConfirm = async () => {

        try {
            const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/sold_design/update-bill/${selectedBill._id}`, {
                method: "PUT",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify({ ...selectedBill, paid: true }),
            });
            setUpdatePage(!updatePage);
        } catch (err) {
            toast.error(`Error: ${err.message}`);
            console.error(err);
        }
        setShowConfirmModal(false);
    }

    const deleteBillModel = (element) => {
        setDeleteBillModal(!showDeleteBillModal);
        setSingleBill(element)
    };

    const fetchSalesData = async () => {
        setIsLoading(true)

        try {
            const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/sold_design/get-sales/${user.user._id}?buyerID=${params.id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setAllSold(data);
        } catch (err) {
            console.error("Failed to fetch sales data:", err);
        } finally {
            setIsLoading(false)
        }
    };

    const fetchBuyerData = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/buyer/bill-transaction/${user.user._id}?buyerID=${params.id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setAllBuyer(data);
        } catch (error) {
            console.error("Error fetching buyer data:", error);
        } finally {
            setIsLoading(false)
        }
    };
    useEffect(() => {
        fetchSalesData();
        fetchBuyerData()
    }, [updatePage]);

    return (
        <>
            <div className="col-span-12 lg:col-span-10  flex justify-center mb-12">
                {showDeductModal && (
                    <DeductTotalModal
                        isOpen={showDeductModal}
                        onClose={() => setShowDeductModal(false)}
                        totalAmount={totalBillAmount}
                        setTotalBillAmount={setTotalBillAmount}
                        handlePageUpdate={handlePageUpdate}
                        buyerId={params.id}
                        userId={user.user._id}
                    />
                )}
                    <div className="flex flex-col gap-5 w-[100vw] lg:w-[900px]">
                {/* <div className="flex flex-col gap-5 max-h-[600px] md:w-[1000px] w-full  items-start"> */}
                    <div className="w-full overflow-x-auto rounded-lg border bg-white border-gray-200">
                        <ToastContainer />
                        <div className='flex justify-start items-center px-4 pt-3 rounded-t-lg'>
                            <IoMdArrowBack onClick={() => { navigate(-1) }} size={'22px'} className="cursor-pointer hover:text-gray-600" />
                            <span className="font-bold text-[16px] ml-4">BuyerTransaction Details</span>
                        </div>

                        <div className="lg:flex justify-between  items-center px-4 gap-2 ">
                            <div className="flex flex-wrap  gap-4">


                                {/* Filter by Time */}
                                <div className="flex flex-col mb-2 w-full lg:w-auto">
                                    <label className="mb-1 text-sm font-semibold">Time</label>
                                    <div className="flex items-center px-2 border rounded-md h-10 bg-white shadow-sm">
                                        <select className="border-none outline-none text-sm w-full h-full" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
                                            <option value="">All</option>
                                            <option value="1_week">1 Week Old</option>
                                            <option value="1_month">1 Month Old</option>
                                            <option value="3_months">3 Months Old</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="p-4 bg-gray-100 rounded-lg shadow-sm text-center cursor-pointer hover:bg-gray-100 transition-all"
                                onClick={handleOpenDeductModal}
                            >
                                <p className="text-lg font-bold">Total Amount: <span className="text-green-600">Rs.{buyer.totalBill}</span></p>
                                <p className="text-md text-red-500">Remaining: Rs.{buyer.remaining_amount}</p>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-700"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto max-h-96 mt-3">
                                <table className="min-w-full border border-gray-300 rounded-lg shadow-sm overflow-hidden text-base">
                                    <thead className="bg-gray-100">
                                        <tr className="border-b border-gray-300">
                                            <th className="px-4 py-2 text-left font-bold text-gray-900 text-[17px]">Sr No</th>
                                            <th className="px-4 py-2 text-left font-bold text-gray-900 text-[17px]">Paid Amount</th>
                                            <th className="px-4 py-2 text-left font-bold text-gray-900 text-[17px]">Date</th>
                                            <th className="px-4 py-2 text-left font-bold text-gray-900 text-[17px]">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {filterPaymentsByDate?.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="p-6 text-blue-600 text-center text-lg font-semibold bg-gray-50">
                                                    Record Not Found
                                                </td>
                                            </tr>
                                        ) : (
                                            filterPaymentsByDate?.map((element, index) => {
                                                const formattedDate = new Date(element.date).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "2-digit",
                                                });
                                                const formattedTime = new Date(element.date).toLocaleTimeString("en-US", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                });
                                                return (
                                                    <tr
                                                        key={element._id}
                                                        className={`hover:bg-gray-100 transition ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                                            }`}
                                                    >
                                                        <td className="px-4 py-2 text-gray-700 font-medium text-[16px] ">{index + 1}</td>
                                                        <td className="px-4 py-2 text-gray-700 font-medium text-[16px] ">Rs {element.amountPaid}</td>
                                                        <td className="px-4 py-2 text-gray-700 font-medium text-[16px]">{formattedDate}</td>
                                                        <td className="px-4 py-2 text-gray-700 font-medium text-[16px]">{formattedTime}</td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>


                            </div>
                        )}
                    </div>
                </div>

            </div>



        </>
    );
};

export default BuyerTransaction;
