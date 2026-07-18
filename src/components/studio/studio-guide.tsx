"use client";

interface Step {
  number: number;
  title: string;
  description: string;
}

interface StudioGuideProps {
  steps: Step[];
  color?: string;
}

export default function StudioGuide({ steps, color = "#3b82f6" }: StudioGuideProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {steps.map((step) => (
        <div key={step.number} className="flex sm:flex-col gap-3 sm:gap-2 p-4 rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: color }}>
            {step.number}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-100">{step.title}</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
