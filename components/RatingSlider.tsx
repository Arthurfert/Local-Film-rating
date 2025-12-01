'use client';

interface RatingSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export default function RatingSlider({
  value,
  onChange,
  min = 0,
  max = 10,
  step = 0.5,
}: RatingSliderProps) {
  // Calcul du pourcentage pour le gradient
  const percentage = ((value - min) / (max - min)) * 100;

  // Couleur basée sur la valeur
  const getColor = () => {
    if (value >= 7) return '#22c55e'; // green
    if (value >= 5) return '#f59e0b'; // yellow/orange
    return '#ef4444'; // red
  };

  return (
    <div className="relative">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, 
            ${getColor()} 0%, 
            ${getColor()} ${percentage}%, 
            rgba(255,255,255,0.1) ${percentage}%, 
            rgba(255,255,255,0.1) 100%)`,
        }}
      />
      
      {/* Marqueurs */}
      <div className="flex justify-between mt-1 px-1">
        {[0, 2, 4, 6, 8, 10].map((mark) => (
          <span
            key={mark}
            className={`text-xs ${
              value >= mark ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {mark}
          </span>
        ))}
      </div>
    </div>
  );
}
