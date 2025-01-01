import { Menu } from '@headlessui/react'
import React, { useState, useEffect } from 'react'
import AddCatalogue from '../components/AddCatalogue';
import AddDesign from '../components/AddDesign';
import EditDesign from '../components/EditDesign';
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { useNavigate, useParams } from 'react-router-dom';
import DeleteDesign from '../components/DeleteDesign';
import EditDesignBySell from '../components/EditDesign';
import EditDesignByAdd from '../components/EditStockInDesign';
import { ToastContainer } from 'react-toastify';
import GlobalApiState from '../utilis/globalVariable';
import EditPrice from '../components/EditPrice';
import { BsCashCoin } from "react-icons/bs";
import { IoMdArrowBack } from "react-icons/io";

export default function CatalogueDetail() {
    const params = useParams()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDesignModal, setDesignModal] = useState(false);
    const [showEditDesignModal, setEditDesignModal] = useState(false);
    const [showEditDesignModalSold, setEditDesignModalSold] = useState(false);
    const [showPriceModal, setPriceModal] = useState(false);
    const [showDeleteDesignModal, setDeleteDesignModal] = useState(false);
    const [updatePage, setUpdatePage] = useState(true);
    const [catalogueDesign, setAllCatalogeDesign] = useState([]);
    const [singlecataloge, setSingleCataloge] = useState([]);
    const [singleDesign, setSingleDesign] = useState([]);
    const [editDesign, setEditDesign] = useState([]);

    const addDesignModel = () => {
        setDesignModal(!showDesignModal);
    };
    const editDesignModel = (element) => {
        setEditDesignModalSold(!showEditDesignModalSold);
        setEditDesign(element)
    };
    const editDesignModelByAdd = (element) => {
        setEditDesignModal(!showEditDesignModal);
        setEditDesign(element)
    };
    const editPrice = (element) => {
        setPriceModal(!showPriceModal);
        setEditDesign(element)
    };
    const handlePageUpdate = () => {
        setUpdatePage(!updatePage);
    };
    const deleteCatalogueModel = () => {
        setDeleteDesignModal(!showDeleteDesignModal);
    };
    const fetchCatalogeData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/cataloge_design/list_design/${params.cataloge}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setAllCatalogeDesign(data);
        } catch (error) {
            console.error("Error fetching catalog data:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const fetchSingleCatalogeData = () => {
        fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/cataloge/edit_cataloge/${params.cataloge}`)
            .then((response) => response.json())
            .then((data) => {
                setSingleCataloge(data);
            })
            .catch((err) => console.log(err));
    };
    const fetchSingleDesignData = (id) => {
        fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/cataloge_design/edit_design/${id}`)
            .then((response) => response.json())
            .then((data) => {
                setSingleDesign(data);
            })
            .catch((err) => console.log(err));
    };

    const filteredDesign = catalogueDesign.filter((element) =>
        element.design_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchCatalogeData();
        fetchSingleCatalogeData()
    }, [updatePage]);

    return (
        <>
            <div className="col-span-12 lg:col-span-10 flex justify-center">
                <div className="flex flex-col gap-5 w-11/12">
                    {showDesignModal && (
                        <AddDesign
                            addDesignModel={addDesignModel}
                            handlePageUpdate={handlePageUpdate}
                            singlecataloge={singlecataloge}
                            editDesign={editDesign}
                        />
                    )}
                    {showEditDesignModalSold && (
                        <EditDesignBySell
                            editDesignModel={editDesignModel}
                            handlePageUpdate={handlePageUpdate}
                            editDesign={editDesign}
                            singlecataloge={singlecataloge}
                        />
                    )}

                    {showEditDesignModal && (
                        <EditDesignByAdd
                            editDesignModelByAdd={editDesignModelByAdd}
                            handlePageUpdate={handlePageUpdate}
                            editDesign={editDesign}
                            singlecataloge={singlecataloge}
                        />
                    )}

                    {showPriceModal && (
                        <EditPrice
                            editPrice={editPrice}
                            handlePageUpdate={handlePageUpdate}
                            editDesign={editDesign}
                            singlecataloge={singlecataloge}
                        />
                    )}

                    {showDeleteDesignModal && (
                        <DeleteDesign
                            deleteCatalogueModel={deleteCatalogueModel}
                            updatePage={updatePage}
                            setUpdatePage={setUpdatePage}
                            singleDesign={singleDesign}
                        />
                    )}

                    <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 pb-11">
                        <ToastContainer />

                        <div className=' flex justify-start p-4'>
                            <IoMdArrowBack
                                onClick={() => { navigate(-1) }}
                                size={'22px'}
                            />
                        </div>
                        <div className="flex justify-between  pb-3 px-3">
                            <div className="flex gap-4 justify-center items-center">
                                <span className="font-bold text-[16px]">Catalogue : {singlecataloge.cataloge_number}</span>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded"
                                    onClick={addDesignModel}
                                >
                                    Add Design
                                </button>
                            </div>


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
                        </div>
                        {isLoading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-700"></div>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
                                <thead>
                                    <tr>
                                        <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900 text-[17px]">
                                            Design Number</th>
                                        <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900 text-[17px]">
                                            Total Ghazana</th>
                                        <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900 text-[17px]">
                                            Total Thaan</th>
                                        <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900 text-[17px]">
                                            Price</th>
                                        <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900 text-[17px]">
                                            Edit Price</th>
                                        <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900 text-[17px]">
                                            Add</th>
                                            <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900 text-[17px]">
                                            Edit</th>
                                        <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900 text-[17px]">
                                            Delete</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {filteredDesign?.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="whitespace-nowrap p-6 text-blue-600 text-center">
                                                Record Not Found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredDesign.map((element) => (
                                            <tr key={element._id}>
                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-[16px] font-bold">
                                                    {element.design_number}</td>
                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-[16px] font-bold">
                                                    {element.khazana_stock}</td>
                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-[16px] font-bold">
                                                    {element.stock}</td>
                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-[16px] font-bold">
                                                    {element.price} /per m</td>
                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-[16px] font-bold">
                                                    <button
                                                        className="flex items-center gap-1 border-2 border-[#CC0000] text-[#CC0000] p-1 rounded-md"
                                                        onClick={() => editPrice(element)}
                                                    >
                                                        <BsCashCoin size={19} color="#CC0000" />
                                                        Price
                                                    </button>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                    <button
                                                        className="border-2 border-green-700 text-green-600 p-1 rounded-md"
                                                        onClick={() => {
                                                            editDesignModelByAdd(element);
                                                        }}
                                                    >
                                                        <span className="text-green-600 px-1 cursor-pointer">Add</span>
                                                    </button>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                    <button
                                                        className="border-2 border-red-700 text-red-600 p-1 rounded-md"
                                                        onClick={() => {
                                                            editDesignModel(element);
                                                        }}
                                                    >
                                                        <span className="text-red-600 px-1 cursor-pointer">Edit</span>
                                                    </button>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                    <RiDeleteBinLine
                                                        color="#CC0000"
                                                        size={22}
                                                        cursor="pointer"
                                                        onClick={() => {
                                                            fetchSingleDesignData(element._id);
                                                            deleteCatalogueModel();
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
