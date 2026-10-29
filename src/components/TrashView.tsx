import React, { useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Folder, Note } from '../types';

interface TrashViewProps {
  trashNotes: Note[];
  folders: Folder[];
  onRestoreNote: (noteId: string) => void;
  onRestoreAll: () => void;
  onPermanentDeleteNote: (noteId: string) => void;
  onEmptyTrash: () => void;
}

export const TrashView: React.FC<TrashViewProps> = ({
  trashNotes,
  folders,
  onRestoreNote,
  onRestoreAll,
  onPermanentDeleteNote,
  onEmptyTrash,
}) => {
  const [showConfirmEmpty, setShowConfirmEmpty] = useState(false);

  const getOriginalFolderName = (folderId?: string | null) => {
    if (!folderId) return 'صندوق الوارد (غير مصنف)';
    const f = folders.find((item) => item.id === folderId);
    return f ? `${f.emoji} ${f.name}` : 'غير مصنف';
  };

  const formatDate = (isoString: string) => {
    try {
      return new Intl.DateTimeFormat('ar-EG', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-5">
      {/* Informative Header Banner */}
      <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm">
              سلة المهملات (Corbeille)
            </h3>
            <p className="text-xs text-stone-600">
              الأفكار المحذوفة تظل هنا بشكل آمن، يمكنك استعادتها لأماكنها في أي وقت أو مسحها نهائياً.
            </p>
          </div>
        </div>

        {trashNotes.length > 0 && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onRestoreAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-stone-700 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
              <span>استعادة الكل</span>
            </button>
            <button
              onClick={() => setShowConfirmEmpty(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>إفراغ السلة</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Emptying Trash */}
      {showConfirmEmpty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-stone-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-stone-900 text-base">
              هل أنت متأكد من إفراغ سلة المهملات؟
            </h4>
            <p className="text-xs text-stone-500">
              سيتم حذف جميع الأفكار الموجودة في السلة ({trashNotes.length} فكرة) بشكل نهائي ولا يمكن استرجاعها بعد ذلك.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setShowConfirmEmpty(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  onEmptyTrash();
                  setShowConfirmEmpty(false);
                }}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition-colors"
              >
                نعم، احذف نهائياً
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      {trashNotes.length === 0 ? (
        <div className="text-center py-16 bg-white border border-stone-200/80 rounded-2xl p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <h4 className="font-bold text-stone-800 text-base">سلة المهملات نظيفة ومفرغة</h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            عندما تقوم بمسح أو حذف أي فكرة من ملفاتك، ستجدها هنا لتتمكن من استعادتها بسهولة إذا أردت.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {trashNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-xl border border-stone-200/90 p-4 flex flex-col justify-between hover:border-stone-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 text-xs text-stone-500">
                  <span className="font-medium text-stone-600">
                    {getOriginalFolderName(note.folderId || note.originalFolderId)}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {note.deletedAt ? formatDate(note.deletedAt) : ''}
                  </span>
                </div>

                <h4 className="font-bold text-stone-900 text-sm mb-1.5 line-clamp-1">
                  {note.title || 'فكرة بدون عنوان'}
                </h4>
                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mb-3">
                  {note.content}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => onRestoreNote(note.id)}
                  className="flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold px-2.5 py-1 rounded-md hover:bg-emerald-50 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>استعادة</span>
                </button>

                <button
                  onClick={() => onPermanentDeleteNote(note.id)}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded-md hover:bg-rose-50 transition-colors"
                  title="حذف نهائي"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف نهائي</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
