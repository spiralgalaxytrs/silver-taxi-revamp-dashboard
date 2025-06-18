import React, { useState } from 'react';

const PriceRangeAccordion = ({ label, minPrice, maxPrice, onMinPriceChange, onMaxPriceChange }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="border border-gray-400  rounded-md">
      <div className="flex justify-between items-center p-1.5 cursor-pointer" onClick={toggleAccordion}>
        <span className="font-medium">{label}</span>
        <span>{isOpen ? '-' : '+'}</span>
      </div>
      {isOpen && (
        <div className="p-2 ">
          <div className="mb-2">
            <label htmlFor="minPrice" className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Minimum Price
            </label>
            <input
              id="minPrice"
              type="number"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              className="border border-gray-400 rounded-md p-0.5 w-full"
              min="0" // Optional: Set a minimum value for price
            />
          </div>
          <div>
            <label htmlFor="maxPrice" className="text- font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Maximum Price
            </label>
            <input
              id="maxPrice"
              type="number"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              className="border border-gray-400 rounded-md p-0.5 w-full"
              min="0" // Optional: Set a minimum value for price
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceRangeAccordion;