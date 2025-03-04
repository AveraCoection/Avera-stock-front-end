import React, { useContext, useEffect, useState } from 'react';
import GlobalApiState from '../utilis/globalVariable';
import AuthContext from '../AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import CreatableSelect from 'react-select/creatable';
import { Navigate, useNavigate } from 'react-router-dom';
import Stepper1 from '../components/Stepper1';
import Stepper2 from '../components/Stepper2';

export default function SoldCatalogeDetail() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate()
    const [buyer, setAllBuyer] = useState([]);
    const [inVoice, setInVoice] = useState('');
    const [catalogue, setAllCataloge] = useState([]);
    const [stepCount, setStepCount] = useState(1);
    const [catalogueDesignMap, setCatalogueDesignMap] = useState({});
    const [filteredCommission, setFilteredCommission] = useState([])
    const [isChecked, setIsChecked] = useState(false);
    const [isDelivery, setIsDelivery] = useState(false);

    const [fields, setFields] = useState([
        {
            catalogeId: '',
            designId: '',
            khazana: '',
            catalogueDesignOptions: [],
            remaingKhazana: 0,
            error: '',
        },
    ]);

    const [soldValue, setSoldValue] = useState({
        userID: user.user._id,
        buyer: "",
        buyer_number: '',
        catalogues: "",
    })

    const [deliveryCharges, setDeliveryCharges] = useState({
        userId: user.user._id,
        cost_type: "",
        cost_name: "",
        design_bill: "",
        // commission_name:null,
        // commission_type:null,
    });

    const [salesCharges, setSalesCharges] = useState({
        userId: user.user._id,
        cost_type: "",
        cost_name: "",
        design_bill: "",
        commission_name: "",
        commission_type: "",
    })

    const handleInputChange = (key, value) => { 
                setDeliveryCharges({ ...deliveryCharges, [key]: value });
    };

    const handleSelectOption = (name, value) => {
        const selectedCommission = filteredCommission.find(commission => commission._id === value);
        
        if (selectedCommission) {
            setSalesCharges(prevState => ({
                ...prevState,
                commission_name: selectedCommission.id,
                cost_type: "Commision on Sales",
                cost_name: selectedCommission.commissionPrice,
                commission_type: "Sale"
            }));
        }
    };
    

    const selectedBuyer = buyer.find(buyer => buyer.buyer_name === soldValue.buyer);

    const handlecommision = () => {
        const newCheckedState = !isChecked;
    
        setIsChecked(newCheckedState);
    
        if (newCheckedState) {
            fetchCommissionOnSales(); 
        }
    };
    
    // Fetch Buyer Data
    const fetchBuyerData = () => {
        fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/buyer/list_buyer/${user.user._id}`)
            .then((response) => response.json())
            .then((data) => {
                setAllBuyer(data);
            })
            .catch((err) => console.log(err));
    };

    const fetchInVoice = async () => {
        try {

            const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/in_voice/last_inVoice`)

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setInVoice(data);
        } catch (e) {

        }
    };

    const fetchCatalogeData = () => {
        fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/cataloge/list_cataloge/${user.user._id}`)
            .then((response) => response.json())
            .then((data) => {
                setAllCataloge(data);
            })
            .catch((err) => console.log(err));
    };


    const updateInvoiceNumber = async (newInvoice) => {
        try {
            await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/in_voice/add_inVoice`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ in_voice: newInvoice }),
            });
        } catch (error) {
            console.error("Error updating invoice number:", error);
        }
    };

    const fetchCommissionOnSales = async () => {
        try {
            const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/commision/get-commision/${user.user._id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            const filterType = data.filter((item) => item.type === "Sale")
            setFilteredCommission(filterType);
        } catch (error) {
            console.error("Error fetching commision data:", error);
        }
    };

    useEffect(() => {
        fetchCatalogeData();
        fetchBuyerData();
        fetchInVoice()
        
    }, []);

    return (
        <>
            {
                stepCount === 1 ? (
                    <Stepper1
                        soldValue={soldValue}
                        setSoldValue={setSoldValue}
                        setCatalogueDesignMap={setCatalogueDesignMap}
                        catalogue={catalogue}
                        buyer={buyer}
                        setStepCount={setStepCount}
                        stepCount={stepCount}
                        setFields={setFields}
                        fields={fields}
                        handleInputChange={handleInputChange}
                        deliveryCharges={deliveryCharges}
                        filteredCommission={filteredCommission}
                        salesCharges={salesCharges}
                        isChecked={isChecked}
                        handlecommision={handlecommision}
                        handleSelectOption={handleSelectOption}
                        setIsDelivery={setIsDelivery}
                        isDelivery={isDelivery}
                    />
                ) : stepCount === 2 ? (
                    <Stepper2
                        soldValue={soldValue}
                        catalogueDesignMap={catalogueDesignMap}
                        catalogue={catalogue}
                        buyer={buyer}
                        setStepCount={setStepCount}
                        stepCount={stepCount}
                        updateInvoiceNumber={updateInvoiceNumber}
                        invoiceNumber={inVoice}
                        deliveryCharges={deliveryCharges}
                        salesCharges={salesCharges}
                        isChecked={isChecked}
                        isDelivery={isDelivery}
                        userId={user.user._id}
                    />
                ) : null
            }
        </>
    );
}
