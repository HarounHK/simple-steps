"use client";

type AlertBannerProps = {
  message: string | null; 
  onClose: () => void;    
};

// Reusable alert component for glucose alert warning
export default function AlertBanner({ message, onClose }: AlertBannerProps) {
  if (!message) return null;

  return (
    <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg mb-6 max-w-3xl w-full flex items-center justify-between">
      <span>⚠️ {message}</span>
      <button onClick={onClose} className="text-white font-bold ml-4">×</button>
    </div>
  );
}
