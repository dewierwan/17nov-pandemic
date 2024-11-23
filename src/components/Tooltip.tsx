import { Info } from 'lucide-react';
import { useState } from 'react';

interface TooltipProps {
  text: string;
}

export default function Tooltip({ text }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center mr-1">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="text-gray-400 hover:text-gray-600 focus:outline-none inline-flex items-center"
        aria-label="More information"
      >
        <Info className="w-4 h-4" />
      </button>
      
      {isVisible && (
        <div className="absolute z-10 w-64 px-3 py-2 text-sm text-gray-600 bg-white border rounded-lg shadow-lg left-0 top-6">
          <div className="absolute w-2 h-2 bg-white border-t border-l transform -translate-y-1/2 rotate-45 -top-0 left-3" />
          {text}
        </div>
      )}
    </div>
  );
} 