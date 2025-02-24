import React, { useContext, useEffect, useState } from 'react';
import AddCatalogue from '../components/AddCatalogue';
import { Link, useNavigate } from 'react-router-dom';
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import AuthContext from '../AuthContext';
import EditCatalogue from '../components/EditCatalogue';
import DeleteCataloge from '../components/DeleteCataloge';
import { ToastContainer } from 'react-toastify';
import GlobalApiState from '../utilis/globalVariable';
import DeleteStaff from '../components/DeleteStaff';

function Staff() {
    const {user} = useContext(AuthContext);
const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(true);
    const [showCatalogueModal, setCatalogueModal] = useState(false);
    const [showEditCatalogueModal, setEditCatalogueModal] = useState(false);
    const [showDeleteCatalogueModal, setDeleteCatalogueModal] = useState(false);
    const [catalogue, setAllCataloge] = useState([]);
    const [singlecatalogue, setSingleCataloge] = useState([]);
    const [updatePage, setUpdatePage] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const addCatalogueModel = () => {
        setCatalogueModal(!showCatalogueModal);
    };
    const deleteCatalogueModel = (element) => {
        setDeleteCatalogueModal(!showDeleteCatalogueModal);
        setSingleCataloge(element);

    };
    const editCatalogueModel = (element) => {
        setEditCatalogueModal(!showEditCatalogueModal);
        setSingleCataloge(element);
    };
    const handlePageUpdate = () => {
        setUpdatePage(!updatePage);
    };
    const filteredCatalogue = catalogue?.filter((element) =>
        element.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchCatalogeData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/auth/get-staffs/${user.user._id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setAllCataloge(data.staff);
        } catch (error) {
            console.error("Error fetching catalog data:", error);
        } finally {
            setIsLoading(false);
        }
    };

   

    useEffect(() => {
        fetchCatalogeData();
    }, [updatePage]);

    return (
        <>
            <div className="col-span-12 lg:col-span-10 flex justify-center px-2 sm:px-4 ">
                <div className="flex flex-col gap-5 w-full lg:w-11/12">
                    {/* {showCatalogueModal && (
                        <AddCatalogue
                            addCatalogueModel={addCatalogueModel}
                            handlePageUpdate={handlePageUpdate}
                        />
                    )}
                    {showEditCatalogueModal && (
                        <EditCatalogue
                            editCatalogueModel={editCatalogueModel}
                            handlePageUpdate={handlePageUpdate}
                            singlecatalogue={singlecatalogue}
                        />
                    )} */}
                    {showDeleteCatalogueModal && (
                        <DeleteStaff
                            deleteCatalogueModel={deleteCatalogueModel}
                            updatePage={updatePage}
                            setUpdatePage={setUpdatePage}
                            singlecatalogue={singlecatalogue}
                        />
                    )}
                    
                    <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 pb-5">
                        <ToastContainer />
                        <div className="flex  justify-between items-center p-5 font-bold gap-16">
                            <span className="text-md sm:text-lg font-bold">Staff Details</span>
                            </div>
                        <div className="flex  sm:justify-between gap-5 px-3 py-2 w-full">
                            <div className="flex items-center px-2 border-2 rounded-md md:w-auto w-1/2 ">
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
                            </div>
                            <div>
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded md:w-auto "
                                onClick={()=>navigate('/create-staff')}
                            >
                                Add Staff
                            </button>
                            </div>
                        </div>
                        {isLoading ? (
                            // <div className="flex justify-center items-center h-32">
                            //     <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-700"></div>
                            // </div>
                            <>
                            </>
                        ) : (
                            <table className="min-w-full divide-y-2 divide-gray-200 text-xs ">
                                <thead>
                                    <tr>
                                        <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900 lg:text-[17px] text-[14px]">Sr No</th>
                                        <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900 lg:text-[17px] text-[14px]">Staff Number</th>
                                        <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900 lg:text-[17px] text-[14px]">Role</th>
                                        <th className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-900 lg:text-[17px] text-[14px]">Delete</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredCatalogue.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="whitespace-nowrap p-6 text-blue-600 text-center">
                                                Record Not Found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCatalogue.map((element , index) => (
                                            <tr key={element._id}>
                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700 font-bold text-[14px]">
                                                    {index+1}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700 font-bold  text-[14px]">
                                                    {element.email}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700 font-bold  text-[14px]">
                                                    {element.role}
                                                </td>
                                                
                                            
                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                    <RiDeleteBinLine
                                                        color="#CC0000"
                                                        size={20}
                                                        cursor="pointer"
                                                        onClick={() => {
                                                            // fetchSingleCatalogeData(element._id);
                                                            deleteCatalogueModel(element);
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

export default Staff;
