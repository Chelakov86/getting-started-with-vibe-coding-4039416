import React, { useState } from 'react';
import { OptimizedEvent } from '../types';
import { buildICSFile } from '../utils/icsBuilder';
import { downloadFile, generateFilenameWithTimestamp } from '../utils/download';
import styles from './ExportButton.module.css';

interface ExportButtonProps {
  optimizedEvents: OptimizedEvent[];
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  optimizedEvents,
  disabled = false,
  onSuccess,
  onError,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setShowSuccess(false);

    try {
      // Generate ICS file content
      const icsContent = buildICSFile(optimizedEvents);

      // Generate filename with timestamp
      const filename = generateFilenameWithTimestamp('optimized-schedule', 'ics');

      // Trigger download (await in case it's async)
      await downloadFile(icsContent, filename);

      // Show success feedback
      setShowSuccess(true);
      onSuccess?.();

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      const exportError = error instanceof Error ? error : new Error('Export failed');
      onError?.(exportError);
    } finally {
      setIsExporting(false);
    }
  };

  const isDisabled = disabled || isExporting || optimizedEvents.length === 0;

  return (
    <div className={styles.exportContainer}>
      <button
        className={styles.exportButton}
        onClick={handleExport}
        disabled={isDisabled}
        aria-label="Export optimized calendar"
      >
        {isExporting ? (
          <>
            <span className={styles.spinner} aria-hidden="true"></span>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <span className={styles.icon} aria-hidden="true">📥</span>
            <span>Export Optimized Calendar</span>
          </>
        )}
      </button>
      
      {showSuccess && (
        <div className={styles.successMessage} role="status" aria-live="polite">
          ✓ Calendar exported successfully!
        </div>
      )}
    </div>
  );
};
