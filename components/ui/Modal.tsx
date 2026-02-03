import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center perspective-1000">
      {/* Glass Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* 3D Glass Modal */}
      <div 
        className="
          relative w-full max-w-lg mx-4
          glass-panel bg-white/80 rounded-2xl shadow-2xl border border-white/60
          transform transition-all duration-300 animate-[blob_0.3s_ease-out]
          flex flex-col max-h-[85vh]
        "
        style={{ animation: 'none', transformOrigin: 'center center' }} 
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>

        <div className="flex justify-between items-center p-5 border-b border-slate-200/50 relative z-10">
          <h2 className="text-xl font-bold text-slate-800 drop-shadow-sm">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-red-50 text-slate-500 hover:text-red-500 transition-all hover:rotate-90"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar relative z-10">
          {children}
        </div>
      </div>
      
      {/* Add specific entrance animation style inline to ensure it works */}
      <style>{`
        @keyframes modalPop {
          0% { opacity: 0; transform: scale(0.9) rotateX(10deg) translateY(20px); }
          100% { opacity: 1; transform: scale(1) rotateX(0deg) translateY(0); }
        }
        .glass-panel {
          animation: modalPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};