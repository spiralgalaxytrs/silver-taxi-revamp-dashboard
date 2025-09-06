import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogHeader
} from 'components/ui/dialog';
import { Button } from 'components/ui/button';



interface OptionType {
  label: string;
  value: string;
}

interface InputPickerProps {
  value: string;
  data: OptionType[];
  onChange: (value: string) => void;
  onCreate: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const InputPicker: React.FC<InputPickerProps> = ({
  value,
  data,
  onChange,
  onCreate,
  placeholder = 'Select...',
  className = '',
}) => {
  const [inputValue, setInputValue] = useState<string>(value);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown if click is outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleCreateNewValue = () => {
    if (inputValue && !data.find((option) => option.value === inputValue)) {
      onCreate(inputValue);
      setIsCreateMode(false); // Option created, stop creatable mode
    }
  };

  const handleInputClick = () => {
    setIsDropdownOpen(true); // Open dropdown when the input is clicked
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onClick={handleInputClick} // Only open dropdown on input click
        placeholder={placeholder}
        className="w-full border border-black py-4 p-3 text-black mt-1 rounded-md placeholder:text-black"
      />
      {isDropdownOpen && (
        <div className="absolute top-full left-0 w-full bg-white border mt-1 shadow-md">
          <ul>
            {data.map((option, index) => (
              <li
                key={index}
                onClick={() => {
                  onChange(option.value);
                  setInputValue(option.label);
                  setIsDropdownOpen(false); // Close dropdown after selection
                }}

                className="cursor-pointer p-2 hover:bg-gray-200"
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Create new value */}
      {inputValue.toLowerCase() && !data.find((option) => option.value.toLowerCase() === inputValue.toLowerCase()) && !isCreateMode && (
        <button
          onClick={() => setIsCreateMode(true)}
          className="text-blue-500 mt-2"
        >
          Create &quot;{inputValue}&quot;
        </button>
      )}

      {isCreateMode && (
        <Dialog open={isCreateMode} onOpenChange={setIsCreateMode}>
          <DialogContent className="rounded-2xl max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Create New Vehicle Type</DialogTitle>
            </DialogHeader>

            <div className="py-4">
              {/* Optional: add form fields here if needed */}
              Are you sure you want to create a new type?
            </div>

            <DialogFooter>
              <Button onClick={handleCreateNewValue}>Create</Button>
              <Button variant="ghost" onClick={() => setIsCreateMode(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
};

export default InputPicker;
