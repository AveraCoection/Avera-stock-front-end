import { Dialog, Transition } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import React, { Fragment, useContext, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import AuthContext from '../AuthContext';
import { toast } from 'react-toastify';
import GlobalApiState from '../utilis/globalVariable';

export default function AddDesign({ addDesignModel, handlePageUpdate, singlecataloge }) {
  const params = useParams();
  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);
  const {user} = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const [catalogeDesign, setDesignCataloge] = useState({
    userId:user.user._id,
    design_number: '',
    stock: '',
    khazana_stock: '',
    cataloge: singlecataloge._id,
    price: '',
    cost_price : '',
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (key, value) => {
    setDesignCataloge({ ...catalogeDesign, [key]: value });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!catalogeDesign.design_number.trim()) {
      newErrors.design_number = 'Design Number is required';
    }
    if (!catalogeDesign.price.trim()) {
      newErrors.price = 'Price is required';
    }
    if (!catalogeDesign.stock.trim()) {
      newErrors.stock = 'Stock is required';
    }
    if (!catalogeDesign.khazana_stock.trim()) {
      newErrors.khazana_stock = 'Ghazana Stock is required';
    }
    if (!catalogeDesign.cost_price.trim()) {
      newErrors.cost_price = 'Cost Price Stock is required';
    }
    return newErrors;
  };

  const addCatalogeDesign = async () => {
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true)
    try {
      const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/cataloge_design/add_design`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(catalogeDesign),
      });

      if (response.ok) {
        toast.success("Design Added Successfully");
        handlePageUpdate();
        addDesignModel();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to add design: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      toast.error(`Error: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg overflow-y-scroll">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      {/* <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                        <PlusIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />
                      </div> */}
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <Dialog.Title as="h3" className="text-lg py-4 font-semibold leading-6 text-gray-900">
                          Catalogue: {singlecataloge.cataloge_number} <br />
                        </Dialog.Title>
                        <form action="#">
                          <div className='flex flex-col'>
                            <div className="flex items-center gap-4 ">
                              <div>
                                <label
                                  htmlFor="design_number"
                                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                  Design Number
                                </label>
                                <input
                                  type="text"
                                  name="design_number"
                                  id="design_number"
                                  value={catalogeDesign.design_number}
                                  onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                                  className={`bg-gray-50 border ${errors.design_number ? 'border-red-500' : 'border-gray-300'
                                    } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
                                  placeholder="Number"
                                />
                                {errors.design_number && (
                                  <p className="text-red-500 text-xs mt-1">{errors.design_number}</p>
                                )}
                              </div>
                              <div>
                                <label
                                  htmlFor="price"
                                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                  Price
                                </label>
                                <input
                                  type="number"
                                  name="price"
                                  id="price"
                                  value={catalogeDesign.price}
                                  onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                                  className={`bg-gray-50 border ${errors.price ? 'border-red-500' : 'border-gray-300'
                                    } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
                                  placeholder="Price"
                                />
                                {errors.price && (
                                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                                )}
                              </div>

                            </div>
                            <div className="flex items-center justify-between gap-4 mt-4">
                              <div>
                                <label
                                  htmlFor="khazana_stock"
                                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                  Add Ghazana
                                </label>
                                <input
                                  type="number"
                                  name="khazana_stock"
                                  id="khazana_stock"
                                  value={catalogeDesign.khazana_stock}
                                  onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                                  className={`bg-gray-50 border ${errors.stock ? 'border-red-500' : 'border-gray-300'
                                    } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
                                  placeholder="Ghazana Stock"
                                />
                                {errors.khazana_stock && <p className="text-red-500 text-xs mt-1">{errors.khazana_stock}</p>}
                              </div>
                              <div>
                                <label
                                  htmlFor="stock"
                                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                  Add Thaan
                                </label>
                                <input
                                  type="number"
                                  name="stock"
                                  id="stock"
                                  value={catalogeDesign.stock}
                                  onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                                  className={`bg-gray-50 border ${errors.stock ? 'border-red-500' : 'border-gray-300'
                                    } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
                                  placeholder="Thaan"
                                />
                                {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-4 mt-4">
                              <div>
                                <label
                                  htmlFor="cost_price"
                                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                  Add Cost Price 
                                </label>
                                <input
                                  type="number"
                                  name="cost_price"
                                  id="cost_price"
                                  value={catalogeDesign.cost_price}
                                  onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                                  className={`bg-gray-50 border ${errors.cost_price ? 'border-red-500' : 'border-gray-300'
                                    } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
                                  placeholder="Cost Price"
                                />
                                {errors.cost_price && <p className="text-red-500 text-xs mt-1">{errors.cost_price}</p>}
                              </div>
                            
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-white"
                        }`}
                      onClick={addCatalogeDesign}
                      disabled={isLoading}
                    >
                    {isLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                           
                          </div>
                        ) : (
                          <>
                          <p>Add</p>
                          </>
                        )}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => addDesignModel()}
                      ref={cancelButtonRef}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
