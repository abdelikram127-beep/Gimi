import React, { useState } from 'react';
import { 
  Pin, 
  Star, 
  Trash2, 
  Edit3, 
  Folder as FolderIcon, 
  CheckSquare, 
  Square, 
  Sparkles, 
  MoreHorizontal,
  RotateCcw,
  Tag
} from 'lucide-react';
import { Folder, Note, ViewMode } from '../types';

interface NoteCardProps {
  note: Note;
  folders: Folder[];
  viewMode: ViewMode;
  isSelected: boolean;
  onSelect: (noteId: string, isMulti: boolean) => void;
  onEdit: (note: Note) => void;
  onTogglePin: (noteId: string) => void;
  onToggleFavorite: (noteId: string) => void;
  onDeleteToTrash: (noteId: string) => void;
  onMoveToFolder: (noteId: string, folderId: string | null) => void;
  onToggleActionItem: (noteId: string, itemId: string) => void;
  onSmartCategorizeNote: (note: Note) => void;
  isCategorizing?: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  folders,
  viewMode,
  isSelected,
  onSelect,
  onEdit,
  onTogglePin,
  onToggleFavorite,
  onDeleteToTrash,
  onMoveToFolder,
  onToggleActionItem,
  onSmartCategorizeNote,
  isCategorizing,
}) => {
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const currentFolder = folders.find((f) => f.id === note.folderId);

  const completedActions = note.actionItems?.filter((a) => a.done).length || 0;
  const totalActions = note.actionItems?.length || 0;

  // Format date in Arabic friendly format
  const formattedDate = new Intl.DateTimeFormat('ar-EG', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(note.updatedAt));

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onEdit(note)}
        className={`group bg-white rounded-xl border p-3.5 transition-all cursor-pointer flex items-center justify-between gap-4 ${
          isSelected
            ? 'border-amber-400 bg-amber-50/20 shadow-xs ring-1 ring-amber-300'
            : 'border-stone-200/80 hover:border-stone-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Multi-select box */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(note.id, e.shiftKey || e.metaKey || e.ctrlKey);
            }}
            className="text-stone-300 hover:text-stone-600 focus:outline-hidden"
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4 text-amber-600" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>

          {/* Pin & Favorite icons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(note.id);
              }}
              title={note.isPinned ? 'إلغاء التثبيت' : 'تثبيت الفكرة في البداية'}
              className={`p-1 rounded hover:bg-stone-100 ${
                note.isPinned ? 'text-amber-600' : 'text-stone-300 hover:text-stone-500'
              }`}
            >
              <Pin className="w-3.5 h-3.5 fill-current" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(note.id);
              }}
              title={note.isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
              className={`p-1 rounded hover:bg-stone-100 ${
                note.isFavorite ? 'text-amber-500' : 'text-stone-300 hover:text-stone-500'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>

          {/* Title & Preview */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-stone-900 text-sm truncate">
                {note.title || 'فكرة بدون عنوان'}
              </h3>
              {note.folderId ? (
                <span className="text-xs text-stone-500 flex items-center gap-1 shrink-0 font-normal">
                  <span>{currentFolder?.emoji || '📁'}</span>
                  <span>{currentFolder?.name}</span>
                </span>
              ) : (
                <span className="text-xs text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded shrink-0">
                  غير مصنف
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 truncate mt-0.5">
              {note.content}
            </p>
          </div>
        </div>

        {/* Metadata & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {totalActions > 0 && (
            <span className="text-xs text-stone-400 font-mono">
              {completedActions}/{totalActions} مهام
            </span>
          )}
          <span className="text-xs text-stone-400 font-mono">{formattedDate}</span>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!note.folderId && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSmartCategorizeNote(note);
                }}
                disabled={isCategorizing}
                title="تصنيف ذكي بالأذكاء الاصطناعي"
                className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteToTrash(note.id);
              }}
              title="نقل إلى سلة المهملات"
              className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid Card View
  return (
    <div
      onClick={() => onEdit(note)}
      className={`group relative bg-white rounded-xl border p-4 transition-all duration-150 cursor-pointer flex flex-col justify-between hover:shadow-xs ${
        isSelected
          ? 'border-amber-400 bg-amber-50/15 ring-1 ring-amber-300'
          : note.isPinned
          ? 'border-amber-200/90 bg-amber-50/10'
          : 'border-stone-200/80 hover:border-stone-300'
      }`}
    >
      <div>
        {/* Card Header: Folder Badge / Selection / Pin / Star */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          {/* Folder switch dropdown button */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowFolderDropdown(!showFolderDropdown);
              }}
              className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 px-2 py-0.5 rounded-md hover:bg-stone-100 transition-colors"
              title="تغيير الملف"
            >
              {currentFolder ? (
                <>
                  <span className="text-sm">{currentFolder.emoji}</span>
                  <span className="font-medium text-stone-700">{currentFolder.name}</span>
                </>
              ) : (
                <>
                  <span className="text-amber-600 font-medium">📥 غير مصنف</span>
                </>
              )}
            </button>

            {/* Folder switcher popover */}
            {showFolderDropdown && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFolderDropdown(false);
                  }}
                />
                <div className="absolute right-0 top-7 z-30 w-48 bg-white border border-stone-200 rounded-lg shadow-lg py-1 text-xs">
                  <div className="px-3 py-1 font-semibold text-stone-400 text-[11px] border-b border-stone-100">
                    نقل الفكرة إلى:
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveToFolder(note.id, null);
                      setShowFolderDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-stone-700 hover:bg-stone-50"
                  >
                    <span>📥</span>
                    <span>صندوق الوارد (بدون تصنيف)</span>
                  </button>
                  {folders.map((f) => (
                    <button
                      key={f.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveToFolder(note.id, f.id);
                        setShowFolderDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-stone-700 hover:bg-stone-50 ${
                        f.id === note.folderId ? 'bg-amber-50 font-semibold text-amber-900' : ''
                      }`}
                    >
                      <span>{f.emoji}</span>
                      <span>{f.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Pin & Favorite */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(note.id);
              }}
              title={note.isPinned ? 'إلغاء التثبيت' : 'تثبيت الفكرة في البداية'}
              className={`p-1 rounded hover:bg-stone-100 transition-colors ${
                note.isPinned ? 'text-amber-600' : 'text-stone-300 hover:text-stone-500'
              }`}
            >
              <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(note.id);
              }}
              title={note.isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
              className={`p-1 rounded hover:bg-stone-100 transition-colors ${
                note.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-stone-300 hover:text-stone-500'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Note Title */}
        <h3 className="font-bold text-stone-900 text-sm leading-snug mb-2">
          {note.title || 'فكرة بدون عنوان'}
        </h3>

        {/* Note Content */}
        <p className="text-xs text-stone-600 whitespace-pre-line line-clamp-4 leading-relaxed mb-3">
          {note.content}
        </p>

        {/* Action Items / Checklist preview if present */}
        {note.actionItems && note.actionItems.length > 0 && (
          <div className="space-y-1 mb-3 pt-2 border-t border-stone-100">
            {note.actionItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleActionItem(note.id, item.id);
                }}
                className="flex items-center gap-2 text-xs text-stone-700 hover:text-stone-900 select-none py-0.5"
              >
                {item.done ? (
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                )}
                <span className={`truncate ${item.done ? 'line-through text-stone-400' : ''}`}>
                  {item.text}
                </span>
              </div>
            ))}
            {note.actionItems.length > 3 && (
              <p className="text-[11px] text-stone-400 pt-0.5">
                + {note.actionItems.length - 3} مهام إضافية...
              </p>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Metadata (NO PILLS - Zero Pill Discipline) */}
      <div className="pt-3 border-t border-stone-100 mt-2 flex items-center justify-between text-xs text-stone-400">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span>{formattedDate}</span>
          {note.tags && note.tags.length > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-stone-500">#{note.tags[0]}</span>
              {note.tags.length > 1 && (
                <span className="text-stone-400 text-[11px]">+{note.tags.length - 1}</span>
              )}
            </>
          )}
        </div>

        {/* Hover / Direct Actions */}
        <div className="flex items-center gap-1">
          {/* Smart AI organize if uncategorized */}
          {!note.folderId && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSmartCategorizeNote(note);
              }}
              disabled={isCategorizing}
              title="تصنيف ذكي للفكرة"
              className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteToTrash(note.id);
            }}
            title="نقل إلى سلة المهملات (Corbeille)"
            className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
