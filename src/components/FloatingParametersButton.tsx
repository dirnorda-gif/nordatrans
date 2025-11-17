import React from 'react';
import { FileText } from 'lucide-react';

interface FloatingParametersButtonProps {
  onClick: () => void;
}

export function FloatingParametersButton({ onClick }: FloatingParametersButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-[#083cb5] hover:bg-[#405b9a] text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 lg:hidden"
      aria-label="Показать параметры"
    >
      <FileText className="w-6 h-6" />
    </button>
  );
}

