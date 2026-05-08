"use client";

import React, { useState } from "react";
import { UploadCloud, Loader2, Image as ImageIcon, X, Edit2, Search } from "lucide-react";
import Image from "next/image";
import MediaLibraryModal from "./MediaLibraryModal";

type ImageUploadFieldProps = {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    aspect?: number;
    hideGallery?: boolean;
};

export default function ImageUploadField({ value, onChange, label = "Image Upload", aspect = 1, hideGallery = false }: ImageUploadFieldProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-2">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{label}</label>

            {value ? (
                <div className="relative group rounded-[30px] overflow-hidden border-2 border-gray-100 bg-white p-3 transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
                    <div className="relative w-full h-56 rounded-[22px] overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-50 shadow-inner">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={value} alt="Preview" className="object-contain w-full h-full transition-transform duration-700 group-hover:scale-105" />
                        
                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="w-12 h-12 bg-white text-primary rounded-2xl flex items-center justify-center shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all delay-[50ms]"
                                title="Change image"
                            >
                                <Edit2 size={20} />
                            </button>
                            <button 
                                type="button"
                                onClick={() => onChange("")}
                                className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all delay-[100ms]"
                                title="Remove image"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-3 px-1 pb-1">
                        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100/50">
                            <Search size={14} className="text-gray-400" />
                            <input 
                                type="text" 
                                value={value} 
                                readOnly 
                                className="w-full text-[11px] font-bold text-gray-500 bg-transparent outline-none truncate" 
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div 
                    onClick={() => setIsModalOpen(true)}
                    className="relative border-4 border-dashed border-gray-200 rounded-[35px] p-12 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center group overflow-hidden bg-gray-50/50 active:scale-[0.98]"
                >
                    <div className="flex flex-col items-center text-gray-400 group-hover:text-primary transition-all">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            <UploadCloud size={36} className="text-gray-300 group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-lg font-black text-gray-900">Choose Image</p>
                        <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">Gallery • Upload • Crop</p>
                    </div>
                    
                    {/* Floating Decorative Dots */}
                    <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-gray-200" />
                    <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-gray-200" />
                </div>
            )}

            <MediaLibraryModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={onChange}
                aspect={aspect}
                hideGallery={hideGallery}
            />
        </div>
    );
}
