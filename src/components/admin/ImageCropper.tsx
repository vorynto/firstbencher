"use client";

import React, { useState, useCallback } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import { X, Crop, RotateCcw, Check, SkipForward } from "lucide-react";
import Button from "@/components/ui/Button";

type ImageCropperProps = {
    image: string; // Blob URL or Source URL
    onCropComplete: (croppedImage: Blob | null) => void;
    onCancel: () => void;
    aspect?: number;
};

export default function ImageCropper({ image, onCropComplete, onCancel, aspect = 1 }: ImageCropperProps) {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropChange = (crop: Point) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropAreaComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createCroppedImage = async () => {
        try {
            if (!croppedAreaPixels) return;
            const canvas = document.createElement("canvas");
            const img = new Image();
            img.src = image;
            await new Promise((resolve) => {
                img.onload = resolve;
            });

            const scaleX = img.naturalWidth / img.width;
            const scaleY = img.naturalHeight / img.height;

            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;
            const ctx = canvas.getContext("2d");

            if (!ctx) return;

            ctx.drawImage(
                img,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                croppedAreaPixels.width,
                croppedAreaPixels.height
            );

            canvas.toBlob((blob) => {
                onCropComplete(blob);
            }, "image/jpeg");
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 lg:p-10">
            <div className="bg-white w-full max-w-4xl h-[80vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <Crop size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Crop Image</h3>
                            <p className="text-xs text-gray-500 font-medium">Fine tune your image dimensions</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 relative bg-gray-900">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={onCropChange}
                        onCropComplete={onCropAreaComplete}
                        onZoomChange={onZoomChange}
                    />
                </div>

                <div className="p-6 bg-gray-50 flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider min-w-[60px]">Zoom</span>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <span className="text-sm font-bold text-gray-700 min-w-[40px] text-right">{zoom.toFixed(1)}x</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex gap-3">
                            <button
                                onClick={onCancel}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 font-bold text-sm text-gray-600 flex items-center gap-2 hover:bg-white transition-all shadow-sm"
                            >
                                <X size={16} /> Cancel
                            </button>
                            <button
                                onClick={() => { setZoom(1); setCrop({ x: 0, y: 0 }); }}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 font-bold text-sm text-gray-600 flex items-center gap-2 hover:bg-white transition-all shadow-sm"
                            >
                                <RotateCcw size={16} /> Reset
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => onCropComplete(null)}
                                className="px-6 py-2.5 rounded-xl border border-gray-100 bg-white font-bold text-sm text-gray-500 flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
                            >
                                <SkipForward size={16} /> Skip Cropping
                            </button>
                            <button
                                onClick={createCroppedImage}
                                className="bg-primary text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <Check size={18} /> Apply Crop & Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
