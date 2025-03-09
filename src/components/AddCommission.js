import { Dialog, Transition } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import React, { Fragment, useContext, useEffect, useRef, useState } from 'react';
import AuthContext from '../AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GlobalApiState from '../utilis/globalVariable';

export default function AddCommision({ addBuyerModel, handlePageUpdate }) {
    const [open, setOpen] = useState(true);
    const [error, setErrors] = useState({});
    const cancelButtonRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useContext(AuthContext);

    const [commision, setCommision] = useState({
        userId: user.user._id,
        name: "",
        commissionPrice: "",
        type: "",
    });

    // Function to handle input change
    const handleInputChange = (key, value) => {
        setCommision({ ...commision, [key]: value });
        if (value.trim()) {
            setErrors("");
        }
    };
    const validateFields = () => {
        const fieldErrors = {};
        if (!commision.name.trim()) {
            fieldErrors.name = "Name is required";
        }
        if (!commision.type.trim()) {
            fieldErrors.type = "Type is required";
        }
        if (!commision.commissionPrice.trim()) {
            fieldErrors.type = "Amount is required";
        }
        setErrors(fieldErrors);
        return Object.keys(fieldErrors).length === 0
    }

    const addBuyer = async () => {
        if (!validateFields()) {
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/commision/add`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify(commision),
            });
            if (response.status === 200) {
                toast.success("Commission Added Successfully");
                handlePageUpdate();
                addBuyerModel();
            } else {
                toast.error("Failed to add commision");
            }
        } catch (err) {
            toast.error(`Error: ${err.message}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }
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
                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left ">
                                                <Dialog.Title
                                                    as="h3"
                                                    className="text-lg  py-4 font-semibold leading-6 text-gray-900 "
                                                >
                                                    Commission
                                                </Dialog.Title>
                                                <form action="#">

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label
                                                                htmlFor="name"
                                                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                            >
                                                                Name
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="name"
                                                                id="name"
                                                                value={commision.name}
                                                                onChange={(e) =>
                                                                    handleInputChange(e.target.name, e.target.value)
                                                                }
                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                                placeholder="name"
                                                            />
                                                            {/* Error message */}
                                                            {error.name && (
                                                                <p className="mt-1 text-sm text-red-600">
                                                                    {error.name}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label
                                                                htmlFor="commissionPrice"
                                                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                            >
                                                                Commission Amount
                                                            </label>
                                                            <input
                                                                type="number"
                                                                name="commissionPrice"
                                                                id="commissionPrice"
                                                                value={commision.commissionPrice}
                                                                onChange={(e) =>
                                                                    handleInputChange(e.target.name, e.target.value)
                                                                }
                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                                placeholder="amount"
                                                            />
                                                            {/* Error message */}
                                                            {error.commissionPrice && (
                                                                <p className="mt-1 text-sm text-red-600">
                                                                    {error.commissionPrice}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className='mt-2'>
                                                        <label htmlFor="type" className="block mb-2 text-sm font-medium text-gray-900">
                                                            Type
                                                        </label>
                                                        <select
                                                            name="type"
                                                            id="type"
                                                            value={commision.type}
                                                            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                                                            className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-primary-600 focus:border-primary-600"
                                                        >
                                                            <option value="">Select Type</option>
                                                            <option value="Sale">Commission on Sales</option>
                                                            <option value="Agent">Commission for Agent</option>
                                                        </select>
                                                        {error.type && <p className="mt-1 text-sm text-red-600">{error.type}</p>}
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                        <button
                                            type="button"
                                            className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-white"
                                                }`}
                                            onClick={addBuyer}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>

                                                </div>
                                            ) : (
                                                <>
                                                    <p>Add</p>
                                                </>
                                            )}

                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                            onClick={() => addBuyerModel()}
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
    );
}
