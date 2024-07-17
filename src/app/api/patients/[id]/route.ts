import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import type { Patient } from 'fhir/r4';

const FHIR_SERVER = process.env.FHIR_SERVER;
const DEFAULT_PAGE_SIZE = 10;


export async function PUT(request: NextRequest, params: any) {
  const patientData = await request.json();

  const id  = params?.params?.id;
  console.log('patientData:', { id })

  if (!id) {
    return NextResponse.json({ error: 'Patient ID is required for updates',params }, { status: 400 });
  }

  try {
    const response = await fetch(`${FHIR_SERVER}/Patient/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/fhir+json'
      },
      body: JSON.stringify({...patientData, id}),
    });

    if (!response.ok) {
      throw new Error('Failed to update patient 2');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update patient', test: ""+error, patientData }, { status: 500 });
  }
}