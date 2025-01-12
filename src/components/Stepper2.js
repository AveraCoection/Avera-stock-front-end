import React, { useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';
import GlobalApiState from '../utilis/globalVariable';
import { useNavigate } from 'react-router-dom';

export default function Stepper2({ soldValue, catalogue, catalogueDesignMap, stepCount, setStepCount, updateInvoiceNumber, invoiceNumber }) {
    const pdfRef = useRef(); // Reference for the content to download
    const navigate = useNavigate();
    const currentDate = new Date().toLocaleString(); // Get current date and time

    const goBack = () => {
        setStepCount(stepCount - 1);
    };

    const soldCatalogeApi = async () => {
        const content = pdfRef.current;
        const canvas = await html2canvas(content, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${soldValue.buyer.label}_statement.pdf`);

        const grandTotal = soldValue.catalogues.reduce((total, item) => {
            const catalogeDesign = catalogueDesignMap[item.catalogeId]?.find(
                (design) => design._id === item.designId
            );
            return total + (catalogeDesign?.price || 0) * item.khazana;
        }, 0)

        const currentInvoice = parseInt(Number(invoiceNumber.invoiceNumber) + 1, 10);
        await updateInvoiceNumber(currentInvoice)

        try {
            const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/sold_design/adds`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify({
                    ...soldValue
                    , grandTotal,
                    buyer_phone: soldValue.buyer_number,
                    inVoice: invoiceNumber.invoiceNumber
                }),
            });
            if (response.status === 200) {
                toast.success("Sales Added Successfully");
            }
        } catch (err) {
            toast.error(`Error: ${err.message}`);
            console.error(err);
        }
        navigate("/");
    };

    let grandTotal = 0;

    return (
        <div className="flex items-start justify-center flex-row lg:w-[80vw] w-[100vw] min-h-[100vh] bg-gray-100">
            <div className="md:p-6 p-2 min-h-screen lg:w-[50vw] md:w-[70vw] w-[100vw] m-auto relative">
                <div ref={pdfRef}>
                    {/* Header */}
                    <div className="bg-orange-600 text-white p-4 pb-4 h-[100px] flex items-center justify-between">
                        <div className="pb-6">
                            <h1 className="text-2xl font-bold">Aveera Collection</h1>
                            <p>03006637315</p>
                        </div>
                        <div className="flex justify-center items-center gap-2 pb-6">
                            <img
                                className="h-11 w-11 rounded-full"
                                src={require("../assets/brandLogo.jpg")}
                                alt="Inventory Management System"
                            />
                        </div>
                    </div>

                    {/* Body */}
                    <div className="bill-img bg-white shadow-md md:p-6 p-2 md:overflow-auto overflow-x-scroll">
                        <div className='flex flex-col md:flex-row justify-between gap-2'>
                            <div>
                                <h2 className="text-[15px] sm:text-lg md:text-xl font-bold">
                                    Party Name: {soldValue.buyer.label}
                                </h2>
                                <p className="text-gray-600 text-sm sm:text-[15px]">
                                    Phone Number: +92-{soldValue.buyer_number}
                                </p>
                            </div>

                            <div>
                                <p className='text-sm sm:text-[15px] font-bold'>
                                    Invoice Number: {invoiceNumber.invoiceNumber}
                                </p>
                                <p className="mt-2 text-sm">{currentDate}</p>
                            </div>
                        </div>


                        <div className="mt-8">
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
                                        <td colSpan="5" className="text-right font-bold p-2">Grand Total</td>
                                        <td className="text-center font-bold p-2">{grandTotal}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-3 flex flex-row-reverse items-center gap-5  sm:px-6">
                    <button
                        onClick={soldCatalogeApi}
                        className="md:px-6 py-2 px-3 h-10 md:w-auto hidden md:block w-full text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md text-sm "
                    >
                        Done
                    </button>
                    <div
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
    );
}
