import React, { useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';
import GlobalApiState from '../utilis/globalVariable';
import { useNavigate } from 'react-router-dom';

export default function Stepper2({buyer, userId, salesCharges,soldValue, catalogue, catalogueDesignMap, stepCount, setStepCount, updateInvoiceNumber, invoiceNumber , deliveryCharges , isChecked ,isDelivery}) {
    const pdfRef = useRef(); // Reference for the content to download
    const navigate = useNavigate();
    const currentDate = new Date().toLocaleString(); // Get current date and time
    const [isLoading, setIsLoading] = useState(false)

    const goBack = () => {
        setStepCount(stepCount - 1);
    };

    let totalkhazana = 0;
    const generatePDF = async (contentRef, soldValue) => {
        const content = contentRef.current;
        const canvas = await html2canvas(content, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
    
        const margin = 5;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const halfPageHeight = (pageHeight - margin) / 3;
    
        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, halfPageHeight);
        pdf.addImage(imgData, "PNG", 0, pageHeight / 2, pageWidth, halfPageHeight);
        pdf.save(`${soldValue.buyer.label}_statement.pdf`);
    };
    
    const calculateGrandTotal = (soldValue, catalogueDesignMap) => {
        return soldValue.catalogues.reduce((total, item) => {
            const catalogeDesign = catalogueDesignMap[item.catalogeId]?.find(
                (design) => design._id === item.designId
            );
            return total + (catalogeDesign?.price || 0) * item.khazana;
        }, 0);
    };
    
    const updateInvoice = async (invoiceNumber) => {
        const newInvoice = parseInt(Number(invoiceNumber.invoiceNumber) + 1, 10);
        await updateInvoiceNumber(newInvoice);
        return newInvoice;
    };
    
    const addSale = async (soldValue, grandTotal, invoiceNumber, isChecked) => {
        try {
            const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/sold_design/adds`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    ...soldValue,
                    grandTotal,
                    buyer_phone: soldValue.buyer_number,
                    inVoice: invoiceNumber,
                    paid: isChecked
                }),
            });
            if (response.status === 200) {
                toast.success("Sales Added Successfully");
            }
            return await response.json();
        } catch (err) {
            toast.error(`Error: ${err.message}`);
            console.error(err);
            return null;
        }
    };
    
    const addCostPrice = async (billId, deliveryCharges) => {
        if (!billId) return;
        try {
            await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/cost_price/add`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    ...deliveryCharges,
                    design_bill: billId
                }),
            });
        } catch (err) {
            console.error("Error adding cost price:", err);
        }
    };
    
    const addBuyer = async (buyerName, phoneNumber) => {
        try {
            const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/buyer/add`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    userId:userId,
                    buyer_name: buyerName,
                    phone_number: phoneNumber
                }),
            });
    
            if (response.status === 200) {
                const data = await response.json();
                return data._id;
            } else {
                toast.error("Failed to add buyer");
                return null;
            }
        } catch (err) {
            console.error("Error adding buyer:", err);
            return null;
        }
    };

    const soldCatalogeApi = async () => {
        setIsLoading(true);
        try {
            await generatePDF(pdfRef, soldValue);
        let buyerId =buyer.find((item)=>item.buyer_name === soldValue.buyer.label) || null;
        if (!buyerId) {
            buyerId = await addBuyer(soldValue.buyer.label, soldValue.buyer_number);
            if (!buyerId) {
                setIsLoading(false);
                return; 
            }
        }
            const grandTotal = calculateGrandTotal(soldValue, catalogueDesignMap);
            const currentInvoice = await updateInvoice(invoiceNumber);
            const billResult = await addSale(soldValue, grandTotal, currentInvoice, isChecked);
            if (billResult?.billId) {
                if(isDelivery){
                    await addCostPrice(billResult.billId, deliveryCharges);
                }
                if (isChecked) {
                    await addCostPrice(billResult.billId, salesCharges);
                }
            }
            navigate('/')
        } finally {
            setIsLoading(false);
        }
    };

    let grandTotal = 0;

    return (
        <div className="flex items-start justify-center flex-row lg:w-[80vw] w-[100vw] min-h-[100vh] bg-gray-100">
            <div className="md:p-6 p-2 min-h-screen lg:w-[50vw] md:w-[70vw] w-[100vw] m-auto relative">
                <div ref={pdfRef}>
                    {/* Header */}

                    <div className="bg-orange-600 text-white px-3 py-4 h-[85px] flex items-center justify-between">
                        <div className="flex flex-col items-start">
                            <img className="h-9 w-9 rounded-full" src={require("../assets/brandLogo.jpg")} alt="Inventory Management System" />
                            <h1 className="text-[16px] leading-4 font-semibold">Aveera Collection</h1>
                            <p className='text-[12px]'>03006637315</p>
                        </div>

                        <div className="flex flex-col text-center">
                            <h2 className="text-lg font-bold">
                                {soldValue.buyer.label}
                            </h2>
                            <p className="text-sm font-medium">+92-{soldValue.buyer_number}</p>

                        </div>

                        <div className="flex flex-col items-end">
                            <p className='text-sm sm:text-[15px] font-bold'>
                                Invoice Number: {invoiceNumber.invoiceNumber}
                            </p>
                            <p className="mt-2 text-sm">{currentDate}</p>
                        </div>
                    </div>
                    {/* Body */}
                    <div className="bill-img bg-white shadow-md p-3 md:overflow-auto overflow-x-scroll">
                        <div className="">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border p-2">Sr No</th>
                                        <th className="border p-2">Catalogue</th>
                                        <th className="border p-2">Design</th>
                                        <th className="border p-2">Ghazana</th>
                                        <th className="border p-2">Price</th>
                                        <th className="border p-2">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {soldValue.catalogues.map((item, index) => {
                                        const cataloge = catalogue.find((cata) => cata._id === item.catalogeId);

                                        const catalogeDesign = catalogueDesignMap[item.catalogeId]?.find(
                                            (design) => design._id === item.designId
                                        );
                                        const totalPrice = catalogeDesign?.price ? catalogeDesign.price * item.khazana : 0;
                                        grandTotal += totalPrice;
                                        totalkhazana += +item.khazana
                                        return (
                                            <tr key={index}>
                                                <td className="border p-2 text-center">{index + 1}</td>
                                                <td className="border p-2 text-center">{cataloge?.cataloge_number || "Not Found"}</td>
                                                <td className="border p-2 text-center">{catalogeDesign?.design_number || "Not Found"}</td>
                                                <td className="border p-2 text-center">{item.khazana}</td>
                                                <td className="border p-2 text-center">{catalogeDesign?.price || "Not Found"}</td>
                                                <td className="border p-2 text-center">
                                                    {catalogeDesign?.price ? catalogeDesign.price * item.khazana : "Not Found"}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    <tr>
                                        <td colSpan="3" className="text-right font-bold">Ghazana Total</td>
                                        <td className="text-center font-bold">{totalkhazana}</td>
                                        <td className="text-right font-bold">Grand Total</td>
                                        <td className="text-center font-bold">{grandTotal}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="py-3 flex flex-row-reverse justify-between items-center gap-5  sm:px-6">
                    {/* <div>
                        <input type="checkbox" id="agree" name="terms"
                            value={isChecked}
                            onChange={handleChange}
                            className=''
                        />
                        <label className='ml-2' for="agree">Bill Paid ?</label>
                    </div> */}

                    <div className="px-4 py-3 flex flex-row-reverse items-center gap-5  sm:px-6">
                        <button
                            onClick={soldCatalogeApi}
                            disabled={isLoading}
                            className="md:px-6 py-2 px-3 h-10 md:w-auto w-full text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md text-sm flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            ) : (
                                "Done"
                            )}
                        </button>

                        < div
                            className="md:px-6 px-3 py-2 h-10 md:w-auto w-full  inline-flex  justify-center rounded-md bg-white text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        >
                            <button
                                type="button"
                                onClick={goBack}
                            >
                                Edit
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div >
    );
}
