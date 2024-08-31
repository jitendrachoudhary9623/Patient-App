import { useState } from 'react';

const FHIR_SERVER_URL = 'http://localhost:8080/fhir'; // Update with your HAPI FHIR server URL

export const useFHIRSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submitToFHIR = async (observations, patientId) => {
    setIsSubmitting(true);
    setError(null);

    try {
    const fhirResources = observations
      .filter(obs => obs.value !== undefined && obs.value !== null && obs.value !== '')
      .map(obs => {
        if (obs.fhirResource === 'Observation') {
          console.log({ obs });
          return createObservationResource(obs, patientId);
        } else if (obs.fhirResource === 'QuestionnaireResponse') {
          return createQuestionnaireResponseResource(obs, patientId);
        }
      });

      const responses = await Promise.all(fhirResources.map(resource => 
        fetch(`${FHIR_SERVER_URL}/${resource.resourceType}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/fhir+json'
          },
          body: JSON.stringify(resource)
        })
      ));

      const results = await Promise.all(responses.map(res => res.json()));
      console.log('FHIR submission results:', results);
    } catch (err) {
      setError(err.message);
      console.error('Error submitting to FHIR:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const createObservationResource = (obs, patientId) => {
    return {
      resourceType: 'Observation',
      status: 'final',
      subject: {
        reference: `Patient/${patientId}`
      },
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: getLoincCode(obs.label),
            display: obs.label
          }
        ]
      },
      valueQuantity: {
        value: parseFloat(obs.value),
        unit: getUnitForObservation(obs.label)
      },
      ...(obs.customExtension && {
        extension: [
          {
            url: `http://example.com/fhir/StructureDefinition/${obs.customExtension}`,
            valueString: obs.value
          }
        ]
      })
    };
  };

  const createQuestionnaireResponseResource = (obs, patientId) => {
    return {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      subject: {
        reference: `Patient/${patientId}`
      },
      item: [
        {
          linkId: obs.label,
          text: obs.label,
          answer: [
            {
              valueString: obs.value
            }
          ]
        }
      ]
    };
  };

  const getLoincCode = (label) => {
    // Map observation labels to LOINC codes
    const loincCodes = {
      'Temperature': '8310-5',
      'Respiratory rate': '9279-1',
      'Pain Score': '72514-3',
      // Add more mappings as needed
    };
    return loincCodes[label] || 'unknown';
  };

  const getUnitForObservation = (label) => {
    // Map observation labels to units
    const units = {
      'Temperature': '°C',
      'Respiratory rate': '/min',
      'Pain Score': '{score}',
      // Add more mappings as needed
    };
    return units[label] || 'unit';
  };

  return { submitToFHIR, isSubmitting, error };
};