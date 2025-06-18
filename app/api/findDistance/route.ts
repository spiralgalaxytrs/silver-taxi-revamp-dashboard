import { NextResponse } from 'next/server';
import axios from 'axios';

let isProcessing = false;  // Add flag to track API call status

export async function GET(request: Request) {
    if (isProcessing) {
        return NextResponse.json({ error: 'Request already in progress.' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');

    if (!origin || !destination) {
        return NextResponse.json({ error: 'Origin and destination are required.' }, { status: 400 });
    }

    try {
        isProcessing = true;  // Set flag before API call
        const response = await axios.get(`https://maps.thereciprocalsolutions.com/distance-matrix?origin=${origin}&destination=${destination}`);

        const { distance, duration } = response.data.trip; // Adjust based on the actual response structure

        return NextResponse.json({
            distance,
            duration,
            origin,
            destination,
        });
    } catch (error) {
        console.error("Error fetching distance:", error);
        return NextResponse.json({ error: 'An error occurred while fetching distance.' }, { status: 500 });
    } finally {
        isProcessing = false;  // Reset flag after completion or error
    }
}
