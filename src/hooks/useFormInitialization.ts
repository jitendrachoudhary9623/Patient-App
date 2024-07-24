import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import patientSchema from '@/schemas/patientSchema';
import { z } from 'zod';

type PatientFormData = z.infer<typeof patientSchema>;

export const useFormInitialization = () => {
  return useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    mode: 'onChange',
  });
};
