// hooks/usePatientData.js
import { useState } from 'react';

export const usePatientData = () => {
  const [patientData] = useState({
    name: 'Jane D',
    dob: '12 Aug 1985',
    mrn: '#111111',
    submittedBy: 'Nurse Name',
    dateTime: 'mm/dd/yy hh:mm',
  });

  return patientData;
};