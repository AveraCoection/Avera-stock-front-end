import { Menu } from '@headlessui/react'
import React, { useState, useEffect } from 'react'
import AddCatalogue from '../components/AddCatalogue';
import AddDesign from '../components/AddDesign';
import EditDesign from '../components/EditDesign';
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { useParams } from 'react-router-dom';
import DeleteDesign from '../components/DeleteDesign';
import EditDesignBySell from '../components/EditDesign';
import EditDesignByAdd from '../components/EditStockInDesign';
import { ToastContainer } from 'react-toastify';

export default function CatalogueDetail() {
    const params = useParams()

    const [showDesignModal, setDesignModal] = useState(false);
    const [showEditDesignModal, setEditDesignModal] = useState(false);
    const [showEditDesignModalSold, setEditDesignModalSold] = useState(false);
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
    const handlePageUpdate = () => {
        setUpdatePage(!updatePage);
    };
    const deleteCatalogueModel = () => {
        setDeleteDesignModal(!showDeleteDesignModal);
    };
    const fetchCatalogeData = () => {
        fetch(`http://localhost:4000/api/cataloge_design/list_design/${params.cataloge}`)
            .then((response) => response.json())
            .then((data) => {
                setAllCatalogeDesign(data);
            })
            .catch((err) => console.log(err));
    };

    const fetchSingleCatalogeData = () => {
        fetch(`http://localhost:4000/api/cataloge/edit_cataloge/${params.cataloge}`)
            .then((response) => response.json())
            .then((data) => {
                setSingleCataloge(data);
            })
            .catch((err) => console.log(err));
    };
    const fetchSingleDesignData = (id) => {
        fetch(`http://localhost:4000/api/cataloge_design/edit_design/${id}`)
            .then((response) => response.json())
            .then((data) => {
                setSingleDesign(data);
            })
            .catch((err) => console.log(err));
    };

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

                    {showDeleteDesignModal && (
                        <DeleteDesign
                            deleteCatalogueModel={deleteCatalogueModel}
                            updatePage={updatePage}
                            setUpdatePage={setUpdatePage}
                            singleDesign={singleDesign}
                        />
                    )}

                    <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 pb-11">
                        <div className="flex justify-between pt-5 pb-3 px-3">
                            <div className="flex gap-4 justify-center items-center">
                                <span className="font-bold">Catalogue : {singlecataloge.cataloge_number}</span>
                            </div>
                            <ToastContainer/>
                            <div className="flex gap-4">
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded"
                                    onClick={addDesignModel}
                                >
                                    Add Design
                                </button>
                            </div>
                        </div>
                        <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
                            <thead>
                                <tr>
                                    <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                                        Design Number
                                    </th>
                                    <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                                        Total Stock
                                    </th>
                                    <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                                        Edit
                                    </th>
                                    <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                                        Delete
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {catalogueDesign?.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="whitespace-nowrap p-6 text-blue-600 text-center">
                                            Record Not Found
                                        </td>
                                    </tr>
                                ) : (
                                    catalogueDesign.map((element) => (
                                        <tr key={element._id}>
                                            <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                {element.design_number}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                {element.stock}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                <span
                                                    className='text-green-600 pr-2 cursor-pointer'
                                                    onClick={() => {
                                                        editDesignModelByAdd(element);
                                                    }}
                                                >
                                                    Add
                                                </span>
                                                <span
                                                    className='text-red-600 pr-2 cursor-pointer'
                                                    onClick={() => {
                                                        editDesignModel(element);
                                                    }}
                                                >
                                                    Sold
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                <RiDeleteBinLine
                                                    color="gray"
                                                    size={22}
                                                    cursor={'pointer'}
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
                    </div>
                </div>
            </div>
        </>
    );
}
