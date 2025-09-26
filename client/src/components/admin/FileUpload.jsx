import React, { useState } from 'react';

const FileUpload = ({
  onUpload,
  accept = '*',
  maxSize = 100 * 1024 * 1024, // 100MB default
  className = '',
  placeholder = 'Choose file or drag and drop',
  disabled = false,
  multiple = false
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    if (!files.length) return;

    setError(null);

    // Validate files
    for (const file of files) {
      if (file.size > maxSize) {
        setError(`File "${file.name}" is too large. Maximum size is ${formatFileSize(maxSize)}.`);
        return;
      }
    }

    try {
      setUploading(true);

      if (multiple) {
        await onUpload(files);
      } else {
        await onUpload(files[0]);
      }
    } catch (error) {
      setError(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
          ${dragOver
            ? 'border-red-400 bg-red-500/10'
            : 'border-slate-600 hover:border-red-500/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${uploading ? 'pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <p className="text-sm text-gray-400">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="text-4xl text-gray-400">
              📁
            </div>
            <p className="text-sm text-gray-300">{placeholder}</p>
            <p className="text-xs text-gray-500">
              Max file size: {formatFileSize(maxSize)}
            </p>
            {accept !== '*' && (
              <p className="text-xs text-gray-500">
                Accepted formats: {accept}
              </p>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;