import React, { useContext, useEffect, useState } from 'react';
import GlobalApiState from '../utilis/globalVariable';
import AuthContext from '../AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import { RxCross1 } from "react-icons/rx";

export default function Stepper1({
  soldValue,
  setSoldValue,
  stepCount,
  catalogue,
  buyer,
  setStepCount,
  setCatalogueDesignMap,
  setFields,
  fields,
}) {
  const [errors, setErrors] = useState({});


  const selectedBuyer = buyer.find((buyer) => buyer._id === soldValue.buyer.value);

  const handleAddField = () => {
    setFields([...fields, { catalogeId: '', designId: '', khazana: '' }]);
  };

  const fetchDesignData = async (catalogueId) => {
    try {
      const response = await fetch(
        `${GlobalApiState.DEV_BASE_LIVE}/api/cataloge_design/list_design/${catalogueId}`
      );
      const data = await response.json();
      setCatalogueDesignMap((prevMap) => ({
        ...prevMap,
        [catalogueId]: data,
      }));

      return data.map((design) => ({
        value: design._id,
        label: design.design_number,
        totalKhazana: design.khazana_stock,
      }));
    } catch (err) {
      console.error('Error fetching designs:', err);
      return [];
    }
  };

  const handleFieldChange = async (index, fieldName, value) => {
    const updatedFields = [...fields];
    updatedFields[index][fieldName] = value;

    // Check for buyer selection validation
    if (soldValue.buyer === '') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        buyer: 'Please select a buyer.',
      }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, buyer: '' }));
    }

    // Handle catalogeId change
    if (fieldName === 'catalogeId') {
      updatedFields[index].designId = '';
      if (value) {
        const designs = await fetchDesignData(value);
        updatedFields[index].catalogueDesignOptions = designs;
      } else {
        updatedFields[index].catalogueDesignOptions = [];
      }
    }

    // Handle designId change
    if (fieldName === 'designId') {
      const selectedKhazana = updatedFields[index].catalogueDesignOptions?.find(
        (item) => item.value == value
      );
      updatedFields[index].remaingKhazana = selectedKhazana.totalKhazana;
      updatedFields[index].error = '';
    }

    // Handle khazana (stock) change
    if (fieldName === 'khazana') {
      const currentStock = updatedFields[index].remaingKhazana;

      // Check if the khazana value exceeds the remaining stock
      if (Number(value) > Number(currentStock)) {
        updatedFields[index].error = 'The entered khazana exceeds the remaining stock.';
      } else {
        updatedFields[index].error = '';
      }

      updatedFields[index].khazana = value;
    }

    // Update the state with the modified fields
    setFields(updatedFields);
    setSoldValue((prevItem) => ({
      ...prevItem,
      catalogues: updatedFields,
    }));
  };


  const validateFields = () => {
    const newErrors = {};
    if (!soldValue.buyer) {
      newErrors.buyer = 'Buyer is required.';
    }

    fields.forEach((field, index) => {
      if (!field.catalogeId) {
        newErrors[`catalogue-${index}`] = 'Catalogue is required.';
      }
      if (!field.designId) {
        newErrors[`design-${index}`] = 'Design is required.';
      }
      if (!field.khazana || Number(field.khazana) <= 0) {
        newErrors[`khazana-${index}`] = 'Khazana stock must be a positive number.';
      }
      if (field.error) {
        newErrors[`khazana-${index}`] = field.error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = async () => {
    if (validateFields()) {
      setStepCount(stepCount + 1);
    }
  };

  const handleDeleteField = (index) => {
    if (fields.length > 1) {
      const updatedFields = fields.filter((_, i) => i !== index);
      setFields(updatedFields);
      setSoldValue((prevItem) => ({
        ...prevItem,
        catalogues: updatedFields,
      }));
    } else {
      alert("At least one field must remain.");
    }
  };

  useEffect(() => {
    if (selectedBuyer?.phone_number) {
      setSoldValue((prev) => ({
        ...prev,
        buyer_number: selectedBuyer.phone_number,
      }));
    }
  }, [selectedBuyer]);

  return (
    <>
      <div className="flex items-center justify-center w-[80vw] min-h-[100vh] bg-gray-100 relative ">
        <div className="flex items-center justify-center md:w-[60vw]">
          <div className="w-[100vw] md:w-[80vw] lg:w-[60vw] min-h-[90vh] mx-auto mb-4 p-6 bg-white shadow-lg rounded-xl relative">
            <h3 className="text-xl py-4 font-bold text-gray-800 border-b border-gray-300">
              Sold Details
            </h3>
            <form className="flex flex-col pb-11 ">
              <div>
                <div className="flex flex-col md:flex-row gap-6 mt-6">
                  <div className="w-full">
                    <label
                      htmlFor="buyer"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Add Buyer
                    </label>
                    {/* <CreatableSelect
                      options={buyer.map((item) => ({
                        value: item._id,
                        label: item.buyer_name,
                      }))}
                      onChange={(selectedOption) => {
                        setSoldValue({ ...soldValue, buyer: selectedOption?.value });
                      }}
                      value={
                        soldValue.buyer
                          ? {
                            value: soldValue.buyer,
                            label: buyer.find((item) => item._id === soldValue.buyer)?.buyer_name,
                          }
                          : null
                      }
                      placeholder="Select a Buyer"
                      className="shadow-sm rounded-lg border border-gray-200"
                    /> */}
                    <CreatableSelect
                      options={buyer.map((item) => ({
                        value: item._id,
                        label: item.buyer_name,
                      }))}
                      onChange={(selectedOption) => {
                        if (selectedOption) {
                          setSoldValue({ ...soldValue, buyer: { value: selectedOption.value, label: selectedOption.label } , buyer_number:"" });
                        }
                      }}
                      value={
                        soldValue.buyer
                          ? {
                            value: soldValue.buyer.value,
                            label: soldValue.buyer.label,
                          }
                          : null
                      }
                      placeholder="Select a Buyer"
                      className="shadow-sm rounded-lg border border-gray-200"
                    />

                    {errors.buyer && (
                      <span className="text-sm text-red-500 mt-1">{errors.buyer}</span>
                    )}
                  </div>
                
                    <div className="w-full">
                      <label
                        htmlFor="phone"
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Phone Number
                      </label>
                      <div className="flex items-center rounded-lg">
                        {selectedBuyer && selectedBuyer.phone_number ? (
                          <div className="bg-gray-100 w-full p-2 rounded-lg ">
                            <span className="text-gray-500 font-semibold">+92</span>
                            <span className="ml-2 text-gray-700 font-medium">
                              {selectedBuyer.phone_number}
                            </span>
                          </div>
                        ) : (
                          <input
                            type="number"
                            name="buyer_number"
                            id="buyer_number"
                            value={soldValue.buyer_number || ""}  
                            onChange={(e) =>
                              setSoldValue({
                                ...soldValue,
                                buyer_number: e.target.value, 
                              })
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter phone number"
                          />
                        )}
                      </div>
                    </div>
                </div>

                {fields.map((field, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-6 mt-3">
                    <div className="w-full">
                      <label
                        htmlFor={`catalogue-${index}`}
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Add Catalogue
                      </label>
                      <Select
                        id={`catalogue-${index}`}
                        options={catalogue.map((item) => ({
                          value: item._id,
                          label: item.cataloge_number,
                        }))}
                        onChange={(selectedOption) =>
                          handleFieldChange(index, 'catalogeId', selectedOption?.value)
                        }
                        value={
                          field.catalogeId
                            ? {
                              value: field.catalogeId,
                              label: catalogue.find(
                                (item) => item._id === field.catalogeId
                              )?.cataloge_number,
                            }
                            : null
                        }
                        placeholder="Select a Catalogue"
                        className="shadow-sm rounded-lg"
                        isClearable
                      />
                      {errors[`catalogue-${index}`] && (
                        <span className="text-sm text-red-500 mt-1">{errors[`catalogue-${index}`]}</span>
                      )}
                    </div>

                    {field.catalogeId && (
                      <div className="w-full">
                        <label
                          htmlFor={`design-${index}`}
                          className="block mb-2 text-sm font-medium text-gray-700"
                        >
                          Add Design
                        </label>
                        <Select
                          id={`design-${index}`}
                          options={field.catalogueDesignOptions || []}
                          onChange={(selectedOption) =>
                            handleFieldChange(index, 'designId', selectedOption?.value)
                          }
                          value={
                            field.designId
                              ? {
                                value: field.designId,
                                label:
                                  field.catalogueDesignOptions?.find(
                                    (item) => item.value === field.designId
                                  )?.label || '',
                              }
                              : null
                          }
                          placeholder="Select a Design"
                          className="shadow-sm rounded-lg"
                          isClearable
                        />
                        {errors[`design-${index}`] && (
                          <span className="text-sm text-red-500 mt-1">{errors[`design-${index}`]}</span>
                        )}
                      </div>
                    )}

                    <div className="w-full">
                      <label
                        htmlFor={`khazana-${index}`}
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Add Khazana
                      </label>
                      <input
                        type="number"
                        name={`khazana-${index}`}
                        id={`khazana-${index}`}
                        value={field.khazana}
                        min="0"
                        onChange={(e) => handleFieldChange(index, 'khazana', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Khazana Stock"
                      />
                      {field.error && (
                        <span className="text-sm text-red-500 mt-1">{field.error}</span>
                      )}
                      {field.designId && !field.error && (
                        <span className="text-sm text-green-600">
                          The remaining khazana are {field.remaingKhazana}
                        </span>
                      )}
                    </div>


                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteField(index)}
                        className="mt-5 text-red-500 hover:text-red-700"
                      >
                        <RxCross1 />
                      </button>
                    )}
                  </div>

                ))}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={handleAddField}
                  className="px-6 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
                >
                  Add Another Item
                </button>
              </div>
              <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 absolute bottom-0 right-0">
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 text-sm font-medium bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 focus:outline-none"
                >
                  Next
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
