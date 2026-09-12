import React from 'react';
import { Download, X, Check } from 'lucide-react';

interface SnapshotToastProps {
  imageUrl: string | null;
  onClose: () => void;
  veggieName: string;
}

export const SnapshotToast: React.FC<SnapshotToastProps> = ({
  imageUrl,
  onClose,
  veggieName,
}) => {
  if (!imageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${veggieName.toLowerCase().replace(/\s+/g, '-')}-snapshot.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm pointer-events-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 p-5 max-w-sm w-full flex flex-col items-center text-center">
        <div className="w-full flex justify-between items-center mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <Check className="w-4 h-4" />
            <span>Snapshot Captured!</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="w-full aspect-square rounded-2xl overflow-hidden border border-stone-100 bg-stone-50 shadow-inner mb-4 flex items-center justify-center">
          <img
            src={imageUrl}
            alt="Veggie Snapshot"
            className="w-full h-full object-contain"
          />
        </div>

        <p className="text-xs text-stone-600 mb-4">
          Your cute 3D {veggieName} is ready to save and share!
        </p>

        <div className="flex gap-2 w-full">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
