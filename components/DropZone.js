/**
 * components/DropZone.js
 * Drag-and-drop file upload component.
 */
'use client';

import { useCallback, useState } from 'react';

const ACCEPT_IMAGE = 'image/jpeg,image/png,image/webp,image/gif,image/bmp';
const ACCEPT_AUDIO = 'audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/flac,audio/aac';

export default function DropZone({ onFileSelected, disabled }) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [fileType, setFileType] = useState(null);

  const handleFile = useCallback(
    (file) => {
      if (!file) return;

      const isImage = file.type.startsWith('image/');
      const isAudio = file.type.startsWith('audio/');

      if (!isImage && !isAudio) {
        alert('Unsupported file type. Please upload an image or audio file.');
        return;
      }

      setFileName(file.name);
      setFileType(isImage ? 'image' : 'audio');

      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }

      onFileSelected(file);
    },
    [onFileSelected],
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile],
  );

  const onInputChange = useCallback(
    (e) => {
      handleFile(e.target.files[0]);
    },
    [handleFile],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer min-h-[220px] p-6
        ${dragging ? 'border-violet-400 bg-violet-900/20 scale-[1.01]' : 'border-slate-600 bg-slate-800/50'}
        ${disabled ? 'opacity-50 pointer-events-none' : 'hover:border-violet-500 hover:bg-slate-800/80'}
      `}
    >
      <input
        type="file"
        accept={`${ACCEPT_IMAGE},${ACCEPT_AUDIO}`}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={onInputChange}
        disabled={disabled}
      />

      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Preview"
          className="max-h-40 max-w-full rounded-xl object-contain shadow-lg"
        />
      ) : fileType === 'audio' ? (
        <div className="flex flex-col items-center gap-2 text-slate-300">
          <span className="text-5xl">🎵</span>
          <span className="text-sm font-medium">{fileName}</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-slate-400 text-center">
          <span className="text-5xl select-none">🖼️</span>
          <p className="text-base font-medium text-slate-300">
            Drop image or audio here
          </p>
          <p className="text-xs text-slate-500">
            JPEG · PNG · WEBP · MP3 · WAV · OGG · up to 10 MB
          </p>
        </div>
      )}

      {fileName && (
        <p className="mt-3 text-xs text-slate-400 truncate max-w-full px-2">
          📎 {fileName}
        </p>
      )}
    </div>
  );
}
