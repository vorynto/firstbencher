"use client";

import dynamic from "next/dynamic";
import React, { useMemo, useRef, useState, useCallback } from "react";
import "react-quill-new/dist/quill.snow.css";
import { Table } from "lucide-react";

const QuillEditor = dynamic(() => import("react-quill-new"), {
    ssr: false,
    loading: () => <div className="h-48 bg-gray-50 animate-pulse rounded-2xl border border-gray-200 flex items-center justify-center text-gray-400 font-semibold text-sm">Loading Editor...</div>,
}) as React.ComponentType<React.ComponentProps<typeof import("react-quill-new")["default"]> & { ref?: React.Ref<any> }>;

type RichTextEditorProps = {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    withTable?: boolean;
};

const MAX_ROWS = 6;
const MAX_COLS = 6;

function buildTableHtml(rows: number, cols: number): string {
    const headerRow = `<tr>${Array(cols).fill(0).map((_, ci) =>
        `<th style="border:1px solid #d1d5db;padding:8px 12px;background:#f9fafb;font-weight:600;text-align:left;">Column ${ci + 1}</th>`
    ).join("")}</tr>`;

    const bodyRows = Array(rows - 1).fill(0).map(() =>
        `<tr>${Array(cols).fill(0).map(() =>
            `<td style="border:1px solid #d1d5db;padding:8px 12px;">&nbsp;</td>`
        ).join("")}</tr>`
    ).join("");

    return `<table style="border-collapse:collapse;width:100%;margin:12px 0;"><thead>${headerRow}</thead><tbody>${bodyRows}</tbody></table><p><br></p>`;
}

export default function RichTextEditor({ value, onChange, label, placeholder, withTable }: RichTextEditorProps) {
    const quillRef = useRef<any>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [hovered, setHovered] = useState({ rows: 0, cols: 0 });
    const pickerRef = useRef<HTMLDivElement>(null);

    const insertTable = useCallback((rows: number, cols: number) => {
        const quill = quillRef.current?.getEditor?.();
        if (!quill) return;
        const range = quill.getSelection(true);
        quill.clipboard.dangerouslyPasteHTML(range?.index ?? 0, buildTableHtml(rows, cols));
        setPickerOpen(false);
        setHovered({ rows: 0, cols: 0 });
    }, []);

    // Close picker when clicking outside
    const handlePickerBlur = useCallback(() => {
        setTimeout(() => setPickerOpen(false), 150);
    }, []);

    const modules = useMemo(
        () => ({
            toolbar: [
                [{ header: [2, 3, 4, false] }],
                ["bold", "italic", "underline", "strike", "blockquote"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "clean"],
            ],
        }),
        []
    );

    const formats = [
        "header",
        "bold", "italic", "underline", "strike", "blockquote",
        "list", "indent",
        "link",
    ];

    return (
        <div className="space-y-2">
            {label && <label className="block text-sm font-semibold text-gray-700">{label}</label>}

            {withTable && (
                <div className="relative inline-block" onBlur={handlePickerBlur}>
                    <button
                        type="button"
                        onClick={() => setPickerOpen(v => !v)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                    >
                        <Table size={13} />
                        Insert Table
                    </button>

                    {pickerOpen && (
                        <div
                            ref={pickerRef}
                            className="absolute top-full left-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 z-50 min-w-50"
                        >
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                                {hovered.rows > 0 && hovered.cols > 0
                                    ? `${hovered.rows} × ${hovered.cols} table`
                                    : "Hover to select size"}
                            </p>
                            <div
                                className="grid gap-1"
                                style={{ gridTemplateColumns: `repeat(${MAX_COLS}, 1fr)` }}
                            >
                                {Array(MAX_ROWS).fill(0).map((_, ri) =>
                                    Array(MAX_COLS).fill(0).map((_, ci) => {
                                        const active = ri < hovered.rows && ci < hovered.cols;
                                        return (
                                            <div
                                                key={`${ri}-${ci}`}
                                                onMouseEnter={() => setHovered({ rows: ri + 1, cols: ci + 1 })}
                                                onMouseLeave={() => setHovered({ rows: 0, cols: 0 })}
                                                onClick={() => insertTable(ri + 1, ci + 1)}
                                                className={`w-7 h-7 rounded border cursor-pointer transition-colors ${
                                                    active
                                                        ? "bg-[var(--primary)]/15 border-[var(--primary)]"
                                                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                                }`}
                                            />
                                        );
                                    })
                                )}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-3">Click a cell to insert</p>
                        </div>
                    )}
                </div>
            )}

            <div className="bg-white rounded-2xl overflow-hidden [&_.ql-toolbar]:border-gray-200 [&_.ql-toolbar]:bg-gray-50 [&_.ql-container]:border-gray-200 [&_.ql-editor]:min-h-35 [&_.ql-editor]:text-gray-700 [&_.ql-editor]:text-sm [&_.ql-editor_table]:w-full [&_.ql-editor_table]:border-collapse [&_.ql-editor_td]:border [&_.ql-editor_td]:border-gray-300 [&_.ql-editor_td]:p-2 [&_.ql-editor_th]:border [&_.ql-editor_th]:border-gray-300 [&_.ql-editor_th]:p-2 [&_.ql-editor_th]:bg-gray-50 [&_.ql-editor_th]:font-semibold">
                <QuillEditor
                    ref={quillRef}
                    theme="snow"
                    value={value || ""}
                    onChange={(content) => {
                        if (content !== value) onChange(content);
                    }}
                    modules={modules}
                    formats={formats}
                    placeholder={placeholder || "Write something amazing..."}
                />
            </div>
            <p className="text-xs text-gray-400 mt-1">Highlight text to apply formatting.</p>
        </div>
    );
}
