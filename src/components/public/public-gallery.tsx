"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface MediaFile {
  id: string;
  url: string;
  type: string;
  name: string;
}

export function PublicGallery({ files }: { files: MediaFile[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const imageFiles = files.filter((f) => f.type !== "video");

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {files.map((file, i) => (
          <div
            key={file.id}
            className={`rounded-xl overflow-hidden ${files.length === 1 ? "col-span-2" : ""}`}
          >
            {file.type === "video" ? (
              <video
                src={file.url}
                controls
                className="w-full h-48 object-cover bg-black"
                playsInline
              />
            ) : (
              <div
                className="relative w-full h-48 cursor-zoom-in"
                onClick={() =>
                  setLightboxIndex(
                    imageFiles.findIndex((f) => f.id === file.id),
                  )
                }
              >
                <Image
                  src={file.url}
                  alt={file.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 672px) 50vw, 336px"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && imageFiles.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="h-6 w-6" />
          </button>
          {imageFiles.length > 1 && (
            <>
              <button
                className="absolute left-4 text-white hover:text-gray-300 p-2 text-4xl leading-none"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    (lightboxIndex - 1 + imageFiles.length) % imageFiles.length,
                  );
                }}
              >
                ‹
              </button>
              <button
                className="absolute right-4 text-white hover:text-gray-300 p-2 text-4xl leading-none"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((lightboxIndex + 1) % imageFiles.length);
                }}
              >
                ›
              </button>
            </>
          )}
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={imageFiles[lightboxIndex].url}
              alt={imageFiles[lightboxIndex].name}
              width={1200}
              height={900}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded"
              style={{ width: "auto", height: "auto" }}
            />
          </div>
          {imageFiles.length > 1 && (
            <p className="absolute bottom-4 text-white/60 text-sm">
              {lightboxIndex + 1} / {imageFiles.length}
            </p>
          )}
        </div>
      )}
    </>
  );
}
