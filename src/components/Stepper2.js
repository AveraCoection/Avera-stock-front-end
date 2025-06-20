import React, { useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';
import GlobalApiState from '../utilis/globalVariable';
import { useNavigate } from 'react-router-dom';

export default function Stepper2({ buyer, userId, salesCharges, soldValue, catalogue, catalogueDesignMap,
     stepCount, setStepCount, updateInvoiceNumber, invoiceNumber, deliveryCharges, isChecked, isDelivery,
    discountType,setDiscountType,discountPercentage,setDiscountPercentage,discountValue,setDiscountValue
    }) {
    const pdfRef = useRef(); // Reference for the content to download
    const navigate = useNavigate();
    const currentDate = new Date().toLocaleString(); // Get current date and time
    const [isLoading, setIsLoading] = useState(false);
   
    const goBack = () => {
        setStepCount(stepCount - 1);
    };
    let totalkhazana = 0;
    
const generatePDF = async (contentRef, soldValue) => {
    const itemsPerPage = 8;
    const totalItems = soldValue.catalogues.length;
    const pdf = new jsPDF("p", "mm", "a4");
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();

    const renderCanvas = async () => {
        const canvas = await html2canvas(contentRef.current, { scale: 2 });
        return canvas.toDataURL("image/png");
    };

    const showRows = (start, end) => {
        const allRows = contentRef.current.querySelectorAll('tbody tr');
        allRows.forEach((row, index) => {
            row.style.display = (index >= start && index < end) ? '' : 'none';
        });
    };

    const restoreRows = () => {
        const allRows = contentRef.current.querySelectorAll('tbody tr');
        allRows.forEach(row => row.style.display = '');
    };

    // Case 1: Short bill (<= 8 items) — same page original + copy
    if (totalItems <= 8) {
        const imgData = await renderCanvas();
        const imgWidth = pageWidth;
        const imgHeight = (contentRef.current.offsetHeight * imgWidth) / contentRef.current.offsetWidth;
        const halfPageHeight = pageHeight / 2;
        const scale = Math.min(1, halfPageHeight / imgHeight);
        const scaledHeight = imgHeight * scale;
        const scaledWidth = imgWidth * scale;

        pdf.addImage(imgData, "PNG", 0, 0, scaledWidth, scaledHeight);
        pdf.setLineWidth(0.5);
        pdf.setDrawColor(150, 150, 150);
        pdf.setLineDash([2, 2], 0);
        pdf.line(0, pageHeight / 2, pageWidth, pageHeight / 2);
        pdf.setFontSize(10);
        pdf.setTextColor(180);
        pdf.text("Cut or Fold Here", pageWidth / 2, pageHeight / 2 - 2, { align: "center" });
        pdf.addImage(imgData, "PNG", 0, pageHeight / 2 + 2, scaledWidth, scaledHeight);
        pdf.text("COPY", pageWidth - 5, pageHeight / 2 + scaledHeight + 5, { align: "right" });

    } 
    // Case 2: Medium bill (9 to 15 items) — original on page 1, copy on page 2
    else if (totalItems <= 15) {
        // Original
        const imgData = await renderCanvas();
        const imgWidth = pageWidth;
        const imgHeight = (contentRef.current.offsetHeight * imgWidth) / contentRef.current.offsetWidth;
        const scale = Math.min(1, pageHeight / imgHeight);
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth * scale, imgHeight * scale);

        // Copy
        pdf.addPage();
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text("COPY", pageWidth - 5, 5, { align: "right" });
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth * scale, imgHeight * scale);
    } 
    // Case 3: Long bill (> 15 items) — paginated original and copy
    else {
        for (let copy = 0; copy < 2; copy++) {
            const isCopy = copy === 1;

            for (let i = 0; i < totalItems; i += itemsPerPage) {
                if (i > 0 || isCopy) pdf.addPage();
                if (isCopy) {
                    pdf.setFontSize(10);
                    pdf.setTextColor(150, 150, 150);
                    pdf.text("COPY", pageWidth - 5, 5, { align: "right" });
                }

                showRows(i, i + itemsPerPage);
                const imgData = await renderCanvas();
                const imgWidth = pageWidth;
                const imgHeight = (contentRef.current.offsetHeight * imgWidth) / contentRef.current.offsetWidth;
                const scale = Math.min(1, pageHeight / imgHeight);
                pdf.addImage(imgData, "PNG", 0, 0, imgWidth * scale, imgHeight * scale);
                restoreRows();
            }
        }
    }

    restoreRows(); // just in case
    pdf.save(`${soldValue.buyer.label}_invoice.pdf`);
};

    const calculateGrandTotal = (soldValue, catalogueDesignMap) => {
        return soldValue.catalogues.reduce((total, item) => {
            const catalogeDesign = catalogueDesignMap[item.catalogeId]?.find(
                (design) => design._id === item.designId
            );
            return total + (catalogeDesign?.price || 0) * item.khazana;
        }, 0);
    };

    const calculateDiscount = (grandTotal) => {
        if (discountType === 'fixed') {
            return Math.min(discountValue, grandTotal); 
        } else if (discountType === 'percentage') {
            return (grandTotal * discountPercentage) / 100;
        }
        return 0;
    };

    const calculateFinalTotal = (grandTotal) => {
        const discount = calculateDiscount(grandTotal);
        return grandTotal - discount;
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
                    paid: isChecked,

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
                    userId: userId,
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

            let buyerId = buyer.find((item) => item.buyer_name === soldValue.buyer.label) || null;
            if (!buyerId) {
                buyerId = await addBuyer(soldValue.buyer.label, soldValue.buyer_number);
                if (!buyerId) {
                    setIsLoading(false);
                    return;
                }
            }

            const grandTotal = calculateGrandTotal(soldValue, catalogueDesignMap);
            const discount = calculateDiscount(grandTotal);
            const finalTotal = grandTotal - discount;
            const currentInvoice = await updateInvoice(invoiceNumber);

            const updatedSoldValue = {
                ...soldValue,
                discount,
            };

            const billResult = await addSale(
                updatedSoldValue,
                finalTotal,
                currentInvoice,
                isChecked
            );

            if (billResult?.billId) {
                if (isDelivery) {
                    await addCostPrice(billResult.billId, deliveryCharges);
                }
                if (isChecked) {
                    await addCostPrice(billResult.billId, salesCharges);
                }
            }

            navigate('/');
        } finally {
            setIsLoading(false);
        }
    };

    let grandTotal = 0;

    return (
        <div className="flex justify-center items-start min-h-screen bg-gray-100 px-2">
            <div className="md:p-6 p-2 w-full max-w-4xl relative">
                {/* Invoice/Bill Paper - Header remains exactly the same */}
                <div ref={pdfRef} id='pdf-content' className=" bill-container bg-white border-2 border-gray-400 shadow-lg">
                    {/* Your Original Header - Unchanged */}
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

                    {/* Enhanced Body Section */}
                    <div className="p-2 border-gray-400">
                        <table className="w-full border-collapse border  border-black">
                            <thead>
                                <tr className="bg-gray-100 border-black"  style={{ borderColor: "#000", borderWidth: "1px" }}>
                                    <th className="border p-1  border-black text-left text-lg "  style={{ borderColor: "#000", borderWidth: "1px" }}>#</th>
                                    <th className="border p-1  border-black text-left text-[18px] "  style={{ borderColor: "#000", borderWidth: "1px" }}>Catalogue</th>
                                    <th className="border p-1  border-black text-left text-lg "  style={{ borderColor: "#000", borderWidth: "1px" }}>Design</th>
                                    <th className="border p-1  border-black text-left text-lg "  style={{ borderColor: "#000", borderWidth: "1px" }}>Ghazana</th>
                                    <th className="border p-1  border-black text-left text-lg "  style={{ borderColor: "#000", borderWidth: "1px" }}>Rate</th>
                                    <th className="border p-1  border-black text-left text-lg "  style={{ borderColor: "#000", borderWidth: "1px" }}>Amount</th>
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
                                    totalkhazana += +item.khazana;

                                    return (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                            <td className="border p-1  border-black text-md text-center"  style={{ borderColor: "#000", borderWidth: "1px" }}>{index + 1}</td>
                                            <td className="border p-1  border-black text-md text-center"  style={{ borderColor: "#000", borderWidth: "1px" }}>{cataloge?.cataloge_number || "N/A"}</td>
                                            <td className="border p-1  border-black text-md text-center"  style={{ borderColor: "#000", borderWidth: "1px" }}>{catalogeDesign?.design_number || "N/A"}</td>
                                            <td className="border p-1  border-black text-md text-center"  style={{ borderColor: "#000", borderWidth: "1px" }}>{item.khazana}</td>
                                            <td className="border p-1  border-black text-md text-center"  style={{ borderColor: "#000", borderWidth: "1px" }}>{catalogeDesign?.price?.toFixed(2) || "N/A"}</td>
                                            <td className="border p-1  border-black text-md text-center font-medium"  style={{ borderColor: "#000", borderWidth: "1px" }}>
                                                {catalogeDesign?.price ? (catalogeDesign.price * item.khazana).toFixed(2) : "N/A"}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {/* Add empty rows if less than 9 entries */}
                                {Array.from({ length: Math.max(0, 9 - soldValue.catalogues.length) }).map((_, fillerIndex) => (
                                    <tr key={`filler-${fillerIndex}`} className={fillerIndex % 2 === 0 ? 'bg-gray-50' : ''}>
                                        <td className="border p-1  border-black text-md text-center" style={{ borderColor: "#000", borderWidth: "1px" }}>&nbsp;</td>
                                        <td className="border p-1  border-black text-md text-center" style={{ borderColor: "#000", borderWidth: "1px" }}>&nbsp;</td>
                                        <td className="border p-1  border-black text-md text-center" style={{ borderColor: "#000", borderWidth: "1px" }}>&nbsp;</td>
                                        <td className="border p-1  border-black text-md text-center" style={{ borderColor: "#000", borderWidth: "1px" }}>&nbsp;</td>
                                        <td className="border p-1  border-black text-md text-center" style={{ borderColor: "#000", borderWidth: "1px" }}>&nbsp;</td>
                                        <td className="border p-1  border-black text-md text-center" style={{ borderColor: "#000", borderWidth: "1px" }}>&nbsp;</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </div>

                    <div className="px-4">
                        {/* Single row for Ghazana, Gross Total, and Discount */}
                        <div className="flex justify-between text-md mb-2 gap-4">
                            <div className="flex flex-row gap-1">
                                <span className="font-semibold text-md">Total Ghazana:</span>
                                <span className="font-bold text-md">{totalkhazana}</span>
                            </div>

                            <div className="flex flex-row gap-1">
                                <span className="font-semibold text-md">Gross Total:</span>
                                <span className="font-bold text-md">{grandTotal.toFixed(2)}</span>
                            </div>

                            {discountType !== 'none' && calculateDiscount(grandTotal) > 0 && (
                                <div className="flex flex-row gap-1 text-red-600">
                                    <span className="font-semibold text-md">
                                        Discount {discountType === 'percentage' ? `(${discountPercentage}%)` : ''}:
                                    </span>
                                    <span className="text-md font-bold">-{calculateDiscount(grandTotal).toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        {/* Net Payable */}
                        <div className="flex justify-between text-lg mb-2">
                            <span className="font-bold">Net Payable:</span>
                            <span className="font-bold text-blue-700">{calculateFinalTotal(grandTotal).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Discount Controls - Not visible in PDF (same as before) */}
                <div className='flex lg:w-[93%] w-[100%]  justify-end items-center'>
                    <div className="mt-4 p-4 bg-white rounded shadow no-print">
                        <div className="flex flex-col space-y-4">
                            <div className="flex items-center gap-2 justify-between">
                                <h3 className="font-medium text-gray-700">Add Discount</h3>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={discountType !== 'none'}
                                        onChange={(e) => setDiscountType(e.target.checked ? 'percentage' : 'none')}
                                        className="sr-only peer"
                                    />
                                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            {discountType !== 'none' && (
                                <div className="flex flex-col space-y-3 discount-controls">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center">
                                            <input
                                                id="percentage-discount"
                                                name="discount-type"
                                                type="radio"
                                                checked={discountType === 'percentage'}
                                                onChange={() => setDiscountType('percentage')}
                                                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor="percentage-discount" className="ml-2 block text-sm text-gray-700">
                                                Percentage
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                id="fixed-discount"
                                                name="discount-type"
                                                type="radio"
                                                checked={discountType === 'fixed'}
                                                onChange={() => setDiscountType('fixed')}
                                                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor="fixed-discount" className="ml-2 block text-sm text-gray-700">
                                                Fixed Amount
                                            </label>
                                        </div>
                                    </div>

                                    {discountType === 'percentage' ? (
                                        <div className="flex items-center space-x-2">
                                            <select
                                                value={discountPercentage}
                                                onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            >
                                                <option value="0">Select percentage</option>
                                                <option value="5">5%</option>
                                                <option value="10">10%</option>
                                                <option value="15">15%</option>
                                                <option value="20">20%</option>
                                                <option value="25">25%</option>
                                                <option value="30">30%</option>
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <div className="relative rounded-md shadow-sm">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span className="text-gray-500 sm:text-sm">Rs.</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={discountValue}
                                                    onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value)))}
                                                    className="block w-full rounded-md border-gray-300 pl-12 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="1"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Action Buttons - Not visible in PDF (same as before) */}
                <div className="py-3 flex flex-row-reverse justify-between items-center gap-5 sm:px-6 no-print">
                    <div className="px-4 py-3 flex flex-row-reverse items-center gap-5 sm:px-6">
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

                        <div
                            className="md:px-6 px-3 py-2 h-10 md:w-auto w-full inline-flex justify-center rounded-md bg-white text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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
        </div>
    );
}