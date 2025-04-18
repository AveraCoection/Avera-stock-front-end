import React from 'react'
import BuyerBillDetail from './BuyerBillDetail'
import BuyerTransaction from './BuyerTransaction'

function BuyerBillAndTransaction() {
    return (
        <div className='flex justify-center  flex-col items-start lg:items-center lg:w-[1100px] overflow-x-auto mx-auto'>
        <BuyerBillDetail />
        <BuyerTransaction />
    </div>
    
    )
}

export default BuyerBillAndTransaction