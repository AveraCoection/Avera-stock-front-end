import React from 'react'
import BuyerBillDetail from './BuyerBillDetail'
import BuyerTransaction from './BuyerTransaction'

function BuyerBillAndTransaction() {
    return (
        <div className='flex justify-center flex-col items-center w-[1100px] mx-auto'>
        <BuyerBillDetail />
        <BuyerTransaction />
    </div>
    
    )
}

export default BuyerBillAndTransaction