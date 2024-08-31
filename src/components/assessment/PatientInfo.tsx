// components/PatientInfo.js
import { Button } from '@/components/ui/button';

export const PatientInfo = ({ patientData }) => (
  <div className="bg-white p-4 mb-4 flex justify-between items-center shadow">
    <Button variant="outline">&lt; Back</Button>
    <div>
      <span className="font-bold">Patient Name:</span> {patientData.name} |
      <span className="font-bold"> DOB:</span> {patientData.dob} |
      <span className="font-bold"> MRN:</span> {patientData.mrn}
    </div>
    <div>
      <span className="font-bold">Submitted By:</span> {patientData.submittedBy} |
      <span className="font-bold"> Date & Time:</span> {patientData.dateTime}
    </div>
  </div>
);