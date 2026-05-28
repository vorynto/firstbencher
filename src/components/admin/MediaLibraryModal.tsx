"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
    X, Upload, Image as ImageIcon, Search, 
    Check, Trash2, Loader2, Filter, 
    FileImage, MousePointer2, Plus, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import ImageCropper from "./ImageCropper";

type MediaAsset = {
    id: string;
    url: string;
    filename: string;
    type: string;
    size: number;
    created_at: string;
};

const SUPABASE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
    : "db.firstbencher.com";

function fixStorageUrl(url: string): string {
    return url?.includes("db.firstbencher.com") ? url.replace("db.firstbencher.com", SUPABASE_HOST) : url;
}

type MediaLibraryModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    aspect?: number;
    hideGallery?: boolean;
};

export default function MediaLibraryModal({ isOpen, onClose, onSelect, aspect = 1, hideGallery = false }: MediaLibraryModalProps) {
    const [tab, setTab] = useState<"upload" | "library">(hideGallery ? "upload" : "library");
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    // Cropping state
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/media?q=${encodeURIComponent(search)}`);
            const data = await res.json();
            if (data.assets) {
                setAssets(data.assets);
            }
        } catch (error) {
            console.error("Failed to fetch media:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && tab === "library") {
            fetchAssets();
        }
    }, [isOpen, tab, search]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setUploadFile(file);
        const reader = new FileReader();
        reader.onload = () => {
            setTempImage(reader.result as string);
            setIsCropping(true);
        };
        reader.readAsDataURL(file);
    };

    const handleCropComplete = async (croppedBlob: Blob | null) => {
        setIsCropping(false);
        setIsUploading(true);
        
        try {
            const formData = new FormData();
            // If skipped cropping, use original file
            if (croppedBlob) {
                formData.append("file", croppedBlob, uploadFile?.name || "cropped_image.jpg");
            } else if (uploadFile) {
                formData.append("file", uploadFile);
            }

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                onSelect(data.url);
                onClose();
            } else {
                alert(data.error || "Upload failed");
            }
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setIsUploading(false);
            setTempImage(null);
            setUploadFile(null);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this image?")) return;
        
        try {
            const res = await fetch(`/api/media?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setAssets(assets.filter(a => a.id !== id));
                if (selectedId === id) setSelectedId(null);
            }
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 lg:p-8">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" 
            />
            
            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white w-full max-w-6xl h-[85vh] rounded-[40px] shadow-2xl relative z-10 flex flex-col overflow-hidden border border-white/20"
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                <ImageIcon size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900">Media Library</h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Select or upload your assets</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Tabs */}
                    {!hideGallery && (
                        <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-2xl w-fit">
                            <button 
                                onClick={() => setTab("library")}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${tab === "library" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                <ImageIcon size={18} /> Media Library
                            </button>
                            <button 
                                onClick={() => setTab("upload")}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${tab === "upload" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                <Upload size={18} /> Upload Files
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {tab === "library" ? (
                        <>
                            <div className="flex-1 flex flex-col h-full bg-gray-50/50">
                                {/* Search & Filters */}
                                <div className="p-6 bg-white border-b border-gray-100 flex items-center gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input 
                                            type="text" 
                                            placeholder="Search by filename..." 
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-100/50 border border-gray-200 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 rounded-2xl text-sm font-medium transition-all outline-none"
                                        />
                                    </div>
                                    <button className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-500 hover:text-primary transition-all shadow-sm">
                                        <Filter size={18} />
                                    </button>
                                </div>

                                {/* Grid */}
                                <div className="flex-1 overflow-y-auto p-8">
                                    {loading ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                                            <Loader2 size={40} className="animate-spin text-primary/40" />
                                            <p className="font-bold text-sm">Loading assets...</p>
                                        </div>
                                    ) : assets.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto gap-4">
                                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                                                <ImageIcon size={40} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900">No assets found</h4>
                                                <p className="text-sm text-gray-500 mt-1">Upload files or try a different search query to find your media.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                            {assets.map((asset) => (
                                                <div 
                                                    key={asset.id} 
                                                    onClick={() => setSelectedId(asset.id)}
                                                    className={`group relative aspect-square rounded-[30px] border-2 transition-all p-2 cursor-pointer ${selectedId === asset.id ? "border-primary bg-primary/5 ring-4 ring-primary/10 scale-[1.02]" : "border-gray-100 bg-white hover:border-primary/30"}`}
                                                >
                                                    <div className="w-full h-full rounded-[20px] overflow-hidden bg-gray-50 flex items-center justify-center relative">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={fixStorageUrl(asset.url)} alt={asset.filename} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                        
                                                        {/* Selection Checkmark */}
                                                        {selectedId === asset.id && (
                                                            <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center z-10">
                                                                <div className="bg-white text-primary w-10 h-10 rounded-full flex items-center justify-center shadow-lg transform scale-110">
                                                                    <Check size={24} strokeWidth={3} />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Delete Button */}
                                                        <button 
                                                            onClick={(e) => handleDelete(asset.id, e)}
                                                            className="absolute bottom-3 right-3 p-2.5 bg-primary-tint0 text-white rounded-xl shadow-xl transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all hover:bg-red-600 z-20"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sidebar Details */}
                            <div className="w-full md:w-80 bg-white border-l border-gray-100 p-8 flex flex-col overflow-y-auto">
                                {selectedId ? (
                                    <>
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Asset Details</h3>
                                        {(() => {
                                            const asset = assets.find(a => a.id === selectedId);
                                            if (!asset) return null;
                                            return (
                                                <div className="space-y-8 flex-1">
                                                    <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shadow-inner">
                                                        <img src={fixStorageUrl(asset.url)} alt="" className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Filename</label>
                                                            <p className="text-sm font-bold text-gray-900 break-all">{asset.filename}</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Size</label>
                                                                <p className="text-xs font-bold text-gray-700">{(asset.size / 1024).toFixed(1)} KB</p>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Storage</label>
                                                                <p className="text-xs font-bold text-gray-700">Supabase</p>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Uploaded On</label>
                                                            <p className="text-xs font-bold text-gray-700">{new Date(asset.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <Button 
                                                        onClick={() => {
                                                            onSelect(asset.url);
                                                            onClose();
                                                        }}
                                                        className="w-full py-4 shadow-lg shadow-primary/20 rounded-2xl mt-auto"
                                                    >
                                                        Insert Into Page
                                                    </Button>
                                                </div>
                                            );
                                        })()}
                                    </>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center px-4">
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4">
                                            <MousePointer2 size={32} />
                                        </div>
                                        <p className="text-sm font-bold text-gray-400">Select an image to see details and insert</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-gray-50/50 relative">
                            {isUploading ? (
                                <div className="flex flex-col items-center gap-6 text-center">
                                    <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900">Uploading Asset...</h4>
                                        <p className="text-sm text-gray-500 mt-1">Please wait while we process and store your image.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full max-w-2xl text-center space-y-8">
                                    <div className="relative border-4 border-dashed border-gray-200 rounded-[50px] p-20 hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer overflow-hidden backdrop-blur-sm bg-white/40">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleFileSelect}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                        />
                                        <div className="relative z-0 flex flex-col items-center">
                                            <div className="w-24 h-24 bg-primary/10 rounded-[35px] flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                                                <Upload size={40} />
                                            </div>
                                            <h3 className="text-2xl font-black text-gray-900">Upload New Media</h3>
                                            <p className="text-sm text-gray-500 mt-2 font-medium">Drag and drop your files here, or click to browse</p>
                                            <div className="flex items-center gap-3 mt-8 justify-center">
                                                <div className="px-4 py-2 bg-white rounded-xl border border-gray-100 text-xs font-bold text-gray-400 shadow-sm flex items-center gap-2">
                                                    <FileImage size={14} /> PNG, JPG, WEBP
                                                </div>
                                                <div className="px-4 py-2 bg-white rounded-xl border border-gray-100 text-xs font-bold text-gray-400 shadow-sm flex items-center gap-2">
                                                    <Plus size={14} /> UP TO 5MB
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Render Cropper separately on top */}
            <AnimatePresence>
                {isCropping && tempImage && (
                    <ImageCropper 
                        image={tempImage} 
                        aspect={aspect}
                        onCropComplete={handleCropComplete}
                        onCancel={() => {
                            setIsCropping(false);
                            setTempImage(null);
                            setUploadFile(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
