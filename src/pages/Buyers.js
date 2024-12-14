import React, { useContext, useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import AddBuyer from '../components/AddBuyer'
import AuthContext from '../AuthContext';
import GlobalApiState from '../utilis/globalVariable';
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import EditBuyer from '../components/EditBuyer';
import DeleteBuyer from '../components/DeleteBuyer';
export default function Buyers() {
    const authContext = useContext(AuthContext);

    const [showBuyerModel, setBuyerModel] = useState(false);
    const [showEditBuyerModal, setEditBuyerModal] = useState(false);
    const [showDeleteBuyerModal, setDeleteBuyerModal] = useState(false);
    const [buyer, setAllBuyer] = useState([]);
    const [singleBuyer, setSingleBuyer] = useState([]);
    const [updatePage, setUpdatePage] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const addBuyerModel = () => {
        setBuyerModel(!showBuyerModel);
    };
    const deleteBuyerModel = () => {
        setDeleteBuyerModal(!showDeleteBuyerModal);
    };
    const editBuyerModel = (element) => {
        setEditBuyerModal(!showEditBuyerModal);
        setSingleBuyer(element)
    };
    const handlePageUpdate = () => {
        setUpdatePage(!updatePage);
    };
    const filteredCatalogue = buyer.filter((element) =>
        element.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) || element.phone_number.toString().includes(searchTerm)
    );


    const fetchBuyerData = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/buyer/list_buyer/${authContext.user}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setAllBuyer(data);
        } catch (error) {
            console.error("Error fetching buyer data:", error);
        }finally{
            setIsLoading(false)
        }
    };

    const fetchSingleCatalogeData = (id) => {
        fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/buyer/edit_buyer/${id}`)
            .then((response) => response.json())
            .then((data) => {
                setSingleBuyer(data);
            })
            .catch((err) => console.log(err));
    };

    useEffect(() => {
        fetchBuyerData();
    }, [updatePage]);

    return (
        <>

            <div className="col-span-12 lg:col-span-10  flex justify-center">

                <div className=" flex flex-col gap-5 w-11/12">

                    {showBuyerModel && (
                        <AddBuyer
                            addBuyerModel={addBuyerModel}
                            handlePageUpdate={handlePageUpdate}
                        />
                    )}

                    {showEditBuyerModal && (
                        <EditBuyer
                            editBuyerModel={editBuyerModel}
                            handlePageUpdate={handlePageUpdate}
                            singleBuyer={singleBuyer}
                        />
                    )}

                    {showDeleteBuyerModal && (
                        <DeleteBuyer
                            deleteBuyerModel={deleteBuyerModel}
                            updatePage={updatePage}
                            setUpdatePage={setUpdatePage}
                            singleBuyer={singleBuyer}
                        />
                    )}
                    <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 ">
                        <ToastContainer />
                        <div className="flex gap-4 justify-start items-start p-5 ">
                            <span className="font-bold">Buyer Details</span>
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
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs  rounded"
                                    onClick={addBuyerModel}
                                >
                                    Add Buyer
                                </button>
                            </div>
                        </div>

                        <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
                            <thead>
                                <tr>
                                    <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900">
                                        Buyer Name
                                    </th>
                                    <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900">
                                        Phone number
                                    </th>
                                    <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900">
                                        Edit
                                    </th>
                                    <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900">
                                        Delete
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="4" className="py-6 text-center">
                                            <div className="flex justify-center items-center">
                                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-700"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCatalogue.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="whitespace-nowrap p-6 text-blue-600 text-center">
                                                Record Not Found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCatalogue.map((element) => (
                                            <tr key={element._id}>
                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                    {element.buyer_name}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                    {element.phone_number}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                    <span onClick={() => editBuyerModel(element)}>
                                                        <FaRegEdit
                                                            color="#138808"
                                                            size={22}
                                                            cursor="pointer"
                                                        />
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                    <RiDeleteBinLine
                                                        color="#CC0000"
                                                        size={22}
                                                        cursor="pointer"
                                                        onClick={() => {
                                                            fetchSingleCatalogeData(element._id);
                                                            deleteBuyerModel();
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )
                                )}
                            </tbody>
                        </table>


                    </div>
                </div>
            </div>
        </>
    )
}
