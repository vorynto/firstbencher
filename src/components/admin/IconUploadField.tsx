"use client";

import React, { useState } from "react";
import { Upload, X, Edit2 } from "lucide-react";
import MediaLibraryModal from "./MediaLibraryModal";

type IconUploadFieldProps = {
    value: string;
    onChange: (url: string) => void;
    size?: number;
};

/** Compact square icon/image upload control, for small inline uses like category icons. */
export default function IconUploadField({ value, onChange, size = 44 }: IconUploadFieldProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div
                className="relative group shrink-0 rounded-lg border border-gray-200 bg-white overflow-hidden cursor-pointer hover:border-primary/40 transition-colors"
                style={{ width: size, height: size }}
                onClick={() => setIsModalOpen(true)}
                title="Upload icon"
            >
                {value ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={value} alt="Icon" className="w-full h-full object-contain p-1.5" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
                                className="text-white hover:text-gray-200"
                                title="Change icon"
                            >
                                <Edit2 size={13} />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onChange(""); }}
                                className="text-white hover:text-gray-200"
                                title="Remove icon"
                            >
                                <X size={13} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 group-hover:text-primary transition-colors">
                        <Upload size={16} />
                    </div>
                )}
            </div>

            <MediaLibraryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={onChange}
                aspect={1}
            />
        </>
    );
}
