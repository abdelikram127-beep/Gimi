import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Check } from 'lucide-react';
import { Folder } from '../types';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderToEdit?: Folder | null;
  onSave: (data: { name: string; emoji: string; color: string; description?: string }) => void;
}

const EMOJI_PRESETS = [
  '💅', '🌿', '💼', '📚', '💡', '🎨', 
  '🍳', '✈️', '🎯', '💰', '🏠', '🧘‍♀️', 
  '🛍️', '🏋️‍♂️', '🎵', '📝', '🥑', '✨',
  '☕', '🚀', '🧪', '📱', '🌸', '🧸'
];

const COLOR_PRESETS = [
  { id: 'rose', label: 'وردي', bg: 'bg-rose-500' },
  { id: 'emerald', label: 'زمردي', bg: 'bg-emerald-500' },
  { id: 'amber', label: 'عنبري', bg: 'bg-amber-500' },
  { id: 'sky', label: 'سماوي', bg: 'bg-sky-500' },
  { id: 'indigo', label: 'نيلي', bg: 'bg-indigo-500' },
  { id: 'teal', label: 'تركوازي', bg: 'bg-teal-500' },
  { id: 'purple', label: 'بنفسجي', bg: 'bg-purple-500' },
  { id: 'stone', label: 'رمادي دافئ', bg: 'bg-stone-500' },
];

export const FolderModal: React.FC<FolderModalProps> = ({
  isOpen,
  onClose,
  folderToEdit,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📁');
  const [color, setColor] = useState('amber');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (folderToEdit) {
      setName(folderToEdit.name);
      setEmoji(folderToEdit.emoji || '📁');
      setColor(folderToEdit.color || 'amber');
      setDescription(folderToEdit.description || '');
    } else {
      setName('');
      setEmoji('📁');
      setColor('amber');
      setDescription('');
    }
  }, [folderToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      emoji: emoji || '📁',
      color,
      description: description.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">
              {folderToEdit ? 'تعديل الملف' : 'إضافة ملف / تصنيف جديد'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name & Emoji input */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              اسم الملف / التصنيف
            </label>
            <div className="flex items-center gap-2">
              <div className="w-12 h-10 border border-stone-200 rounded-lg bg-stone-50 flex items-center justify-center text-xl shrink-0">
                {emoji}
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً: جمال، صحة، وصفات طعام، ميزانية..."
                className="flex-1 text-sm bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                autoFocus
              />
            </div>
          </div>

          {/* Emoji Presets */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              اختر أيقونة معبرة
            </label>
            <div className="grid grid-cols-8 gap-1.5 p-2 bg-stone-50 border border-stone-200 rounded-xl">
              {EMOJI_PRESETS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-white transition-colors ${
                    emoji === em ? 'bg-white shadow-xs ring-1 ring-amber-400' : ''
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Color theme */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              لون التمييز
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  title={c.label}
                  className={`w-6 h-6 rounded-full ${c.bg} flex items-center justify-center transition-transform hover:scale-110 ${
                    color === c.id ? 'ring-2 ring-offset-2 ring-stone-900' : ''
                  }`}
                >
                  {color === c.id && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              وصف الملف (اختياري)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثلاً: كل ما يخص العناية والجمال والروتين..."
              className="w-full text-xs bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 placeholder-stone-400 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2 text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              {folderToEdit ? 'حفظ التعديلات' : 'إنشاء الملف'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
