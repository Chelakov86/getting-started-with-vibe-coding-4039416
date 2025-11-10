// src/utils/validation.ts

export const validateFileType = (file: File, allowedTypes: string[]): string | null => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !allowedTypes.includes(`.${fileExtension}`)) {
    return `Invalid file type. Only ${allowedTypes.join(', ')} files are allowed.`;
  }
  return null;
};

export const validateFileSize = (file: File, maxSizeMB: number): string | null => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File size exceeds the maximum limit of ${maxSizeMB}MB.`;
  }
  return null;
};

// A very basic check for ICS format by looking for "BEGIN:VCALENDAR"
export const validateICSFormat = async (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content.includes('BEGIN:VCALENDAR')) {
        resolve('Invalid ICS file format. Missing "BEGIN:VCALENDAR".');
      } else {
        resolve(null);
      }
    };
    reader.onerror = () => {
      resolve('Could not read file content.');
    };
    reader.readAsText(file);
  });
};
