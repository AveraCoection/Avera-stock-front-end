import React, { useContext, useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';
import GlobalApiState from '../utilis/globalVariable';
import { useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../AuthContext';

export default function BillHistory() {
    const {user} = useContext(AuthContext);
    const params = useParams()
    const pdfRef = useRef(); // Reference for the content to download
    const [updatePage, setUpdatePage] = useState(true);
    const [catalogue, setAllCataloge] = useState([]);
    const [sold, setAllSold] = useState({});
    const [designData, setDesignData] = useState({});
    const [grandTotal, setGrandTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const currentDate = new Date().toLocaleString();
    let totalkhazana = 0;
    const currentInvoice = sold?.inVoice
        ? sold.inVoice.toString().padStart(4, "0")
        : "0000";



    const fetchCatalogeData = async () => {
        try {
            const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/cataloge/list_cataloge/${user.user._id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setAllCataloge(data);
        } catch (error) {
            console.error("Error fetching catalog data:", error);
        }
    };

    const fetchSalesData = async () => {

        try {
            const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/sold_design/get-bill/${params.id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setAllSold(data);
        } catch (err) {
            console.error("Failed to fetch sales data:", err); // Log the error
        }
    };

    const fetchDesignData = async (designIds) => {
        try {
            const designDataPromises = designIds.map((id) =>
                fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/cataloge_design/edit_design/${id}`)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then((data) => ({ id, data }))
            );

            const fetchedData = await Promise.all(designDataPromises);

            setDesignData((prev) => {
                const newData = { ...prev };
                fetchedData.forEach(({ id, data }) => {
                    newData[id] = data;
                });
                return newData;
            });
        } catch (error) {
            console.error("Error fetching multiple design data:", error);
        }
    };


    useEffect(() => {
        const fetchDesignsForSoldItems = async () => {
            try {
                setLoading(true); // Set loading to true at the start of the fetch
                // await fetchSalesData();
                // await fetchCatalogeData();

                if (sold && sold.catalogues) {
                    const uniqueDesignIds = [
                        ...new Set(sold.catalogues.map((item) => item.designId)),
                    ];
                    const unfetchedDesignIds = uniqueDesignIds.filter(
                        (id) => !designData[id]
                    );

                    await fetchDesignData(unfetchedDesignIds);
                }
            } catch (error) {
                console.error("Error fetching designs for sold items:", error);
            } finally {
                setLoading(false); // Ensure loading is set to false even if an error occurs
            }
        };

        fetchDesignsForSoldItems();
    }, [updatePage, sold]);

    const soldCatalogeApi = async () => {
        const content = pdfRef.current;
        const canvas = await html2canvas(content, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");

        const margin = 5;

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const halfPageHeight = (pageHeight - margin) / 3

        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (imgHeight * 2 > pageHeight) {
            console.warn("Bill is too large to fit twice on one page. Consider reducing content size.");
        }

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, halfPageHeight);

        pdf.addImage(imgData, "PNG", 0, pageHeight / 2, imgWidth, halfPageHeight);

        pdf.save(`${typeof sold.buyer === "object" ? sold.buyer?.label : sold.buyer}_statement.pdf`);
    };



    const calculateGrandTotal = () => {
        if (sold && sold.catalogues) {
            let total = 0;
            sold.catalogues.forEach((item) => {
                const design = designData[item.designId] || {};
                total += (design.price || 0) * (item.khazana || 0);
            });
            setGrandTotal(total)
        }
    }

    useEffect(() => {
        calculateGrandTotal();
    }, [designData]);


    useEffect(() => {
        fetchSalesData()
        fetchCatalogeData()
    }, [updatePage]);
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
                                {typeof sold.buyer === "object" ? sold.buyer?.label : sold.buyer}
                            </h2>
                            <p className="text-sm font-medium">+92-{sold.buyer_phone}</p>

                        </div>

                        <div className="flex flex-col items-end">
                            <p className="text-sm font-semibold">Invoice: {currentInvoice}</p>
                            <p className="text-sm">{currentDate}</p>                        </div>
                    </div>


                    {loading ? (
                        <div className="flex items-center justify-center w-full h-full">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="bill-img bg-white shadow-md p-3  md:overflow-auto overflow-x-scroll">
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
                                        {sold.catalogues?.map((item, index) => {
                                            const cataloge = catalogue.find((cata) => cata._id === item.catalogeId) || {};

                                            const design = designData[item.designId] || {};
                                            const totalPrice = (design.price || 0) * (item.khazana || 0);
                                            totalkhazana += item.khazana
                                            return (
                                                <tr key={index}>
                                                    <td className="border p-2 text-center">{index + 1}</td>
                                                    <td className="border p-2 text-center">{cataloge?.cataloge_number || "Not Found"}</td>
                                                    <td className="border p-2 text-center">{design?.design_number || "Not Found"}</td>
                                                    <td className="border p-2 text-center">{item.khazana}</td>
                                                    <td className="border p-2 text-center">{design?.price || "Not Found"}</td>
                                                    <td className="border p-2 text-center">{totalPrice || "Not Found"}</td>
                                                </tr>
                                            );
                                        })}
                                        <tr>
                                            <td colSpan="3" className="text-right font-bold">Ghazana Total</td>
                                            <td className="text-center font-bold">{totalkhazana}</td>
                                            <td className="text-right font-bold"> Grand Total</td>
                                            <td className="text-center font-bold">{grandTotal}</td>
                                        </tr>


                                    </tbody>
                                </table>
                            </div>
                        </div>

                    )}


                </div>
                <div className="px-4 py-3 flex flex-row-reverse items-center gap-5  sm:px-6">
                    <button
                        onClick={soldCatalogeApi}
                        className="md:px-6 py-2 px-3 h-10 md:w-auto hidden md:block w-full text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md text-sm "
                    >
                        Print
                    </button>
                </div>
            </div>
        </div>
    );
}
