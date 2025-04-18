import { Dialog, Transition } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import React, { Fragment, useContext, useEffect, useRef, useState } from 'react';
import AuthContext from '../AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GlobalApiState from '../utilis/globalVariable';

export default function AddCostPrice({ addCostPriceModel, handlePageUpdate, sold }) {
    const [open, setOpen] = useState(true);
    const [error, setErrors] = useState({});
    const cancelButtonRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useContext(AuthContext);
    const [filteredCommission, setFilteredCommission] = useState([])
    const [costPrice, setCostPrice] = useState({
        userId: user.user._id,
        cost_type: "",
        cost_name: "",
        design_bill: "",
        // commission_name: "",
        // commission_type: "",
    });

    // Function to handle input change
    const handleInputChange = (key, value) => {
        if (key === "cost_type" && value === "Commission for Agent") {
            fetchBuyerData(value);
            setCostPrice(prevState => ({
                ...prevState,
                commission_type: "Agent"
            }));
        }
        setCostPrice(prevState => ({
            ...prevState,
            [key]: value
        }));
        if (value.trim()) {
            setErrors("");
        }
    };
    const validateFields = () => {
        const fieldErrors = {};
        if (!costPrice.cost_type.trim()) {
            fieldErrors.cost_type = "Type is required";
        }
        if (!costPrice.cost_name.trim()) {
            fieldErrors.cost_name = "Cost Amount is required";
        }
        setErrors(fieldErrors);
        return Object.keys(fieldErrors).length === 0
    }


    const addCostPrice = async () => {
        if (!validateFields()) {
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/cost_price/add`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify(costPrice),
            });
            if (response.status === 200) {
                toast.success("Cost Price Added Successfully");
                handlePageUpdate();
                addCostPriceModel();
            } else {
                toast.error("Failed to add costPrice");
            }
        } catch (err) {
            toast.error(`Error: ${err.message}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    const fetchBuyerData = async (selectedType) => {
        try {
            const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/commision/get-commision/${user.user._id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            const filterType = data.filter((item) => item.type === "Agent")
            setFilteredCommission(filterType);
        } catch (error) {
            console.error("Error fetching commision data:", error);
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
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg overflow-y-scroll">
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:items-start">
                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left ">
                                                <Dialog.Title
                                                    as="h3"
                                                    className="text-lg  py-4 font-semibold leading-6 text-gray-900 "
                                                >
                                                    Cost Price
                                                </Dialog.Title>
                                                <form action="#" className="space-y-4">
                                                    {/* Cost Type & Cost Amount Fields */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {/* Cost Type */}
                                                        <div>
                                                            <label htmlFor="cost_type" className="block mb-2 text-sm font-medium text-gray-900">
                                                                Cost Type
                                                            </label>
                                                            <select
                                                                name="cost_type"
                                                                id="cost_type"
                                                                value={costPrice.cost_type}
                                                                onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                                                                className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-primary-600 focus:border-primary-600"
                                                            >
                                                                <option value="">Select Cost Type</option>
                                                                <option value="Commission for Agent">Commission for Agent</option>
                                                                <option value="Cataloge Expense">Cataloge Expense</option>
                                                                <option value="Others">Others</option>
                                                            </select>
                                                            {error.cost_type && <p className="mt-1 text-sm text-red-600">{error.cost_type}</p>}
                                                        </div>

                                                        {/* Cost Amount */}
                                                        <div>
                                                            <label htmlFor="cost_name" className="block mb-2 text-sm font-medium text-gray-900">
                                                                Cost Amount
                                                            </label>
                                                            <input
                                                                type="number"
                                                                name="cost_name"
                                                                id="cost_name"
                                                                value={costPrice.cost_name}
                                                                onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                                                                className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-primary-600 focus:border-primary-600"
                                                                placeholder="Enter amount"
                                                            />
                                                            {error.cost_name && <p className="mt-1 text-sm text-red-600">{error.cost_name}</p>}
                                                        </div>
                                                    </div>

                                                    {/* Design Bill Selection */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label htmlFor="design_bill" className="block mb-2 text-sm font-medium text-gray-900">
                                                                Bill
                                                            </label>
                                                            <select
                                                                name="design_bill"
                                                                id="design_bill"
                                                                value={costPrice.design_bill}
                                                                onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                                                                className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-primary-600 focus:border-primary-600"
                                                            >
                                                                <option value="">Select Buyer</option>
                                                                {sold?.map((buyer, index) => (
                                                                    <option key={index} value={buyer._id}>
                                                                        {buyer.buyer?.label || buyer.buyer}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {error.design_bill && <p className="mt-1 text-sm text-red-600">{error.design_bill}</p>}
                                                        </div>
                                                        {/* <div>
                                                            <label htmlFor="cost_type" className="block mb-2 text-sm font-medium text-gray-900">
                                                                Commission Type
                                                            </label>
                                                            <select
                                                                name="commission_type"
                                                                id="commission_type"
                                                                value={costPrice.commission_type}
                                                                onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                                                                className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-primary-600 focus:border-primary-600"
                                                            >
                                                                <option value="">Commission Type</option>
                                                                <option value="Sale"> Sale</option>
                                                                <option value="Agent">Agent</option>
                                                            </select>
                                                            {error.commission_type && <p className="mt-1 text-sm text-red-600">{error.cost_type}</p>}
                                                        </div> */}
                                                        {costPrice.cost_type === "Commission for Agent" && (
                                                            <div>
                                                                <label htmlFor="commission_name" className="block mb-2 text-sm font-medium text-gray-900">
                                                                    Commission Name
                                                                </label>
                                                                <select
                                                                    name="commission_name"
                                                                    id="commission_name"
                                                                    value={costPrice.commission_name}
                                                                    onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                                                                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-primary-600 focus:border-primary-600"
                                                                >
                                                                    <option value="">Select Commission</option>
                                                                    {filteredCommission.map((commission, index) => (
                                                                        <option key={index} value={commission._id}>
                                                                            {commission.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )}
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
                                            onClick={addCostPrice}
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
                                            onClick={() => addCostPriceModel()}
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
