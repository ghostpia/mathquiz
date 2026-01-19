
import React from 'react';

interface MathKeypadProps {
  onKeyPress: (key: string) => void;
  onClear: () => void;
  onDelete: () => void;
  onSubmit: () => void;
}

const MathKeypad: React.FC<MathKeypadProps> = ({ onKeyPress, onClear, onDelete, onSubmit }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

  const handleAction = (key: string) => {
    if (key === 'C') onClear();
    else if (key === '⌫') onDelete();
    else onKeyPress(key);
  };

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-sm mx-auto p-4 bg-white/50 rounded-3xl shadow-inner mt-4">
      {keys.map((key) => (
        <button
          key={key}
          onClick={() => handleAction(key)}
          className={`
            h-20 text-3xl font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center
            ${key === 'C' ? 'bg-orange-100 text-orange-600' : 
              key === '⌫' ? 'bg-red-100 text-red-600' : 
              'bg-white text-slate-700 shadow-sm border-b-4 border-slate-200'}
          `}
        >
          {key}
        </button>
      ))}
      <button
        onClick={onSubmit}
        className="col-span-3 h-20 bg-indigo-500 text-white text-2xl font-black rounded-2xl shadow-lg border-b-4 border-indigo-700 active:scale-95 transition-all mt-2"
      >
        정답 확인!
      </button>
    </div>
  );
};

export default MathKeypad;
