"use client"; // Ensures the code runs on the client side

import { LoadScript } from "@react-google-maps/api";
import { useMemo } from "react";
import PreLoader from "../../components/others/PreLoader";
import { useConfigKeys } from "hooks/react-query/useConfigKeys";
import { Loader2 } from "lucide-react";

interface GoogleMapsProviderProps {
  children: React.ReactNode;
}

export default function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const memoizedChildren = useMemo(() => children, [children]);
  const { data: configKeysData, isLoading } = useConfigKeys();

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </>
    )
  }

  const GOOGLE_MAPS_API_KEY = configKeysData?.data.find((key) => key.keyName === "google_map_key")?.keyValue || "";

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
