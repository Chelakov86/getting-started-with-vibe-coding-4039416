// src/components/FileUpload.tsx

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import styles from './FileUpload.module.css';
import { validateFileType, validateFileSize, validateICSFormat } from '../utils/validation';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  isProcessing: boolean;
  error: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing, error }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedFileTypes = ['.ics'];
  const maxFileSizeMB = 5;

  const handleFileValidation = async (file: File) => {
    setInternalError(null); // Clear previous internal errors

    const typeError = validateFileType(file, allowedFileTypes);
    if (typeError) {
      setInternalError(typeError);
      return;
    }

    const sizeError = validateFileSize(file, maxFileSizeMB);
    if (sizeError) {
      setInternalError(sizeError);
      return;
    }

    // Perform basic ICS format validation
    const formatError = await validateICSFormat(file);
    if (formatError) {
      setInternalError(formatError);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileValidation(file);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setInternalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input
    }
    onFileSelect(null); // Notify parent that file is cleared
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileValidation(file);
    }
  };

  const displayError = error || internalError;

  return (
    <div
      className={`${styles.fileUploadContainer} ${isDragOver ? styles.dragOver : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Upload ICS file"
    >
      <input
        type="file"
        ref={fileInputRef}
        className={styles.fileInput}
        accept=".ics"
        onChange={handleFileChange}
        aria-describedby={displayError ? 'file-upload-error' : undefined}
        data-testid="file-input"
      />

      {selectedFile ? (
        <>
          <p className={styles.fileName}>Selected file: {selectedFile.name}</p>
          {isProcessing && <p className={styles.processingMessage}>Processing...</p>}
          {displayError && (
            <p id="file-upload-error" className={styles.errorMessage} role="alert">
              {displayError}
            </p>
          )}
          <button className={styles.clearButton} onClick={handleClearFile} disabled={isProcessing}>
            Clear
          </button>
        </>
      ) : (
        <>
          <span className={styles.uploadIcon} aria-hidden="true">⬆️</span> {/* Placeholder for an icon */}
          <p className={styles.uploadText}>Drag & drop your .ics file here, or <strong>click to browse</strong></p>
          {displayError && (
            <p id="file-upload-error" className={styles.errorMessage} role="alert">
              {displayError}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default FileUpload;
