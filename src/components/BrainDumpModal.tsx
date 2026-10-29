import React, { useState } from 'react';
import { X, Sparkles, Brain, Check, ArrowRight } from 'lucide-react';
import { Folder, Note } from '../types';
import { splitBrainDump } from '../lib/ai';

interface BrainDumpModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  onImportExtractedNotes: (notes: Array<{ title: string; content: string; folderId: string | null; tags: string[]; actionItems?: string[] }>) => void;
}

export const BrainDumpModal: React.FC<BrainDumpModalProps> = ({
  isOpen,
  onClose,
  folders,
  onImportExtractedNotes,
}) => {
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewNotes, setPreviewNotes] = useState<Array<{ title: string; content: string; folderId: string | null; tags: string[]; actionItems?: string[] }> | null>(null);

  if (!isOpen) return null;

  const handleAnalyzeAndSplit = async () => {
    if (!rawText.trim()) return;
    setIsProcessing(true);
    try {
      const res = await splitBrainDump(rawText, folders);
      setPreviewNotes(res.thoughts || []);
    } catch (e) {
      console.error('Failed to split thoughts', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (previewNotes && previewNotes.length > 0) {
      onImportExtractedNotes(previewNotes);
      setPreviewNotes(null);
      setRawText('');
      onClose();
    }
  };

  const getFolderName = (fId: string | null) => {
    if (!fId) return '📥 غير مصنف (صندوق الوارد)';
    const folder = folders.find((f) => f.id === fId);
    return folder ? `${folder.emoji} ${folder.name}` : '📥 غير مصنف';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">
                تفريغ وترتيب الأفكار الذكي (Brain Dump)
              </h3>
              <p className="text-xs text-stone-500">
                اكتب أو الصق خواطرك العشوائية دفعة واحدة، وسيقوم التطبيق بفرز كل فكرة في ملفها المناسب
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!previewNotes ? (
            <div className="space-y-3">
              <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
                💡 <span className="font-semibold">مثال لما يمكنك كتابته:</span>
                <p className="mt-1 text-amber-800">
                  "أريد تجربة روتين سيروم فيتامين سي الصباحي، وشراء واقي شمس. أيضاً تجهيز تمارين ظهر 3 مرات أسبوعياً وشرب ماء دافئ صباحاً. وأحتاج دراسة تكلفة متجر المنتجات العضوية."
                </p>
              </div>

              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="اكتب كل أفكارك هنا كما تخطر في بالك..."
                rows={8}
                className="w-full text-sm text-stone-800 placeholder-stone-400 p-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white leading-relaxed resize-none"
                autoFocus
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-700">
                  تم استخراج وتصنيف ({previewNotes.length}) أفكار بنجاح:
                </span>
                <button
                  onClick={() => setPreviewNotes(null)}
                  className="text-xs text-stone-500 hover:text-stone-800 underline"
                >
                  تعديل النص الأصلي
                </button>
              </div>

              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {previewNotes.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-stone-900 text-xs truncate">
                        {item.title}
                      </h4>
                      <span className="text-[11px] font-medium text-stone-600 bg-white border border-stone-200 px-2 py-0.5 rounded-md shrink-0">
                        {getFolderName(item.folderId)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-2">
                      {item.content}
                    </p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
                        {item.tags.map((t) => (
                          <span key={t}>#{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            إلغاء
          </button>

          {!previewNotes ? (
            <button
              type="button"
              onClick={handleAnalyzeAndSplit}
              disabled={isProcessing || !rawText.trim()}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'جارٍ تحليل وترتيب الأفكار...' : 'فرز وترتيب الأفكار ذكياً'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmImport}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-lg transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>إضافة الأفكار إلى أماكنها المخصصة</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
