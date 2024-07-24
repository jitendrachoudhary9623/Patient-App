'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { HiSave, HiX } from '@/icons';
import InputField from '@/components/elements/InputField';
import useFetchPatientData from '@/hooks/useFetchPatientData';
import useHandleFormSubmit from '@/hooks/useHandleFormSubmit';
import { useFormInitialization } from '@/hooks/useFormInitialization';

interface PatientFormProps {
  patientId?: string;
}

const PatientForm: React.FC<PatientFormProps> = ({ patientId }) => {
  const router = useRouter();
  const { control, handleSubmit, reset, formState: { errors, isSubmitting, isDirty, isValid } } = useFormInitialization();

  const { loading, error } = useFetchPatientData(patientId, reset);
  const { onSubmit, message } = useHandleFormSubmit(patientId, router);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg px-6 pt-4 pb-6 mb-4">
        <h2 className="text-2xl font-semibold mb-4 text-center text-blue-500 border-b pb-2">
          {patientId ? 'Update Patient Information' : 'New Patient Registration'}
        </h2>
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">{error}</div>}
        {message && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">{message}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="flex items-center justify-between mt-6 border-t pt-4">
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline flex items-center transition duration-300 ease-in-out"
            type="button"
            onClick={() => router.push('/patients')}
          >
            <HiX className="mr-2" />
            Cancel
          </button>
          <button
            className={`${isDirty && isValid ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'} text-white font-semibold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline flex items-center transition duration-300 ease-in-out`}
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

export default PatientForm;
