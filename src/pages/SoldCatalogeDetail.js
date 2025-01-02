import React, { useContext, useEffect, useState } from 'react';
import GlobalApiState from '../utilis/globalVariable';
import AuthContext from '../AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import CreatableSelect from 'react-select/creatable';
import { Navigate, useNavigate } from 'react-router-dom';
import Stepper1 from '../components/Stepper1';
import Stepper2 from '../components/Stepper2';

export default function SoldCatalogeDetail() {
    const authContext = useContext(AuthContext);
    const navigate = useNavigate()
    const [buyer, setAllBuyer] = useState([]);
    const [inVoice, setInVoice] = useState('');
    const [catalogue, setAllCataloge] = useState([]);
    const [stepCount, setStepCount] = useState(1);
    const [catalogueDesignMap, setCatalogueDesignMap] = useState({});

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
        userID: authContext.user,
        buyer: "",
        buyer_number: '',
        catalogues: "",
    })
    const selectedBuyer = buyer.find(buyer => buyer.buyer_name === soldValue.buyer);

    const formatInvoiceNumber = (number) => {
        return number.toString().padStart(4, '0'); // Formats as 4 digits (e.g., 0001, 0002)
    };

    // Fetch Buyer Data
    const fetchBuyerData = () => {
        fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/buyer/list_buyer/${authContext.user}`)
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
        fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/cataloge/list_cataloge/${authContext.user}`)
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
                    />
                ) : null
            }
        </>
    );
}
