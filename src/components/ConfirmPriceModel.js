import { Dialog, Transition } from '@headlessui/react'
import React, { Fragment, useRef, useState } from 'react'
import GlobalApiState from "../utilis/globalVariable"
import { toast } from 'react-toastify';

export default function ConfirmPrice({ editPrice, handlePageUpdate, design, editDesign, deleteBuyerModel }) {
    const [open, setOpen] = useState(true);
    const cancelButtonRef = useRef(null);


    const editDesignbyId = async () => {


        try {
            const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/cataloge_design/update_design/${editDesign._id}`, {
                method: "PUT",
                //credentials: 'include', 
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify(design),
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage || "Failed to update stock");
            }

            const result = await response.json();

            toast.success("Price Updated Successfully");

            handlePageUpdate();
            editPrice();

        } catch (error) {
            if (error.name === 'TypeError') {
                toast.error("Network error. Please check your connection.");
            } else {
                toast.error(`Error: ${error.message}`);
            }

            console.error("Error updating stock:", error);
        }
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
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <p className="text-xl text-center text-gray-500">
                                            Are you sure you want to change the price, which was previously {editDesign.price}?
                                        </p>
                                    </div>

                                    <div className="m-4 flex justify-end gap-4">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400"
                                            ref={cancelButtonRef}
                                            onClick={() => deleteBuyerModel()}                                       >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                                            onClick={() => {
                                                deleteBuyerModel()
                                                editDesignbyId()
                                            }}
                                            ref={cancelButtonRef}

                                        >
                                            Change
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
