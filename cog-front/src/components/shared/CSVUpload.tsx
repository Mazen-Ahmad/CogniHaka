import React, { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface CSVUploadProps {
  onFileUpload: (file: File) => void;
  acceptedFileTypes?: string;
  description?: string;
}

const CSVUpload: React.FC<CSVUploadProps> = ({ 
  onFileUpload, 
  acceptedFileTypes = '.csv', 
  description = 'Upload your CSV file here' 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setUploadedFileName(file.name);
        onFileUpload(file);
      }
    }
  }, [onFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setUploadedFileName(file.name);
      onFileUpload(file);
    }
  };

  const clearFile = () => {
    setUploadedFileName(null);
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : uploadedFileName 
              ? 'border-green-300 bg-green-50' 
              : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {uploadedFileName ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="text-green-600" size={24} />
            <span className="text-green-800 font-medium">{uploadedFileName}</span>
            <button
              onClick={clearFile}
              className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <Upload className={`mx-auto mb-4 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} size={48} />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {isDragOver ? 'Drop your CSV file here' : 'Upload CSV File'}
            </h3>
            <p className="text-gray-500 mb-6">{description}</p>
            
            <label className="cursor-pointer">
              <span className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
                <Upload size={20} />
                Choose File
              </span>
              <input
                type="file"
                accept={acceptedFileTypes}
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </>
        )}
      </div>
    </div>
  );
};

export default CSVUpload;