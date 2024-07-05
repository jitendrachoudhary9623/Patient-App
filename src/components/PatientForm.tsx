'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiSave, HiX, HiArrowLeft } from 'react-icons/hi';

interface PatientFormProps {
  patientId?: string; // If provided, we're in edit mode
}

interface PatientFormData {
  givenName: string;
  familyName: string;
  gender: string;
  birthDate: string;
  phone: string;
  email: string;
  address: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

const initialFormData: PatientFormData = {
  givenName: '',
  familyName: '',
  gender: '',
  birthDate: '',
  phone: '',
  email: '',
  address: {
    line1: '',
    city: '',
    state: '',
    postalCode: '',
  },
};

const PatientForm: React.FC<PatientFormProps> = ({ patientId }) => {
  const [formData, setFormData] = useState<PatientFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      setFormData({
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = (): boolean => {
    // Reset error before validation
    setError(null);

    // Name validations
    if (!/^[a-zA-Z\s-']+$/.test(formData.givenName)) {
      setError('Given name should contain only letters, spaces, hyphens, or apostrophes');
      return false;
    }
    if (!/^[a-zA-Z\s-']+$/.test(formData.familyName)) {
      setError('Family name should contain only letters, spaces, hyphens, or apostrophes');
      return false;
    }

    // Date of birth validation
    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    if (birthDate > today) {
      setError('Date of birth cannot be in the future');
      return false;
    }
    if (today.getFullYear() - birthDate.getFullYear() > 120) {
      setError('Invalid date of birth. Age cannot exceed 120 years');
      return false;
    }

    // Phone number validation (basic format check)
    if (formData.phone && !/^\+?[0-9()-\s]+$/.test(formData.phone)) {
      setError('Invalid phone number format');
      return false;
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }

    // Postal code validation (basic format check, adjust as needed)
    if (formData.address.postalCode && !/^[0-9]{5}(-[0-9]{4})?$/.test(formData.address.postalCode)) {
      setError('Invalid postal code format');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const patientData = {
      resourceType: 'Patient',
      name: [
        {
          use: 'official',
          family: formData.familyName,
          given: [formData.givenName],
        },
      ],
      gender: formData.gender,
      birthDate: formData.birthDate,
      telecom: [
        { system: 'phone', value: formData.phone },
        { system: 'email', value: formData.email },
      ],
      address: [
        {
          use: 'home',
          line: [formData.address.line1],
          city: formData.address.city,
          state: formData.address.state,
          postalCode: formData.address.postalCode,
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

      router.push('/patients'); // Redirect to patient list after successful save
    } catch (err) {
      setError('Failed to save patient data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-6 pt-4 pb-6 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 md:col-span-2" role="alert">{error}</div>}
      
      <div className="mb-2">
        <label className="block text-gray-700 mb-1" htmlFor="givenName">
          Given Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="givenName"
          type="text"
          name="givenName"
          value={formData.givenName}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="mb-2">
        <label className="block text-gray-700 mb-1" htmlFor="familyName">
          Family Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="familyName"
          type="text"
          name="familyName"
          value={formData.familyName}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="mb-2">
        <label className="block text-gray-700 mb-1" htmlFor="gender">
          Gender
        </label>
        <select
          className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="mb-2">
        <label className="block text-gray-700 mb-1" htmlFor="birthDate">
          Date of Birth
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="birthDate"
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleInputChange}
          required
          max={new Date().toISOString().split('T')[0]} // Set max date to today
        />
      </div>

      <div className="mb-2">
        <label className="block text-gray-700 mb-1" htmlFor="phone">
          Phone
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="phone"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-2">
        <label className="block text-gray-700 mb-1" htmlFor="email">
          Email
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-2 md:col-span-2">
        <label className="block text-gray-700 mb-1" htmlFor="address.line1">
          Address Line 1
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="address.line1"
          type="text"
          name="address.line1"
          value={formData.address.line1}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-2">
        <label className="block text-gray-700 mb-1" htmlFor="address.city">
          City
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="address.city"
          type="text"
          name="address.city"
          value={formData.address.city}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-2">
        <label className="block text-gray-700 mb-1" htmlFor="address.state">
          State
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="address.state"
          type="text"
          name="address.state"
          value={formData.address.state}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-1" htmlFor="address.postalCode">
          Postal Code
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="address.postalCode"
          type="text"
          name="address.postalCode"
          value={formData.address.postalCode}
          onChange={handleInputChange}
        />
      </div>

      <div className="flex items-center justify-between md:col-span-2">
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline flex items-center"
          type="button"
          onClick={() => router.push('/patients')}
        >
          <HiX className="mr-1" />
          Cancel
        </button>
        <div className="flex space-x-2">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline flex items-center"
            type="submit"
            disabled={loading}
          >
            <HiSave className="mr-1" />
            {loading ? patientId ? 'Updating.. ' : 'Saving...' : patientId ? 'Update Patient' : 'Save Patient'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PatientForm;
