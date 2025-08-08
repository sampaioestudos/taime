import React, { useCallback, useState } from 'react';
import { useTranslation } from '../i18n';
import { ImportIcon } from './icons';

interface FileUploaderProps {
  onFileLoaded: (content: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileLoaded }) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileLoaded(content);
      };
      reader.readAsText(file);
    } else {
        // Handle error - maybe via toast
        alert(t('importError'));
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [onFileLoaded]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const baseClasses = "flex flex-col items-center justify-center w-full h-32 px-4 transition-colors duration-200 ease-in-out border-2 border-dashed rounded-lg cursor-pointer";
  const inactiveClasses = "border-gray-500 bg-gray-700 hover:bg-gray-600/70";
  const activeClasses = "border-cyan-400 bg-cyan-900/50";

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`${baseClasses} ${isDragging ? activeClasses : inactiveClasses}`}
    >
      <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <ImportIcon className={`w-8 h-8 mb-3 ${isDragging ? 'text-cyan-400' : 'text-gray-400'}`} />
          <p className={`text-sm ${isDragging ? 'text-cyan-300' : 'text-gray-400'}`}>
            <span className="font-semibold">{t('dropFileHere')}</span>
          </p>
        </div>
        <input id="file-upload" type="file" className="hidden" accept=".json" onChange={handleFileChange} />
      </label>
    </div>
  );
};

export default FileUploader;
