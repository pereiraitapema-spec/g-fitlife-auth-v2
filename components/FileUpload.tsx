
import React, { useState, useRef } from 'react';
import { storeService } from '../services/storeService';

interface FileUploadProps {
  currentUrl: string;
  onUploadComplete: (url: string) => void;
  label: string;
  circular?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ currentUrl, onUploadComplete, label, circular = false }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview imediato
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    setIsUploading(true);
    try {
      const remoteUrl = await storeService.uploadFile(file);
      onUploadComplete(remoteUrl);
    } catch (error) {
      alert('Falha no upload: ' + error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
      <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
        <div className={`relative overflow-hidden bg-slate-200 border-2 border-white shadow-sm flex-shrink-0 ${
          circular ? 'w-24 h-24 rounded-full' : 'w-32 h-20 rounded-2xl'
        }`}>
          <img src={preview || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="Preview" />
          {isUploading && (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            </div>
          )}
        </div>
        
        <div className="flex-1 space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase">JPG, PNG ou WEBP</p>
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-95"
          >
            Escolher Arquivo
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/jpeg,image/png,image/webp"
          />
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
