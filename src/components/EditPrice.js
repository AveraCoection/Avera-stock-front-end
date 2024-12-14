import { Dialog, Transition } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import React, { Fragment, useRef, useState } from 'react'
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import GlobalApiState from '../utilis/globalVariable';
import ConfirmPrice from './ConfirmPriceModel';

export default function EditPrice({ editPrice, handlePageUpdate, editDesign, singlecataloge }) {
    const params = useParams()

    const [open, setOpen] = useState(true);
    const cancelButtonRef = useRef(null);
    const [showDeleteBuyerModal, setDeleteBuyerModal] = useState(false);
    const [design, setDesign] = useState({
        id: editDesign._id,
        cataloge_number: editDesign.cataloge_number,
        stock: editDesign.stock,
        khazana_stock: editDesign.khazana_stock,
        price: editDesign.price
    });

    const deleteBuyerModel = () => {
        setDeleteBuyerModal(!showDeleteBuyerModal);
    };
    const handleInput = (key, value) => {
        setDesign({ ...design, [key]: value });

    };

    return (
        <>
            <Transition.Root show={open} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-10"
                    initialFocus={cancelButtonRef}
                    onClose={setOpen}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0 ">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg overflow-y-scroll">
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:items-start">

                                            {
                                                showDeleteBuyerModal && (
                                                    <ConfirmPrice
                                                        editPrice={editPrice}
                                                        handlePageUpdate={handlePageUpdate}
                                                        design={design}
                                                        editDesign={editDesign}
                                                        deleteBuyerModel={deleteBuyerModel}
    
                                                    />
                                                )
                                            }
                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left ">
                                                <Dialog.Title
                                                    as="h3"
                                                    className="text-lg  py-4 font-semibold leading-6 text-gray-900 "
                                                >
                                                    <div className='flex items-center justify-between'>
                                                        <p>Catalogue  :<span className='font-normal text-blue-500'>{singlecataloge.cataloge_number}   ({editDesign.design_number})</span>  </p>
                                                        {/* <p className=''>Design Number  : {editDesign.design_number} </p> */}

                                                    </div>
                                                    {/* <div className='flex items-center justify-between'>
                                                        <p >Current Thaan  : <span className='font-normal text-blue-500'>{editDesign.stock}</span>  </p>
                                                        <p >Current Khazana  : <span className='font-normal text-blue-500'>{editDesign.khazana_stock}</span>  </p>

                                                    </div> */}



                                                </Dialog.Title>
                                                <form action="#">
                                                    <div className="grid gap-4 mb-4 sm:grid-cols-2">
                                                        <div className='flex items-center justify-center'>
                                                            <div>
                                                                <label
                                                                    htmlFor="stock"
                                                                    className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
                                                                >
                                                                    Price
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    name="price"
                                                                    id="price"
                                                                    min={"0"}
                                                                    value={design.price}
                                                                    onChange={(e) =>
                                                                        handleInput(e.target.name, e.target.value)
                                                                    }
                                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                                    placeholder="price"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                        <button
                                            type="button"
                                            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                                            // onClick={() => editDesignbyId(editDesign._id)}
                                            onClick={() =>
                                                deleteBuyerModel()
                                            }
                                        >
                                            Update
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                            onClick={() => editPrice()}
                                            ref={cancelButtonRef}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </>
    )
}
