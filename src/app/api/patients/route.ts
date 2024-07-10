import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import type { Patient } from 'fhir/r4';

const FHIR_SERVER = 'https://hapi.fhir.org/baseR4';
const DEFAULT_PAGE_SIZE = 10;

async function fetchPatientById(patientId: string) {
  const response = await axios.get(`${FHIR_SERVER}/Patient/${patientId}`);
  return response.data;
}

async function fetchPatients(search: string, page: number, pageSize: number = DEFAULT_PAGE_SIZE) {
  const params = {
    _sort: '-_lastUpdated',
    _count: pageSize,
    _offset: page * pageSize,
    _total: 'accurate',
    ...(search && { name: search }),
  };
  const response = await axios.get(`${FHIR_SERVER}/Patient`, { params });
  return {
    patients: response.data.entry?.map((entry: { resource: any }) => entry) || [],
    total: response.data.total || 0,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const patientId = searchParams.get('id');

  try {
    if (patientId) {
      // Fetch single patient
      const data = await fetchPatientById(patientId);
      return NextResponse.json(data);
    } else {
      // Fetch multiple patients
      const search = searchParams.get('search') || '';
      const page = parseInt(searchParams.get('page') || '0', DEFAULT_PAGE_SIZE);
      const { patients, total } = await fetchPatients(search, page);
      return NextResponse.json({
        patients,
        total,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        totalPages: Math.ceil(total / DEFAULT_PAGE_SIZE),
      });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  const patientData = await request.json();

  try {
    const response = await fetch(`${FHIR_SERVER}/Patient`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/fhir+json'
      },
      body: JSON.stringify(patientData),
    });

    if (!response.ok) {
      throw new Error('Failed to create patient');
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const patientData = await request.json();

  try {
    const response = await fetch(`${FHIR_SERVER}/Patient/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/fhir+json'
      },
      body: JSON.stringify(patientData),
    });

    if (!response.ok) {
      throw new Error('Failed to update patient');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}

// export async function PUT(request: NextRequest) {
//   const patientData = await request.json();
//   console.log('patientData:', { patientData })
//   const { id } = patientData;

//   if (!id) {
//     return NextResponse.json({ error: 'Patient ID is required for updates' }, { status: 400 });
//   }

//   try {
//     const response = await fetch(`${FHIR_SERVER}/Patient/${id}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/fhir+json'
//       },
//       body: JSON.stringify(patientData),
//     });

//     if (!response.ok) {
//       throw new Error('Failed to update patient');
//     }

//     const data = await response.json();
//     return NextResponse.json(data);
//   } catch (error) {
//     console.error('Error updating patient:', error);
//     return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
//   }
// }