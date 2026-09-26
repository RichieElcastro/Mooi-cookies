import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImageUploadFieldProps {
  value: string;
  onChange: (imageUrl: string) => void;
  label?: string;
  idPrefix?: string;
}

/**
 * Optimizes an image file by resizing it to a maximum dimension of 960px
 * and exporting as compressed JPEG. This keeps localStorage usage low (<200KB)
 * while maintaining crisp resolution for retina displays.
 */
function processImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File yang dipilih harus berupa file gambar (JPG, PNG, WebP).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format berkas gambar tidak valid atau rusak.'));
      img.onload = () => {
        const maxDim = 960;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        // Fill white background in case of transparent PNG converted to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.84);
        resolve(compressedDataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  label = 'Foto / Gambar Menu',
  idPrefix = 'menu-img',
}) => {
  const isDataUrl = value?.startsWith('data:image/');
  const [activeMode, setActiveMode] = useState<'upload' | 'url'>(isDataUrl ? 'upload' : 'upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const optimizedUrl = await processImageFile(file);
      onChange(optimizedUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses file gambar');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset so same file can be chosen again if needed
    if (e.target) e.target.value = '';
  };

  const handleClearImage = () => {
    onChange('');
    setErrorMessage(null);
  };

  return (
    <div id={`${idPrefix}-container`} className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block font-bold text-stone-700 text-xs sm:text-sm">
          {label}
        </label>
        {/* Toggle Mode: Upload vs URL */}
        <div className="flex items-center bg-stone-100 p-0.5 rounded-lg text-[11px] font-semibold">
          <button
            type="button"
            id={`${idPrefix}-mode-upload-btn`}
            onClick={() => {
              setActiveMode('upload');
              setErrorMessage(null);
            }}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              activeMode === 'upload'
                ? 'bg-white text-amber-900 shadow-2xs font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            id={`${idPrefix}-mode-url-btn`}
            onClick={() => {
              setActiveMode('url');
              setErrorMessage(null);
            }}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              activeMode === 'url'
                ? 'bg-white text-amber-900 shadow-2xs font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>URL Web</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Direct File Upload (Drag & Drop + Click) */}
      {activeMode === 'upload' && (
        <div className="space-y-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            id={`${idPrefix}-file-input`}
            accept="image/png,image/jpeg,image/webp,image/jpg"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {value ? (
            /* Image Preview Card */
            <div
              id={`${idPrefix}-preview-card`}
              className="p-3 bg-stone-50 rounded-xl border border-stone-200/90 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={value}
                  alt="Preview Menu"
                  className="w-14 h-14 rounded-lg object-cover bg-stone-200 border border-stone-300 shadow-2xs shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-emerald-700 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Gambar Siap Digunakan</span>
                  </div>
                  <span className="text-[11px] text-stone-500 block truncate">
                    {isDataUrl ? 'File gambar dari perangkat' : 'Tautan gambar'}
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-amber-800 font-bold hover:underline mt-0.5 inline-block cursor-pointer"
                  >
                    Pilih File Lain
                  </button>
                </div>
              </div>

              <button
                type="button"
                id={`${idPrefix}-remove-btn`}
                onClick={handleClearImage}
                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                title="Hapus foto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Drag and Drop Zone */
            <div
              id={`${idPrefix}-dropzone`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-amber-500 bg-amber-50/70 scale-[0.99]'
                  : 'border-stone-300 hover:border-amber-400 bg-stone-50/50 hover:bg-amber-50/20'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-amber-800 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 text-amber-800" />
                )}
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-stone-800 block">
                  {isProcessing
                    ? 'Sedang memproses gambar...'
                    : 'Klik untuk upload atau seret foto ke sini'}
                </span>
                <span className="text-[11px] text-stone-500 block mt-0.5">
                  Format JPG, PNG, atau WebP (otomatis dikompres & dioptimasi)
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Web Image URL */}
      {activeMode === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2.5 items-center">
            {value ? (
              <img
                src={value}
                alt="Preview"
                className="w-11 h-11 rounded-lg object-cover bg-stone-100 border border-stone-300 shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
            )}
            <input
              type="url"
              id={`${idPrefix}-url-input`}
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-600/30 text-xs"
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
