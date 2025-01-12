import React, { useContext, useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';
import GlobalApiState from '../utilis/globalVariable';
import { useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../AuthContext';

export default function BillHistory() {
    const authContext = useContext(AuthContext);
    const params = useParams()
    const [updatePage, setUpdatePage] = useState(true);
    const [catalogue, setAllCataloge] = useState([]);
    const [sold, setAllSold] = useState({});
    const [designData, setDesignData] = useState({});
    const [grandTotal, setGrandTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const currentDate = new Date().toLocaleString();

    const currentInvoice = sold?.inVoice
        ? sold.inVoice.toString().padStart(4, "0")
        : "0000";



    const fetchCatalogeData = async () => {
        try {
            const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/cataloge/list_cataloge/${authContext.user}`);
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
                <div>
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
                    {loading ? (
                        <div className="flex items-center justify-center w-full h-full">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="bill-img bg-white shadow-md md:p-6 p-2 md:overflow-auto overflow-x-scroll">
                            <div className="flex flex-col md:flex-row justify-between gap-2 md:gap-4">
                                <div>
                                    <h2 className="text-[15px] sm:text-lg md:text-xl font-bold">
                                        Party Name: {typeof sold.buyer === "object" ? sold.buyer?.label : sold.buyer}
                                    </h2>
                                    <p className="text-sm sm:text-[15px] font-normal">
                                        Phone Number: +92-{sold.buyer_phone}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm sm:text-[15px] font-bold">Invoice Number: {currentInvoice}</p>
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
                                        {sold.catalogues?.map((item, index) => {
                                            const cataloge = catalogue.find((cata) => cata._id === item.catalogeId) || {};

                                            const design = designData[item.designId] || {};
                                            const totalPrice = (design.price || 0) * (item.khazana || 0);

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
                                            <td colSpan="5" className="text-right font-bold p-2">Grand Total</td>
                                            <td className="text-center font-bold p-2">{grandTotal}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}


                </div>
            </div>
        </div>
    );
}
