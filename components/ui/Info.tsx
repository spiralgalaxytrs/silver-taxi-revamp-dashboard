import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface InfoItem {
  label: string;
  value: string | number | React.ReactNode;
  highlight?: boolean;
  isDeducted?: boolean;
  isAdded?: boolean;
}

interface InfoComponentProps {
  content: InfoItem[] | string | React.ReactNode;
  // content: Array<Record<string, any>> | string ;
  position?: 'top' | 'bottom' | 'left' | 'right';
  iconSize?: string;
  iconColor?: string;
  popupBgColor?: string;
  popupTextColor?: string;
  popupBorderColor?: string;
  popupWidth?: string;
  closeOnOutsideClick?: boolean;
  className?: string;
  title?: string;
}

const InfoComponent: React.FC<InfoComponentProps> = ({
  content = [],
  position = 'right',
  iconSize = 'text-base',
  iconColor = 'text-gray-600',
  popupBgColor = 'bg-white',
  popupTextColor = 'text-gray-800',
  popupBorderColor = 'border-gray-300',
  popupWidth = 'w-64',
  closeOnOutsideClick = true,
  className = '',
  title = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);

  const togglePopup = () => setIsVisible(!isVisible);

  useEffect(() => {
    if (!closeOnOutsideClick) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current && !popupRef.current.contains(event.target as Node) &&
        iconRef.current && !iconRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeOnOutsideClick]);

  const getPopupPositionClasses = () => {
    const base = `absolute z-50 ${popupBgColor} ${popupTextColor} border ${popupBorderColor} rounded-md p-2 ${popupWidth} shadow-lg transition-opacity duration-200`;
    const hidden = isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none';
    const positions: Record<string, string> = {
      top: `bottom-full left-1/2 -translate-x-1/2 mb-2`,
      bottom: `top-full left-1/2 -translate-x-1/2 mt-2`,
      left: `top-1/2 right-full -translate-y-1/2 mr-2`,
      right: `top-1/2 left-full -translate-y-1/2 ml-2`,
    };
    return `${base} ${positions[position] || positions.right} ${hidden}`;
  };

  const renderContent = () => {
    if (typeof content === 'string') return <p className="text-sm">{content}</p>;
    if (React.isValidElement(content)) return content;

    if (Array.isArray(content)) {
      return (
        <div className="space-y-2">
          {title && <h4 className="font-bold text-sm  mb-2">{title}</h4>}
          <div className="space-y-1">
            {content.map((item, index) => {
              const valueClass = item.isDeducted
                ? 'text-red-600'
                : item.highlight
                ? 'font-semibold'
                : '';
              const displayValue = item.isDeducted ? `- ${item.value}` : item.value;
              return (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600 text-sm">{item.label}:</span>
                  <span className={`text-sm text-right ${valueClass}`}>{displayValue}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <span
        ref={iconRef}
        className={`cursor-pointer ${iconSize} ${iconColor} select-none hover:opacity-80 transition-opacity`}
        onClick={togglePopup}
        aria-label="Information"
        role="button"
      >
        <Info className="h-4 w-4" />
      </span>

      <div ref={popupRef} className={getPopupPositionClasses()}>
        <div className="p-2">{renderContent()}</div>
      </div>
    </div>
  );
};

export default InfoComponent;
