import React, { useState } from 'react';
import { Plus, Sparkles, Send } from 'lucide-react';
import { Folder } from '../types';

interface QuickAddBarProps {
  currentFolderId: string | null;
  folders: Folder[];
  onQuickAdd: (title: string, autoCategorize: boolean) => void;
  isCategorizing?: boolean;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({
  currentFolderId,
  folders,
  onQuickAdd,
  isCategorizing,
}) => {
  const [text, setText] = useState('');
  const currentFolder = folders.find((f) => f.id === currentFolderId);

  const handleSubmit = (autoCategorize: boolean) => {
    if (!text.trim()) return;
    onQuickAdd(text.trim(), autoCategorize);
    setText('');
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200/90 p-2 shadow-2xs flex items-center gap-2 mb-6 transition-all focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-300">
      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
        <Plus className="w-4 h-4" />
      </div>

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            // If in inbox or all, auto-categorize, otherwise add to current folder
            handleSubmit(!currentFolderId);
          }
        }}
        placeholder={
          currentFolder
            ? `أضف فكرة سريعة إلى "${currentFolder.name}"...`
            : 'دوّن أي فكرة سريعة هنا (مثلاً: روتين عناية بالبشرة، تمارين جيم، فكرة عمل)...'
        }
        className="flex-1 text-xs sm:text-sm bg-transparent border-none outline-hidden text-stone-800 placeholder-stone-400 px-1"
      />

      <div className="flex items-center gap-1.5 shrink-0">
        {/* Quick add with Auto-sort */}
        <button
          type="button"
          onClick={() => handleSubmit(true)}
          disabled={!text.trim() || isCategorizing}
          title="حفظ مع الترتيب والفرز التلقائي في أنسب ملف"
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-lg transition-colors disabled:opacity-40"
        >
          <Sparkles className={`w-3.5 h-3.5 text-amber-600 ${isCategorizing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">فرز ذكي</span>
        </button>

        {/* Normal quick add */}
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={!text.trim()}
          title="حفظ الفكرة مباشرة"
          className="p-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg transition-colors disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5 rotate-180" />
        </button>
      </div>
    </div>
  );
};
