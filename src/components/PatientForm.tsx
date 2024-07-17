'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HiSave, HiX, HiQuestionMarkCircle } from 'react-icons/hi';

const patientSchema = z.object({
  givenName: z.string().min(1, 'Given name is required'),
  familyName: z.string().min(1, 'Family name is required'),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Gender is required' }),
  birthDate: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    return birthDate < today && (today.getFullYear() - birthDate.getFullYear()) <= 120;
  }, { message: 'Invalid date of birth' }),
  phone: z.string().regex(/^\+?[0-9()-\s]+$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email format').optional().or(z.literal(''))
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientFormProps {
  patientId?: string;
}

const PatientForm: React.FC<PatientFormProps> = ({ patientId }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting, isDirty, isValid } } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/patients?id=${patientId}`);
      if (!response.ok) throw new Error('Failed to fetch patient data');
      const patientData = await response.json();
      reset({
        givenName: patientData.name?.[0]?.given?.join(' ') || '',
        familyName: patientData.name?.[0]?.family || '',
        gender: patientData.gender || '',
        birthDate: patientData.birthDate || '',
        phone: patientData.telecom?.find((t: any) => t.system === 'phone')?.value || '',
        email: patientData.telecom?.find((t: any) => t.system === 'email')?.value || '',
        address: {
          line1: patientData.address?.[0]?.line?.[0] || '',
          city: patientData.address?.[0]?.city || '',
          state: patientData.address?.[0]?.state || '',
          postalCode: patientData.address?.[0]?.postalCode || '',
        },
      });
    } catch (err) {
      setError('Failed to load patient data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<PatientFormData> = async (data) => {
    setLoading(true);
    setError(null);

    const patientData = {
      resourceType: 'Patient',
      name: [
        {
          use: 'official',
          family: data.familyName,
          given: [data.givenName],
        },
      ],
      gender: data.gender,
      birthDate: data.birthDate,
      telecom: [
        { system: 'phone', value: data.phone },
        { system: 'email', value: data.email },
      ],
      address: [
        {
          use: 'home',
          line: [data?.address?.line1],
          city: data?.address?.city,
          state: data?.address?.state,
          postalCode: data?.address?.postalCode,
        },
      ],
    };

    try {
      const url = patientId ? `/api/patients/${patientId}` : '/api/patients';
      const method = patientId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) throw new Error('Failed to save patient data');

      setMessage(patientId ? 'Patient data updated successfully' : 'Patient data saved successfully');
      setTimeout(() => router.push('/patients'), 2000);
    } catch (err) {
      setError('Failed to save patient data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600 border-b pb-4">
          {patientId ? 'Update Patient Information' : 'New Patient Registration'}
        </h2>
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">{error}</div>}
        {message && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">{message}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <InputField
            control={control}
            name="givenName"
            label="Given Name"
            type="text"
            required
            errors={errors}
          />
          <InputField
            control={control}
            name="familyName"
            label="Family Name"
            type="text"
            required
            errors={errors}
          />
          <InputField
            control={control}
            name="gender"
            label="Gender"
            type="select"
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
            ]}
            required
            errors={errors}
          />
          <InputField
            control={control}
            name="birthDate"
            label="Date of Birth"
            type="date"
            required
            errors={errors}
          />
          <InputField
            control={control}
            name="phone"
            label="Phone"
            type="tel"
            required
            errors={errors}
          />
          <InputField
            control={control}
            name="email"
            label="Email"
            type="email"
            errors={errors}
          />
          <InputField
            control={control}
            name="address.line1"
            label="Address Line"
            type="text"
            errors={errors}
          />
          <InputField
            control={control}
            name="address.city"
            label="City"
            type="text"
            errors={errors}
          />
          <InputField
            control={control}
            name="address.state"
            label="State"
            type="text"
            errors={errors}
          />
          <InputField
            control={control}
            name="address.postalCode"
            label="Postal Code"
            type="text"
            errors={errors}
          />
        </div>

        <div className="flex items-center justify-between mt-8 border-t pt-6">
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline flex items-center transition duration-300 ease-in-out"
            type="button"
            onClick={() => router.push('/patients')}
          >
            <HiX className="mr-2" />
            Cancel
          </button>
          <button
            className={`${isDirty && isValid ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'} text-white font-bold py-2 px-6 rounded-full focus:outline-none focus:shadow-outline flex items-center transition duration-300 ease-in-out`}
            type="submit"
            disabled={isSubmitting || !isDirty || !isValid}
          >
            <HiSave className="mr-2" />
            {isSubmitting ? 'Saving...' : (patientId ? 'Update Patient' : 'Save Patient')}
          </button>
        </div>
      </form>
    </div>
  );
};

interface InputFieldProps {
  control: any;
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  errors: any;
}

const InputField: React.FC<InputFieldProps> = ({ control, name, label, type, required, options, errors }) => (
  <div className="mb-4">
    <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor={name}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        type === 'select' ? (
          <select
            {...field}
            className={`shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
            id={name}
          >
            <option value="">Select {label}</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            {...field}
            className={`shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
            id={name}
            type={type}
            max={type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
          />
        )
      )}
    />
    {errors[name] && <p className="text-red-500 text-xs italic mt-1">{errors[name].message}</p>}
  </div>
);

export default PatientForm;