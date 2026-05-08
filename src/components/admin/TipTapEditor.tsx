"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import Placeholder from "@tiptap/extension-placeholder";
import {
    Bold, Italic, Strikethrough,
    List, ListOrdered,
    Table as TableIcon, Trash2,
} from "lucide-react";

type Props = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

const MAX_ROWS = 6;
const MAX_COLS = 6;

export default function TipTapEditor({ value, onChange, placeholder }: Props) {
    const [tablePickerOpen, setTablePickerOpen] = useState(false);
    const [hovered, setHovered] = useState({ rows: 0, cols: 0 });

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Table.configure({ resizable: false }),
            TableRow,
            TableHeader,
            TableCell,
            Placeholder.configure({
                placeholder: placeholder || "Describe eligibility criteria and prerequisites...",
            }),
        ],
        content: value || "",
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "tiptap-editor min-h-[180px] p-4 text-sm text-gray-700 outline-none",
            },
        },
    });

    // Sync when external value changes (e.g. loading an existing course)
    useEffect(() => {
        if (!editor) return;
        if (value !== editor.getHTML()) {
            editor.commands.setContent(value || "", false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const insertTable = useCallback((rows: number, cols: number) => {
        editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
        setTablePickerOpen(false);
        setHovered({ rows: 0, cols: 0 });
    }, [editor]);

    if (!editor) {
        return (
            <div className="h-48 bg-gray-50 animate-pulse rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 text-sm font-semibold">
                Loading Editor…
            </div>
        );
    }

    const inTable = editor.isActive("table");

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">

            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">

                {/* Headings */}
                {(["H2", "H3"] as const).map((h) => (
                    <button
                        key={h}
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: h === "H2" ? 2 : 3 }).run()}
                        className={`px-2 py-1 rounded text-xs font-black transition-colors ${
                            editor.isActive("heading", { level: h === "H2" ? 2 : 3 })
                                ? "bg-gray-800 text-white"
                                : "text-gray-500 hover:bg-gray-200"
                        }`}
                    >
                        {h}
                    </button>
                ))}

                <span className="w-px h-5 bg-gray-200 mx-1 shrink-0" />

                {/* Inline formatting */}
                <ToolBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
                    <Bold size={13} />
                </ToolBtn>
                <ToolBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
                    <Italic size={13} />
                </ToolBtn>
                <ToolBtn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
                    <Strikethrough size={13} />
                </ToolBtn>

                <span className="w-px h-5 bg-gray-200 mx-1 shrink-0" />

                {/* Lists */}
                <ToolBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
                    <List size={13} />
                </ToolBtn>
                <ToolBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered list">
                    <ListOrdered size={13} />
                </ToolBtn>

                <span className="w-px h-5 bg-gray-200 mx-1 shrink-0" />

                {/* Insert Table picker */}
                <div className="relative">
                    <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); setTablePickerOpen(v => !v); }}
                        className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                        <TableIcon size={13} /> Table
                    </button>

                    {tablePickerOpen && (
                        <div
                            className="absolute top-full left-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 z-50 min-w-50"
                            onMouseLeave={() => setHovered({ rows: 0, cols: 0 })}
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
                                                onMouseDown={(e) => { e.preventDefault(); insertTable(ri + 1, ci + 1); }}
                                                className={`w-7 h-7 rounded border cursor-pointer transition-colors ${
                                                    active
                                                        ? "bg-[#a60303]/15 border-[#a60303]"
                                                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                                }`}
                                            />
                                        );
                                    })
                                )}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-3">Click to insert</p>
                        </div>
                    )}
                </div>

                {/* Table operations — only visible when cursor is inside a table */}
                {inTable && (
                    <>
                        <span className="w-px h-5 bg-gray-200 mx-1 shrink-0" />
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addColumnAfter().run(); }}
                            className="px-2 py-1 rounded text-[10px] font-black text-gray-600 hover:bg-gray-200 transition-colors" title="Add column after">
                            +Col
                        </button>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteColumn().run(); }}
                            className="px-2 py-1 rounded text-[10px] font-black text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete column">
                            −Col
                        </button>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addRowAfter().run(); }}
                            className="px-2 py-1 rounded text-[10px] font-black text-gray-600 hover:bg-gray-200 transition-colors" title="Add row after">
                            +Row
                        </button>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteRow().run(); }}
                            className="px-2 py-1 rounded text-[10px] font-black text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete row">
                            −Row
                        </button>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteTable().run(); }}
                            className="p-1.5 rounded text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete table">
                            <Trash2 size={13} />
                        </button>
                    </>
                )}
            </div>

            {/* ── Editor area ── */}
            <EditorContent editor={editor} />
        </div>
    );
}

function ToolBtn({ children, active, onClick, title }: {
    children: React.ReactNode;
    active: boolean;
    onClick: () => void;
    title: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-1.5 rounded transition-colors ${
                active ? "bg-gray-800 text-white" : "text-gray-500 hover:bg-gray-200"
            }`}
        >
            {children}
        </button>
    );
}
