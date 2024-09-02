import React from 'react';
import { Button } from '@/components/ui/button';
import { User, Calendar, Phone, Mail, MapPin, UserCheck } from 'lucide-react';

export const PatientInfo = ({ patientData, loading }) => {
  const {
    givenName,
    familyName,
    gender,
    birthDate,
    phone,
    email,
    address,
    assignedNurse
  } = patientData;

  const displayOrNA = (value) => value || 'N/A';
  const dummyNurse = "Jane Doe";

  if (loading) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-md flex items-center justify-center h-16 m-4">
        <div className="loader ease-linear rounded-full border-3 border-t-3 border-gray-200 h-8 w-8 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200 m-4 text-sm">
      <div className="flex items-center justify-between space-x-2">
        <Button variant="outline" size="sm" className="text-xs hover:bg-blue-50 transition-colors duration-300">&lt;</Button>
        
        <div className="flex-grow flex items-center space-x-4 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center space-x-1" title={`Name: ${displayOrNA(`${givenName} ${familyName}`)}\nGender: ${gender || 'N/A'}`}>
            <User className="text-blue-500 flex-shrink-0" size={16} />
            <span className="font-semibold truncate">{displayOrNA(`${givenName} ${familyName}`)}</span>
            {gender && <span className="px-1 bg-blue-100 text-blue-800 rounded-full text-xs">{gender}</span>}
          </div>
          
          <div className="flex items-center space-x-1" title={`Date of Birth: ${displayOrNA(birthDate)}`}>
            <Calendar className="text-green-500 flex-shrink-0" size={16} />
            <span className="truncate">{displayOrNA(birthDate)}</span>
          </div>
          
          <div className="flex items-center space-x-1" title={`Phone: ${displayOrNA(phone)}`}>
            <Phone className="text-purple-500 flex-shrink-0" size={16} />
            <span className="truncate">{displayOrNA(phone)}</span>
          </div>
          
          <div className="flex items-center space-x-1" title={`Email: ${displayOrNA(email)}`}>
            <Mail className="text-red-500 flex-shrink-0" size={16} />
            <span className="truncate">{displayOrNA(email)}</span>
          </div>
          
          <div className="flex items-center space-x-1" title={`Address: ${displayOrNA(`${address?.city || ""}, ${address?.state || ""} ${address?.postalCode || ""}`)}`}>
            <MapPin className="text-yellow-500 flex-shrink-0" size={16} />
            <span className="truncate">{displayOrNA(`${address?.city || ""}, ${address?.state || ""}`)}</span>
          </div>
          
          <div className="flex items-center space-x-1" title={`Assigned Nurse: ${displayOrNA(assignedNurse || dummyNurse)}`}>
            <UserCheck className="text-teal-500 flex-shrink-0" size={16} />
            <span className="truncate">{displayOrNA(assignedNurse || dummyNurse)}</span>
          </div>
        </div>
        
        <Button variant="outline" size="sm" className="text-xs hover:bg-blue-50 transition-colors duration-300">Details</Button>
      </div>
    </div>
  );
};

export default PatientInfo;