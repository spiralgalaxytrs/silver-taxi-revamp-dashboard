"use client"; // Ensures the code runs on the client side

import { LoadScript } from "@react-google-maps/api";
import { useMemo } from "react";
import PreLoader from "../../components/PreLoader";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

console.log("Google Maps API Key: >> ", GOOGLE_MAPS_API_KEY);

if (!GOOGLE_MAPS_API_KEY) {
  console.error("❌ Error: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not defined.");
}

interface GoogleMapsProviderProps {
  children: React.ReactNode;
}

export default function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const memoizedChildren = useMemo(() => children, [children]);

  return (
    <LoadScript
      googleMapsApiKey={GOOGLE_MAPS_API_KEY!}
      libraries={["places"]}
      loadingElement={<PreLoader />}
      onError={() => console.error("❌ Error loading Google Maps script.")}
    >
      {memoizedChildren}
    </LoadScript>
  );
}
