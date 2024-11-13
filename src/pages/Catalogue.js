import React, { useContext, useEffect, useState } from 'react'
import AddCatalogue from '../components/AddCatalogue';
import { Link } from 'react-router-dom';
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import AuthContext from '../AuthContext';
import EditCatalogue from '../components/EditCatalogue';
import DeleteCataloge from '../components/DeleteCataloge';
import { ToastContainer } from 'react-toastify';
import GlobalApiState from '../utilis/globalVariable';

function Catalogue() {
    const authContext = useContext(AuthContext);

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
    const deleteCatalogueModel = () => {
        setDeleteCatalogueModal(!showDeleteCatalogueModal);
    };
    const editCatalogueModel = (element) => {
        setEditCatalogueModal(!showEditCatalogueModal);
        setSingleCataloge(element)
    };
    const handlePageUpdate = () => {
        setUpdatePage(!updatePage);
    };
    const filteredCatalogue = catalogue.filter((element) =>
        element.cataloge_number.toLowerCase().includes(searchTerm.toLowerCase())  // Filter by catalogue number
    );


    const fetchCatalogeData = () => {
        fetch(`${GlobalApiState.DEV_BASE_URL}/api/cataloge/list_cataloge/${authContext.user}`)
            .then((response) => response.json())
            .then((data) => {
                setAllCataloge(data);
            })
            .catch((err) => console.log(err));
    };
    const fetchSingleCatalogeData = (id) => {
        fetch(`${GlobalApiState.DEV_BASE_URL}/api/cataloge/edit_cataloge/${id}`)
            .then((response) => response.json())
            .then((data) => {
                setSingleCataloge(data);
            })
            .catch((err) => console.log(err));
    };


    // const deleteItem = async (id) => {

    //     try {
    //         const response = await fetch(`https://avera-stock-back-end.vercel.app/api/cataloge/delete_cataloge/${id}`, {
    //             method: 'DELETE'
    //         });
    //         const data = await response.json();

    //         setUpdatePage(!updatePage);
    //     } catch (error) {
    //         console.error('Error deleting item:', error);
    //     }
    // };


    useEffect(() => {
        fetchCatalogeData();
        // toast.success("hello")
    }, [updatePage]);

    return (
        <>

            <div className="col-span-12 lg:col-span-10  flex justify-center">

                <div className=" flex flex-col gap-5 w-11/12">

                    {showCatalogueModal && (
                        <AddCatalogue
                            addCatalogueModel={addCatalogueModel}
                            handlePageUpdate={handlePageUpdate}
                        // authContext = {authContext}
                        />
                    )}

                    {showEditCatalogueModal && (
                        <EditCatalogue
                            editCatalogueModel={editCatalogueModel}
                            handlePageUpdate={handlePageUpdate}
                            singlecatalogue={singlecatalogue}
                        // authContext = {authContext}
                        />
                    )}

                    {showDeleteCatalogueModal && (
                        <DeleteCataloge
                            deleteCatalogueModel={deleteCatalogueModel}
                            updatePage={updatePage}
                            setUpdatePage={setUpdatePage}
                            singlecatalogue={singlecatalogue}
                        />
                    )}
                    <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 ">
                        <ToastContainer />
                        <div className="flex gap-4 justify-start items-start p-5 ">
                            <span className="font-bold">Catalogue Details</span>
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
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs  rounded"
                                    onClick={addCatalogueModel}
                                >
                                    Add Catalogue
                                </button>
                            </div>
                        </div>
                        <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
                            <thead>
                                <tr>
                                    <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                                        Catalogue Number
                                    </th>
                                    <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                                        View book
                                    </th>
                                    <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                                        Edit
                                    </th>
                                    <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                                        Delete
                                    </th>
                                </tr>
                            </thead>

                            {/* <tbody className="divide-y divide-gray-200">

                                <tr>
                                    <td className="whitespace-nowrap px-4 py-2  text-gray-900">
                                        5072
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-2 text-blue-500 " >
                                        <Link to={"/catalogue-detail"} >View Detail</Link>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                        <FaRegEdit color="gray" size={22} />
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                        <RiDeleteBinLine color="gray" size={22} />
                                    </td>
                                </tr>
                            </tbody> */}
                            <tbody className="divide-y divide-gray-200">
                                {
                                    filteredCatalogue.length == 0 ? (
                                        <tr>
                                            <td colSpan="4" className="whitespace-nowrap p-6 text-blue-600 text-center">
                                                Record Not Found
                                            </td>
                                        </tr>) : (
                                        
                                            filteredCatalogue.map((element, index) => {
                                                return (
                                                    <tr key={element._id}>

                                                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                            {element.cataloge_number}
                                                        </td>

                                                        <td className="whitespace-nowrap px-4 py-2 text-blue-500 " >
                                                            <Link to={`/catalogue-detail/${element._id}`} >View Detail</Link>
                                                        </td>
                                                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                            <span onClick={() => {
                                                                // fetchSingleCatalogeData(element._id);
                                                                editCatalogueModel(element)
                                                            }}>
                                                                <FaRegEdit color="gray" size={22} cursor={'pointer'}

                                                                />
                                                            </span>

                                                        </td>
                                                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">

                                                            <RiDeleteBinLine color="gray" size={22} cursor={'pointer'}
                                                                // onClick={() => deleteItem(element._id)}
                                                                onClick={() => {
                                                                    fetchSingleCatalogeData(element._id);
                                                                    deleteCatalogueModel()
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
                    </div>
                </div>
            </div>
        </>
    )
}

export default Catalogue
