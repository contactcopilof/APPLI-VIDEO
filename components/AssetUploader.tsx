import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { UploadedAsset } from '../types';

interface AssetUploaderProps {
  label: string;
  asset: UploadedAsset | null;
  onAssetChange: (asset: UploadedAsset | null) => void;
  accept?: string;
}

export const AssetUploader: React.FC<AssetUploaderProps> = ({ 
  label, 
  asset, 
  onAssetChange,
  accept = "image/*"
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 immediately for easier handling
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Extract pure base64 data (remove data:image/xxx;base64, prefix)
      const base64Data = base64String.split(',')[1];
      
      onAssetChange({
        file,
        previewUrl: URL.createObjectURL(file),
        base64: base64Data,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const clearAsset = () => {
    onAssetChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      
      {!asset ? (
        <div 
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-copilof-teal hover:bg-slate-50 transition-colors h-48 bg-white"
        >
          <div className="bg-slate-100 p-3 rounded-full mb-3">
            <Upload className="w-6 h-6 text-copilof-dark" />
          </div>
          <p className="text-sm text-slate-600 font-medium">Click to upload</p>
          <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</p>
          <input 
            ref={inputRef}
            type="file" 
            className="hidden" 
            accept={accept} 
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 h-48 bg-white">
          <img 
            src={asset.previewUrl} 
            alt="Preview" 
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <button 
              onClick={clearAsset}
              className="bg-white/20 backdrop-blur-sm hover:bg-red-500 hover:text-white text-white p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs truncate">
            {asset.file.name}
          </div>
        </div>
      )}
    </div>
  );
};
