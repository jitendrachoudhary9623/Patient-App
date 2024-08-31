import { useState, useEffect } from 'react';

export const useObservations = (transcript) => {
  const [observations, setObservations] = useState([
    // Vitals (easily available in FHIR R4)
    {
      label: 'Temperature',
      value: '37',
      regex: /temperature is (\d+(?:\.\d+)?)°C/,
      fhirResource: 'Observation',
      history: [
        { value: '36.8', date: 'Mar 13, 2024 18:45 Hrs' },
        { value: '37.2', date: 'Mar 12, 2024 09:30 Hrs' },
        { value: '36.9', date: 'Mar 11, 2024 14:15 Hrs' },
      ]
    },
    {
      label: 'Respiratory rate',
      value: '16',
      regex: /respiratory rate is (\d+) breaths per minute/,
      fhirResource: 'Observation',
      history: [
        { value: '18', date: 'Mar 13, 2024 18:45 Hrs' },
        { value: '17', date: 'Mar 12, 2024 09:30 Hrs' },
        { value: '16', date: 'Mar 11, 2024 14:15 Hrs' },
      ]
    },
    
    // Pain assessment (partially available, uses custom extensions)
    {
      label: 'Pain Score',
      value: '8',
      regex: /pain level as (\d+) out of 10/,
      fhirResource: 'Observation',
      customExtension: 'pain-assessment',
      history: []
    },
    {
      label: 'Pain Location',
      value: 'Lower back',
      regex: /pain.*in (?:his|her) (.*?)\./,
      fhirResource: 'Observation',
      customExtension: 'pain-location',
      recommendation: 'Use BodySite and custom extensions for detailed mapping',
      history: []
    },
    {
      label: 'Pain Quality',
      value: '',
      regex: /pain quality: (.*?)\./,
      fhirResource: 'Observation',
      customExtension: 'pain-quality',
      recommendation: 'Use custom extensions for detailed characteristics',
      history: []
    },
    
    // Neurological assessment (custom extensions)
    {
      label: 'Pupil Reaction Right',
      value: '',
      regex: /right pupil reaction: (.*?)\./,
      fhirResource: 'Observation',
      customExtension: 'pupil-reaction-right',
      recommendation: 'Use custom extensions',
      history: []
    },
    {
      label: 'Pupil Reaction Left',
      value: '',
      regex: /left pupil reaction: (.*?)\./,
      fhirResource: 'Observation',
      customExtension: 'pupil-reaction-left',
      recommendation: 'Use custom extensions',
      history: []
    },
    
    // Glasgow Coma Assessment (partially available, custom extensions)
    {
      label: 'Eye Opening Response',
      value: '',
      regex: /eye opening response: (.*?)\./,
      fhirResource: 'Observation',
      customExtension: 'glasgow-coma-eye',
      recommendation: 'Use custom extensions',
      history: []
    },
    
    // Cardiovascular assessment (custom extensions)
    {
      label: 'Heart Sounds',
      value: '',
      regex: /heart sounds: (.*?)\./,
      fhirResource: 'Observation',
      customExtension: 'heart-sounds',
      recommendation: 'Use custom extensions',
      history: []
    },
    {
      label: 'Capillary Refill',
      value: '',
      regex: /capillary refill: (.*?) seconds/,
      fhirResource: 'Observation',
      customExtension: 'capillary-refill',
      recommendation: 'Use custom extensions',
      history: []
    },
    
    // Respiratory Assessment (custom extensions)
    {
      label: 'Breath Sounds',
      value: '',
      regex: /breath sounds: (.*?)\./,
      fhirResource: 'Observation',
      customExtension: 'breath-sounds',
      recommendation: 'Use custom extensions',
      history: []
    },
    
    // Gastrointestinal Assessment (custom extensions)
    {
      label: 'Bowel Sounds',
      value: '',
      regex: /bowel sounds: (.*?)\./,
      fhirResource: 'Observation',
      customExtension: 'bowel-sounds',
      recommendation: 'Use custom extensions',
      history: []
    },
    
    // Integumentary Assessment (custom extensions)
    {
      label: 'Skin Integrity',
      value: '',
      regex: /skin integrity: (.*?)\./,
      fhirResource: 'Observation',
      customExtension: 'skin-integrity',
      recommendation: 'Use custom extensions',
      history: []
    },
    
    // Braden Assessment (custom extensions)
    {
      label: 'Sensory Perception',
      value: '',
      regex: /sensory perception: (.*?)\./,
      fhirResource: 'Observation',
      customExtension: 'braden-sensory-perception',
      recommendation: 'Use custom extensions',
      history: []
    },
    
    // Morse Fall Scale (QuestionnaireResponse)
    {
      label: 'History of Falls',
      value: '',
      regex: /history of falls: (.*?)\./,
      fhirResource: 'QuestionnaireResponse',
      recommendation: 'Use QuestionnaireResponse or custom extensions',
      history: []
    },
    
    // Activities of daily living (QuestionnaireResponse)
    {
      label: 'Bathing',
      value: '',
      regex: /bathing ability: (.*?)\./,
      fhirResource: 'QuestionnaireResponse',
      recommendation: 'Use QuestionnaireResponse or custom extensions',
      history: []
    },
    {
      label: 'Dressing',
      value: '',
      regex: /dressing ability: (.*?)\./,
      fhirResource: 'QuestionnaireResponse',
      recommendation: 'Use QuestionnaireResponse or custom extensions',
      history: []
    }
  ]);

  useEffect(() => {
    // Auto-fill the form based on the transcript
    const newObservations = observations.map(obs => {
      const match = transcript.match(obs.regex);
      return { ...obs, value: match ? match[1] : obs.value };
    });
    setObservations(newObservations);
  }, [transcript]);

  return { observations, setObservations };
};