import React, { useContext, useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';
import GlobalApiState from '../utilis/globalVariable';
import { useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../AuthContext';

export default function BillHistory() {
    const { user } = useContext(AuthContext);
    const params = useParams()
    const pdfRef = useRef(); // Reference for the content to download
    const navigate = useNavigate()
    const [updatePage, setUpdatePage] = useState(true);
    const [catalogue, setAllCataloge] = useState([]);
    const [sold, setAllSold] = useState({});
    const [designData, setDesignData] = useState({});
    const [grandTotal, setGrandTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isChecked, setIsChecked] = useState(sold.paid)

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

    const handleChange = () => {
        const updatedPaidStatus = !sold.paid;

        setAllSold((prevSold) => ({
            ...prevSold,
            paid: updatedPaidStatus,
        }));
    }
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
        const itemsPerPage = 8;
        const totalItems = sold.catalogues?.length || 0;
        const pdf = new jsPDF("p", "mm", "a4");
        const content = pdfRef.current;
        const pageHeight = pdf.internal.pageSize.getHeight();
        const pageWidth = pdf.internal.pageSize.getWidth();

        const renderCanvas = async () => {
            const canvas = await html2canvas(content, { scale: 2 });
            return canvas.toDataURL("image/png");
        };

        const showRows = (start, end) => {
            const allRows = content.querySelectorAll("tbody tr");
            allRows.forEach((row, index) => {
                row.style.display = index >= start && index < end ? "" : "none";
            });
        };

        const restoreRows = () => {
            const allRows = content.querySelectorAll("tbody tr");
            allRows.forEach((row) => (row.style.display = ""));
        };

        if (totalItems <= 8) {
            // ✅ Case 1: Short bill — Original + Copy on same page
            const imgData = await renderCanvas();
            const imgWidth = pageWidth;
            const imgHeight = (content.offsetHeight * imgWidth) / content.offsetWidth;
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

        } else if (totalItems <= 15) {
            // ✅ Case 2: Medium bill — Original on page 1, Copy on page 2
            const imgData = await renderCanvas();
            const imgWidth = pageWidth;
            const imgHeight = (content.offsetHeight * imgWidth) / content.offsetWidth;
            const scale = Math.min(1, pageHeight / imgHeight);

            // Original
            pdf.addImage(imgData, "PNG", 0, 0, imgWidth * scale, imgHeight * scale);

            // Copy
            pdf.addPage();
            pdf.setFontSize(10);
            pdf.setTextColor(150, 150, 150);
            pdf.text("COPY", pageWidth - 5, 5, { align: "right" });
            pdf.addImage(imgData, "PNG", 0, 0, imgWidth * scale, imgHeight * scale);

        } else {
            // ✅ Case 3: Long bill — Paginated original and copy
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
                    const imgHeight = (content.offsetHeight * imgWidth) / content.offsetWidth;
                    const scale = Math.min(1, pageHeight / imgHeight);
                    pdf.addImage(imgData, "PNG", 0, 0, imgWidth * scale, imgHeight * scale);
                    restoreRows();
                }
            }
        }

        restoreRows();
        const buyerName = typeof sold.buyer === "object" ? sold.buyer?.label : sold.buyer;
        pdf.save(`${buyerName}_invoice.pdf`);
        navigate("/billing-detail");
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
        <div className="flex justify-center items-start min-h-screen bg-gray-100 px-2">
            <div className="md:p-6 p-2 w-full max-w-4xl relative">
                <div ref={pdfRef} id='pdf-content' className=" bill-container bg-white border-2 border-gray-400 shadow-lg">
                    {/* Header */}
                    <div className="bg-black text-white px-3 py-3 grid grid-cols-3 items-center">
                           <div className="flex items-center gap-3">
                            <img className="h-14 w-14 rounded-full" src={require("../assets/brandLogo.jpg")} alt="Logo" />
                            <div>
                                <h1 className="text-[18px] leading-3 font-bold">Aveera Collection</h1>
                                <p className="text-[16px]">03006637315</p>
                            </div>
                        </div>

                          <div className="text-center px-2">
                            <h2 className="text-[21px] leading-6 font-semibold break-words">
                                {typeof sold.buyer === "object" ? sold.buyer?.label : sold.buyer}
                            </h2>
                            <p className="text-[18px] font-medium">+92-{sold.buyer_phone}</p>

                        </div>

                      <div className="text-right">
                            <p className="text-[18px] font-bold">Invoice: {currentInvoice}</p>
                            <p className="text-[16px]">{currentDate}</p>                        </div>
                    </div>


                    {loading ? (
                        <div className="flex items-center justify-center w-full h-full">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="p-2 border-gray-400 bg-white shadow-md md:overflow-auto overflow-x-scroll">
                            <div>
                                <table className="w-full border-collapse border border-black" style={{ borderColor: "#000000", borderWidth: "1px" }}>
                                    <thead>
                                        <tr className="bg-gray-100 border-black">
                                            <th className="border p-1 border-black text-left text-[18px]" style={{ borderColor: "#000", borderWidth: "1px" ,paddingBottom: "10px"}}>#</th>
                                            <th className="border p-1 border-black text-left text-[18px]" style={{ borderColor: "#000", borderWidth: "1px"  ,paddingBottom: "10px" }}>Catalogue</th>
                                            <th className="border p-1 border-black text-left text-[18px]" style={{ borderColor: "#000", borderWidth: "1px"  ,paddingBottom: "10px"}}>Design</th>
                                            <th className="border p-1 border-black text-left text-[18px]" style={{ borderColor: "#000", borderWidth: "1px" ,paddingBottom: "10px" }}>Ghazana</th>
                                            <th className="border p-1 border-black text-left text-[18px]" style={{ borderColor: "#000", borderWidth: "1px" ,paddingBottom: "10px" }}>Rate</th>
                                            <th className="border p-1 border-black text-left text-[18px]" style={{ borderColor: "#000", borderWidth: "1px" ,paddingBottom: "10px" }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sold.catalogues?.map((item, index) => {
                                            const cataloge = catalogue.find((cata) => cata._id === item.catalogeId) || {};
                                            const design = designData[item.designId] || {};
                                            const totalPrice = (design.price || 0) * (item.khazana || 0);
                                            totalkhazana += item.khazana;

                                            return (
                                                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                                    <td className="border p-1 border-black text-[24px] text-center" style={{ borderColor: "#000", borderWidth: "1px" ,paddingBottom: "10px" }}>{index + 1}</td>
                                                    <td className="border p-1 border-black text-[24px] text-center" style={{ borderColor: "#000", borderWidth: "1px" ,paddingBottom: "10px"}}>{cataloge?.cataloge_number || "Not Found"}</td>
                                                    <td className="border p-1 border-black text-[24px] text-center" style={{ borderColor: "#000", borderWidth: "1px" ,paddingBottom: "10px"}}>{design?.design_number || "Not Found"}</td>
                                                    <td className="border p-1 border-black text-[24px] text-center" style={{ borderColor: "#000", borderWidth: "1px" ,paddingBottom: "10px"}}>{item.khazana}</td>
                                                    <td className="border p-1 border-black text-[24px] text-center" style={{ borderColor: "#000", borderWidth: "1px" ,paddingBottom: "10px"}}>{design?.price?.toFixed(2) || "N/A"}</td>
                                                    <td className="border p-1 border-black text-[24px] text-center" style={{ borderColor: "#000", borderWidth: "1px" ,paddingBottom: "10px"}}>{totalPrice.toFixed(2)}</td>
                                                </tr>
                                            );
                                        })}

                                        {/* Append empty rows if less than 8 */}
                                        {Array.from({ length: Math.max(0, 8 - (sold.catalogues?.length || 0)) }).map((_, index) => (
                                            <tr key={`empty-${index}`} className={((sold.catalogues?.length || 0) + index) % 2 === 0 ? 'bg-gray-50' : ''}>
                                                <td className="border p-1 border-black text-[24px] text-center" style={{ borderColor: "#000", borderWidth: "1px" }}>&nbsp;</td>
                                                <td className="border p-1 border-black text-[24px] text-center" style={{ borderColor: "#000", borderWidth: "1px" }}>&nbsp;</td>
                                                <td className="border p-1 border-black text-[24px] text-center" style={{ borderColor: "#000", borderWidth: "1px" }}>&nbsp;</td>
                                                <td className="border p-1 border-black text-[24px] text-center" style={{ borderColor: "#000", borderWidth: "1px" }}>&nbsp;</td>
                                                <td className="border p-1 border-black text-[24px] text-center" style={{ borderColor: "#000", borderWidth: "1px" }}>&nbsp;</td>
                                                <td className="border p-1 border-black text-[24px] text-center" style={{ borderColor: "#000", borderWidth: "1px" }}>&nbsp;</td>
                                            </tr>
                                        ))}
                                    </tbody>

                                </table>
                                <div className="px-4">

                                    <div className="flex justify-between text-md mb-2 gap-4">
                                        <div className="flex flex-row gap-1">
                                            <span className="font-semibold text-[18px]">Total Ghazana:</span>
                                            <span className="font-bold text-[18px]">{totalkhazana}</span>
                                        </div>

                                        <div className="flex flex-row gap-1">
                                            <span className="font-semibold text-[18px]">Gross Total:</span>
                                            <span className="font-bold text-[18px]">{grandTotal.toFixed(2)}</span>
                                        </div>
                                        {sold.deliveryCharges > 0 && (
                                            <div className="flex flex-row gap-1">
                                                <span className="font-semibold text-[18px]">Delivery Charges:</span>
                                                <span className="font-bold text-[18px]">{sold.deliveryCharges}</span>
                                            </div>
                                        )}
                                        {sold.discount > 0 && (
                                            <div className="flex justify-between text-red-600">
                                                <span className="font-semibold text-[18px]">Discount:</span>
                                                <span className="text-[18px] font-bold">-{sold.discount.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between text-[22px] mb-2">
                                        <span className="font-bold">Net Payable:</span>
                                        <span className="font-bold text-blue-700">{(grandTotal - (sold.discount || 0)).toFixed(2)}</span>
                                    </div>
                                </div>
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
