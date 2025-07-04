import React, { useState } from 'react';

const DateRangeAccordion = ({ label, startDate, endDate, onStartDateChange, onEndDateChange }:any) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="border border-gray-400 rounded-md">
      <div className="flex justify-between items-center p-1.5 cursor-pointer" onClick={toggleAccordion}>
        <span className="font-medium">{label}</span>
        <span>{isOpen ? '-' : '+'}</span>
      </div>
      {isOpen && (
        <div className="p-2">
          <div className="mb-2">
            <label htmlFor="startDate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="border border-gray-400 rounded-md p-0.5 w-full"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="border border-gray-400 rounded-md p-0.5 w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeAccordion;