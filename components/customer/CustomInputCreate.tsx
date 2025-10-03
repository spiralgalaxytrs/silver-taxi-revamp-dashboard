import React, { useState, useRef, useEffect, use } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogHeader
} from 'components/ui/dialog';
import { X } from 'lucide-react';
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
  onDelete: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const InputPicker: React.FC<InputPickerProps> = ({
  value,
  data,
  onChange,
  onCreate,
  onDelete,
  placeholder = 'Select...',
  className = '',
}) => {
  const [inputValue, setInputValue] = useState<string>(value);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false);
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);

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
            {data.map((option) => (
              <li
                key={option.value}
                className="flex items-center px-3 py-2 hover:bg-gray-200"
              >
                {/* Selection button (left, fills remaining space) */}
                <button
                  type="button"
                  className="flex-1 text-left focus:outline-none"
                  onClick={() => {
                    onChange(option.value);
                    setInputValue(option.label);
                    setIsDropdownOpen(false);
                  }}
                >
                  {option.label}
                </button>

                {/* Delete button (fixed size, right) */}
                <button
                  type="button"
                  aria-label={`Delete ${option.label}`}
                  className="flex-none w-8 h-8 ml-2 inline-flex items-center justify-center"
                  onClick={(e) => {
                    setIsDeleteMode(true);
                    setInputValue(option.value);
                  }}
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </li>
            ))}
          </ul>

        </div>
      )
      }

      {/* Create new value */}
      {
        inputValue.toLowerCase() && !data.find((option) => option.value.toLowerCase() === inputValue.toLowerCase()) && !isCreateMode && (
          <button
            onClick={() => setIsCreateMode(true)}
            className="text-blue-500 mt-2"
          >
            Create &quot;{inputValue}&quot;
          </button>
        )
      }

      {
        isCreateMode && (
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
        )
      }

      {
        isDeleteMode && (
          <Dialog open={isDeleteMode} onOpenChange={setIsDeleteMode}>
            <DialogContent className="rounded-2xl max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Delete Vehicle Type</DialogTitle>
              </DialogHeader>

              <div className="py-4">
                {/* Optional: add form fields here if needed */}
                Are you sure you want to delete this vehicle type?
              </div>

              <DialogFooter>
                <Button
                  variant={"destructive"}
                  onClick={
                    () => {
                      console.log("Deleting: >> ", inputValue);
                      onDelete(inputValue);
                      setIsDeleteMode(false);
                    }
                  }>Delete</Button>
                <Button variant="ghost" onClick={() => setIsDeleteMode(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      }

    </div >
  );
};

export default InputPicker;
