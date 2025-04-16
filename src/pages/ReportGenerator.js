import React, { useContext, useState } from 'react';
import ReportChart from '../components/charts/Report';
import AuthContext from '../AuthContext';

const ReportGenerator = () => {
    const { user } = useContext(AuthContext);

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center px-2 sm:px-4 ">
   <ReportChart user={user} />
    </div>
  );
};

export default ReportGenerator;
