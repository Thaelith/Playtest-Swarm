"use client";

import { useRef, useState } from "react";

type Props = {
  onScreenshot: (base64: string | null) => void;
};

export default function UploadPanel({ onScreenshot }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      onScreenshot(base64);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center cursor-pointer hover:border-zinc-500 transition-colors"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Game screenshot preview"
            className="max-h-48 mx-auto rounded-lg"
          />
        ) : (
          <div className="text-zinc-500">
            <svg className="mx-auto h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Click to upload game screenshot</p>
            <p className="text-xs mt-1 text-zinc-600">PNG, JPG, WebP</p>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
      </div>
      {preview && (
        <button
          onClick={() => {
            setPreview(null);
            onScreenshot(null);
            if (fileRef.current) fileRef.current.value = "";
          }}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          Remove screenshot
        </button>
      )}
    </div>
  );
}
