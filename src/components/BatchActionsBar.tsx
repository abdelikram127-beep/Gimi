import React, { useState } from 'react';
import { Folder as FolderIcon, Trash2, X, Check, ArrowRight } from 'lucide-react';
import { Folder } from '../types';

interface BatchActionsBarProps {
  selectedCount: number;
  folders: Folder[];
  onClearSelection: () => void;
  onBatchMoveToFolder: (folderId: string | null) => void;
  onBatchDeleteToTrash: () => void;
}

export const BatchActionsBar: React.FC<BatchActionsBarProps> = ({
  selectedCount,
  folders,
  onClearSelection,
  onBatchMoveToFolder,
  onBatchDeleteToTrash,
}) => {
  const [showFolderMenu, setShowFolderMenu] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-stone-900 text-white rounded-2xl shadow-xl px-4 py-2.5 flex items-center gap-3 border border-stone-800 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-2 text-xs font-semibold pl-2 border-l border-stone-700">
        <span>تم تحديد {selectedCount} فكرة</span>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowFolderMenu(!showFolderMenu)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors"
        >
          <FolderIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>نقل إلى ملف...</span>
        </button>

        {showFolderMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowFolderMenu(false)}
            />
            <div className="absolute bottom-10 right-0 z-20 w-48 bg-white text-stone-800 border border-stone-200 rounded-xl shadow-xl py-1 text-xs">
              <div className="px-3 py-1 font-semibold text-stone-400 text-[11px] border-b border-stone-100">
                اختر المجلد الهدف:
              </div>
              <button
                onClick={() => {
                  onBatchMoveToFolder(null);
                  setShowFolderMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-stone-50 text-right"
              >
                <span>📥</span>
                <span>صندوق الوارد (غير مصنف)</span>
              </button>
              {folders.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    onBatchMoveToFolder(f.id);
                    setShowFolderMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-stone-50 text-right"
                >
                  <span>{f.emoji}</span>
                  <span>{f.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <button
        onClick={onBatchDeleteToTrash}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-rose-900/40 text-rose-300 hover:bg-rose-900/60 rounded-lg transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>نقل للسلة</span>
      </button>

      <button
        onClick={onClearSelection}
        className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
        title="إلغاء التحديد"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
