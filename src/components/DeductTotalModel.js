import React, { useState } from "react";
import GlobalApiState from "../utilis/globalVariable";
import { toast } from "react-toastify";

const DeductTotalModal = ({ isOpen, onClose,handlePageUpdate , buyerId , userId }) => {
    const [deduction, setDeduction] = useState("");

    const handleDeduct = async () => {
        try {
            const response = await fetch(
                `${GlobalApiState.DEV_BASE_LIVE}/api/sold_design/deduct-payment/${userId}?buyerID=${buyerId}`, 
                {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                    },
                    body: JSON.stringify({ amount: Number(deduction) }),
                }
            );
    
            const data = await response.json(); // Extract JSON response
            if (response.ok) {
                toast.success(data.message || "Price Deducted Successfully");
                handlePageUpdate();
            } else {
                toast.error(data.error || "Failed to deduct price");
            }
        } catch (err) {
            toast.error(`Error: ${err.message}`);
            console.error(err);
        } 
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Deduct from Total</h2>
                <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter amount to deduct"
                    value={deduction}
                    onChange={(e) => setDeduction(e.target.value)}
                />
                <div className="flex justify-end mt-4">
                    <button className="px-4 py-2 bg-red-500 text-white rounded-md mr-2" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-md" onClick={handleDeduct}>
                        Deduct
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeductTotalModal;
