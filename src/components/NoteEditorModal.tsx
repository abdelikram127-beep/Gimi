import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Wand2, 
  Pin, 
  Star, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square,
  Tag as TagIcon
} from 'lucide-react';
import { ActionItem, Folder, Note } from '../types';
import { categorizeThought, expandThought } from '../lib/ai';

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteToEdit?: Note | null;
  folders: Folder[];
  currentFolderId?: string | null;
  onSave: (note: Partial<Note> & { id?: string }) => void;
  onDeleteToTrash?: (noteId: string) => void;
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  isOpen,
  onClose,
  noteToEdit,
  folders,
  currentFolderId,
  onSave,
  onDeleteToTrash,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [newActionText, setNewActionText] = useState('');
  
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title || '');
      setContent(noteToEdit.content || '');
      setFolderId(noteToEdit.folderId || null);
      setTags(noteToEdit.tags || []);
      setIsPinned(noteToEdit.isPinned || false);
      setIsFavorite(noteToEdit.isFavorite || false);
      setActionItems(noteToEdit.actionItems || []);
    } else {
      setTitle('');
      setContent('');
      setFolderId(currentFolderId || null);
      setTags([]);
      setIsPinned(false);
      setIsFavorite(false);
      setActionItems([]);
    }
    setAiMessage(null);
  }, [noteToEdit, currentFolderId, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddActionItem = () => {
    if (!newActionText.trim()) return;
    const newItem: ActionItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: newActionText.trim(),
      done: false,
    };
    setActionItems([...actionItems, newItem]);
    setNewActionText('');
  };

  const handleToggleAction = (id: string) => {
    setActionItems(
      actionItems.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  };

  const handleRemoveAction = (id: string) => {
    setActionItems(actionItems.filter((item) => item.id !== id));
  };

  // AI Auto-categorize
  const handleSmartCategorize = async () => {
    if (!title.trim() && !content.trim()) {
      setAiMessage('يرجى كتابة عنوان أو محتوى الفكرة أولاً ليتمكن الذكاء الاصطناعي من تحليلها.');
      return;
    }
    setIsCategorizing(true);
    setAiMessage(null);
    try {
      const result = await categorizeThought(title, content, folders);
      if (result.folderId) {
        setFolderId(result.folderId);
      }
      if (result.suggestedTags && result.suggestedTags.length > 0) {
        const unique = Array.from(new Set([...tags, ...result.suggestedTags]));
        setTags(unique);
      }
      const matchedFolder = folders.find((f) => f.id === result.folderId);
      const folderName = matchedFolder ? matchedFolder.name : 'صندوق الوارد';
      setAiMessage(`تم الترتيب الذكي! الفكرة تناسب ملف "${folderName}". ${result.explanation || ''}`);
    } catch (e) {
      setAiMessage('تعذر التصنيف الآلي حالياً، يمكنك تحديد الملف يدوياً.');
    } finally {
      setIsCategorizing(false);
    }
  };

  // AI Expand
  const handleSmartExpand = async () => {
    if (!title.trim() && !content.trim()) {
      setAiMessage('اكتب الفكرة بإيجاز أولاً ليتمكن الذكاء الاصطناعي من توسيعها وتطويرها.');
      return;
    }
    setIsExpanding(true);
    setAiMessage(null);
    try {
      const result = await expandThought(title, content);
      if (result.enhancedContent) {
        setContent(result.enhancedContent);
      }
      if (result.actionItems && result.actionItems.length > 0) {
        const newItems: ActionItem[] = result.actionItems.map((text, idx) => ({
          id: `ai-act-${Date.now()}-${idx}`,
          text,
          done: false,
        }));
        setActionItems([...actionItems, ...newItems]);
      }
      setAiMessage('تم تطوير الفكرة واقتراح خطوات عمل تطبيقية بنجاح!');
    } catch (e) {
      setAiMessage('تعذر تطوير الفكرة حالياً.');
    } finally {
      setIsExpanding(false);
    }
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;
    onSave({
      id: noteToEdit?.id,
      title: title.trim(),
      content: content.trim(),
      folderId,
      tags,
      isPinned,
      isFavorite,
      actionItems,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2">
            {/* Folder Selector */}
            <div className="flex items-center gap-1.5 text-xs text-stone-700 bg-white border border-stone-200 px-2.5 py-1 rounded-lg">
              <span className="text-stone-400">الملف:</span>
              <select
                value={folderId || ''}
                onChange={(e) => setFolderId(e.target.value ? e.target.value : null)}
                className="bg-transparent font-medium text-stone-900 focus:outline-hidden cursor-pointer"
              >
                <option value="">📥 غير مصنف (صندوق الوارد)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.emoji} {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Smart Auto-organize button */}
            <button
              type="button"
              onClick={handleSmartCategorize}
              disabled={isCategorizing}
              title="فرز وترتيب الفكرة تلقائياً في الملف الأنسب"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-colors disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-600 ${isCategorizing ? 'animate-spin' : ''}`} />
              <span>{isCategorizing ? 'جارٍ الترتيب...' : 'ترتيب ذكي'}</span>
            </button>

            {/* AI Expand button */}
            <button
              type="button"
              onClick={handleSmartExpand}
              disabled={isExpanding}
              title="تطوير الفكرة واقتراح خطوات تنفيذية"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <Wand2 className={`w-3.5 h-3.5 text-indigo-500 ${isExpanding ? 'animate-spin' : ''}`} />
              <span>{isExpanding ? 'جارٍ التطوير...' : 'توسيع الفكرة'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? 'إلغاء التثبيت' : 'تثبيت الفكرة في البداية'}
              className={`p-1.5 rounded-lg transition-colors ${
                isPinned ? 'bg-amber-100 text-amber-800' : 'text-stone-400 hover:bg-stone-100'
              }`}
            >
              <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              title={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
              className={`p-1.5 rounded-lg transition-colors ${
                isFavorite ? 'text-amber-500 bg-amber-50' : 'text-stone-400 hover:bg-stone-100'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI Notification Banner */}
        {aiMessage && (
          <div className="bg-amber-50/90 border-b border-amber-200/60 px-5 py-2 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{aiMessage}</span>
            </div>
            <button
              onClick={() => setAiMessage(null)}
              className="text-amber-600 hover:text-amber-900 text-xs px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Note Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان الفكرة (مثال: روتين العناية، خطة تمارين، مشروع تجاري...)"
            className="w-full text-lg font-bold text-stone-900 placeholder-stone-400 border-none outline-hidden focus:ring-0 px-0"
            autoFocus={!noteToEdit}
          />

          {/* Note Content Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="اكتب تفاصيل الفكرة، الملاحظات، أو الخواطر هنا بحرية..."
            rows={6}
            className="w-full text-sm text-stone-700 placeholder-stone-400 resize-none border-none outline-hidden focus:ring-0 px-0 leading-relaxed"
          />

          {/* Action Items / Checklist Section */}
          <div className="pt-3 border-t border-stone-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
              <span>خطوات تنفيذية / قائمة مهام ({actionItems.length})</span>
            </div>

            <div className="space-y-1.5">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 group py-1 px-2 rounded-lg hover:bg-stone-50"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleAction(item.id)}
                    className="flex items-center gap-2 text-xs text-stone-800 text-right flex-1"
                  >
                    {item.done ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-stone-400 shrink-0" />
                    )}
                    <span className={item.done ? 'line-through text-stone-400' : ''}>
                      {item.text}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveAction(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new action item */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newActionText}
                onChange={(e) => setNewActionText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddActionItem();
                  }
                }}
                placeholder="أضف مهمة أو خطوة جديدة..."
                className="flex-1 text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-hidden focus:border-amber-500 text-stone-800 placeholder-stone-400"
              />
              <button
                type="button"
                onClick={handleAddActionItem}
                className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة</span>
              </button>
            </div>
          </div>

          {/* Tags Section */}
          <div className="pt-3 border-t border-stone-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
              <TagIcon className="w-3.5 h-3.5" />
              <span>الوسوم والتصنيفات الدقيقة</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-stone-400 hover:text-stone-700"
                  >
                    ×
                  </button>
                </span>
              ))}

              <div className="inline-flex items-center gap-1">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="+ إضافة وسم (اضغط Enter)"
                  className="text-xs bg-transparent border-b border-stone-200 focus:border-amber-500 focus:outline-hidden py-0.5 px-1 w-36 text-stone-700 placeholder-stone-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between">
          <div>
            {noteToEdit && onDeleteToTrash && (
              <button
                type="button"
                onClick={() => {
                  onDeleteToTrash(noteToEdit.id);
                  onClose();
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 px-2 py-1.5 rounded hover:bg-rose-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>نقل لسلة المهملات</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 rounded-lg transition-colors shadow-xs"
            >
              حفظ الفكرة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
