import { useState, useRef, useEffect } from 'react';

export const useTranscript = () => {
  const [transcript, setTranscript] = useState(
    "Hi, this is Nurse Gwen Holmes making a detailed note on patient John Doe in room 312. It's May 30th, 2024, and it's approximately 8:00 AM. Mr. Doe was admitted on the 27th of May with severe abdominal pain. He described the pain as sharp and persistent, which prompted further investigation. Upon admission, his initial vitals were slightly concerning with elevated blood pressure of 140/90 and increased heart rate of 95 bpm, but they have since stabilized. As of this morning, his temperature is 37°C, respiratory rate is 16 breaths per minute, heart rate has come down to 80 bpm, and blood pressure is now 120/80. The patient reports his pain level as 8 out of 10, primarily in his lower back."
  );
  const transcriptRef = useRef(null);

  const highlightText = (regex) => {
    if (transcriptRef.current) {
      const html = transcript.replace(regex, (match) => `<span class="bg-yellow-200 highlighted">${match}</span>`);
      transcriptRef.current.innerHTML = html;
      
      // Scroll to the first highlighted element
      const highlightedElement = transcriptRef.current.querySelector('.highlighted');
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return { transcript, setTranscript, transcriptRef, highlightText };
};
