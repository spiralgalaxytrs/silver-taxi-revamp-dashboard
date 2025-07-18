"use client";

import { MapPin } from "lucide-react";
import React, { useEffect } from "react";
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng
} from "use-places-autocomplete";

interface Props {
    onSelect: (address: string, lat: number, lng: number) => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    getValue: string;
}

const LocationAutocomplete: React.FC<Props> = ({ onSelect, onChange, getValue }) => {
    const {
        ready,
        value,
        setValue,
        suggestions: { status, data },
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            componentRestrictions: {
                country: "in"
            }
        }
    });

    useEffect(() => {
        setValue(getValue, false);
    }, [getValue]);

    const handleSelect = async (address: string) => {
        setValue(address, false);
        clearSuggestions();

        const results = await getGeocode({ address });
        const { lat, lng } = await getLatLng(results[0]);
        onSelect(address, lat, lng);
    };

    return (
        <div className="relative w-full">
            <input
                type="text"
                value={value}
                onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue.length >= 3) {
                        setValue(inputValue);
                        onChange(e);
                    } else {
                        setValue("");
                        onChange(e);
                    }
                }}
                disabled={!ready}
                placeholder="Enter a location"
                className="flex h-10 w-full rounded-md border border-slate-400 bg-transparent px-3 py-6 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:none  disabled:cursor-not-allowed disabled:opacity-50 md:text-sm hover:bg-primary active:bg-primary"
            />
            {status === "OK" && (
                <ul className="absolute bg-white border rounded-lg mt-1 w-full shadow-lg z-10 max-h-60 overflow-y-auto">
                    {data.map(({ place_id, description }) => (
                        <li
                            key={place_id}
                            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 transition duration-200"
                            onClick={() => handleSelect(description)}
                        >
                            <span className="text-gray-800 text-sm truncate">{description}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LocationAutocomplete;
