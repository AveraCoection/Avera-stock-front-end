import { Dialog, Transition } from '@headlessui/react'
import React, { Fragment, useRef, useState } from 'react'

export default function DeleteDesign({deleteCatalogueModel , setUpdatePage , updatePage , singleDesign}) {
    const [open, setOpen] = useState(true);
    const cancelButtonRef = useRef(null);

    const deleteItem = async () => {
  
        try {
          const response = await fetch(`http://localhost:4000/api/cataloge_design/delete_design/${singleDesign._id}`, {
            method: 'DELETE'
          });
          const data = await response.json(); 
      
          setUpdatePage(!updatePage);
        } catch (error) {
          console.error('Error deleting item:', error);
        }
      };


    return (
        <>
            <Transition.Root show={open} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-10"
                    initialFocus={cancelButtonRef}
                    onClose={setOpen}
                >
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
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0 ">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <p className="text-xl text-center text-gray-500">
                                            Are you sure you want to delete this catalog?</p>
                                    </div>

                                    <div className="m-4 flex justify-end gap-4">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400"
                                            ref={cancelButtonRef} 
                                            onClick={()=>deleteCatalogueModel()}                                       >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                                            onClick={()=>{deleteCatalogueModel()
                                                deleteItem()}}
                                            ref={cancelButtonRef} 

                                        >
                                            Delete
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </>
    )
}
