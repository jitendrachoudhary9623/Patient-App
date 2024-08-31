import React, { useEffect, useState } from 'react';
import { useParams } from "next/navigation";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePatientData } from '../../hooks/usePatientData';
import { useTranscript } from '../../hooks/useTranscript';
import { useObservations } from '../../hooks/useObservations';
import { useFHIRSubmission } from '../../hooks/useFHIRSubmission';
import { PatientInfo } from './PatientInfo';
import { Recording } from './Recording';
import { Transcript } from './Transcript';
import { ObservationsTable } from './ObservationsTable';

const MedicalChart = () => {
  const params = useParams();
  const patientId = params.id as string;

  const patientData = usePatientData(patientId);
  const { transcript, transcriptRef, highlightText } = useTranscript();
  const { observations, setObservations, isLoading } = useObservations(transcript, patientId);
  const { submitToFHIR, isSubmitting, error } = useFHIRSubmission();

  const [originalObservations, setOriginalObservations] = useState([]);

  useEffect(() => {
    if (observations.length > 0 && originalObservations.length === 0) {
      // Deep copy the observations to prevent updates to the originalObservations
      setOriginalObservations(JSON.parse(JSON.stringify(observations)));
    }
  }, [observations]);

  const handleInputFocus = (regex) => {
    highlightText(regex);
  };

  const handleInputChange = (index, value) => {
    const newObservations = [...observations];
    newObservations[index].value = value;
    setObservations(newObservations);
    highlightText(newObservations[index].regex);
  };

  const findDifferences = (original, updated) => {
    console.log({ original, updated });
    return updated.filter((updatedObs, index) => {
      const originalObs = original[index];
      return originalObs.value !== updatedObs.value;
    });
  };

  const handleSubmit = async () => {
    if (patientId) {
      const changedObservations = findDifferences(originalObservations, observations);
      console.log('Changed Observations:', changedObservations, {originalObservations, observations});
      if (changedObservations.length > 0) {
        await submitToFHIR(changedObservations, patientId);
      } else {
        console.log('No changes detected.');
      }
    } else {
      console.error('Patient ID is not available');
    }
  };

  if (!patientId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto bg-gray-100">
      <div className="flex justify-end items-center mb-4">
        <Button
          className="bg-blue-500 text-white"
          onClick={handleSubmit}
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? 'Submitting...' : 'Save and Submit'}
        </Button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

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
              #{patientId} Last Edited: Mar14, 2024 19:00 hrs
            </div>
            <div className="font-bold mb-2">Edit History</div>
            {isLoading ? (
              <div className="text-center py-4">Loading observations...</div>
            ) : (
              <ObservationsTable
                observations={observations}
                handleInputChange={handleInputChange}
                handleInputFocus={handleInputFocus}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MedicalChart;