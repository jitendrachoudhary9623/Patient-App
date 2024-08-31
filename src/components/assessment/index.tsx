// components/MedicalChart.js
"use client"
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePatientData } from '../../hooks/usePatientData';
import { useTranscript } from '../../hooks/useTranscript';
import { useObservations } from '../../hooks/useObservations';
import { PatientInfo } from './PatientInfo';
import { Recording } from './Recording';
import { Transcript } from './Transcript';
import { ObservationsTable } from './ObservationsTable';

const MedicalChart = () => {
  const patientData = usePatientData();
  const { transcript, transcriptRef, highlightText } = useTranscript();
  const { observations, setObservations } = useObservations(transcript);

  const handleInputFocus = (regex) => {
    highlightText(regex);
  };

  const handleInputChange = (index, value) => {
    const newObservations = [...observations];
    newObservations[index].value = value;
    setObservations(newObservations);
    highlightText(newObservations[index].regex);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-gray-100">
      <div className="flex justify-end items-center mb-4">
        {/* <h1 className="text-xl">Patient Listing &gt; Assessments &gt; View Chart &gt; Edit Chart</h1> */}
        <Button className="bg-blue-500 text-white">Save and Submit</Button>
      </div>

      <PatientInfo patientData={patientData} />

      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-4">
          <Recording />
          <Transcript transcript={transcript} transcriptRef={transcriptRef} />
        </div>

        <Card className="col-span-3">
          <CardContent>
            <div className="text-xs text-gray-500 mb-2">
                <br/>
              #20123 Last Edited: Mar14, 2024 19:00 hrs
            </div>
            <div className="font-bold mb-2">Edit History</div>
            <ObservationsTable 
              observations={observations}
              handleInputChange={handleInputChange}
              handleInputFocus={handleInputFocus}
            />

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MedicalChart;