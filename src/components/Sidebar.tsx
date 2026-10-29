import React, { useState } from 'react';
import { 
  FolderPlus, 
  Trash2, 
  Star, 
  Inbox, 
  Layers, 
  MoreVertical, 
  Edit3, 
  ChevronUp, 
  ChevronDown, 
  Download, 
  Upload,
  Pin,
  Sparkles,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { Folder, Note, ViewFilter } from '../types';

interface SidebarProps {
  folders: Folder[];
  notes: Note[];
  currentFilter: ViewFilter;
  onSelectFilter: (filter: ViewFilter) => void;
  onOpenNewFolderModal: (folderToEdit?: Folder) => void;
  onDeleteFolder: (folderId: string) => void;
  onReorderFolder: (folderId: string, direction: 'up' | 'down') => void;
  onExportBackup: () => void;
  onImportBackup: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  folders,
  notes,
  currentFilter,
  onSelectFilter,
  onOpenNewFolderModal,
  onDeleteFolder,
  onReorderFolder,
  onExportBackup,
  onImportBackup,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [activeFolderMenuId, setActiveFolderMenuId] = useState<string | null>(null);

  // Active notes (not deleted)
  const activeNotes = notes.filter((n) => !n.deletedAt);
  const trashNotesCount = notes.filter((n) => n.deletedAt !== null).length;
  const inboxNotesCount = activeNotes.filter((n) => !n.folderId).length;
  const favoritesCount = activeNotes.filter((n) => n.isFavorite).length;

  const getFolderNotesCount = (folderId: string) => {
    return activeNotes.filter((n) => n.folderId === folderId).length;
  };

  const isCurrent = (filter: ViewFilter) => {
    if (filter.type === 'all' && currentFilter.type === 'all') return true;
    if (filter.type === 'inbox' && currentFilter.type === 'inbox') return true;
    if (filter.type === 'favorites' && currentFilter.type === 'favorites') return true;
    if (filter.type === 'trash' && currentFilter.type === 'trash') return true;
    if (filter.type === 'folder' && currentFilter.type === 'folder') {
      return filter.folderId === currentFilter.folderId;
    }
    return false;
  };

  const sortedFolders = [...folders].sort((a, b) => a.order - b.order);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-stone-900/40 z-30 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 right-0 z-40 w-72 bg-white border-l border-stone-200/80 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              ف
            </div>
            <div>
              <h1 className="font-bold text-stone-900 text-lg leading-tight">فِكرة</h1>
              <p className="text-xs text-stone-500">منظّم الأفكار والملفات</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
          >
            ✕
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Views */}
          <div className="space-y-1">
            <button
              onClick={() => {
                onSelectFilter({ type: 'all' });
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isCurrent({ type: 'all' })
                  ? 'bg-amber-50 text-amber-900'
                  : 'text-stone-700 hover:bg-stone-100/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-stone-500" />
                <span>كل الأفكار</span>
              </div>
              <span className="text-xs text-stone-400 font-mono">{activeNotes.length}</span>
            </button>

            <button
              onClick={() => {
                onSelectFilter({ type: 'inbox' });
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isCurrent({ type: 'inbox' })
                  ? 'bg-amber-50 text-amber-900'
                  : 'text-stone-700 hover:bg-stone-100/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4 text-amber-600" />
                <span>صندوق الوارد (غير مصنف)</span>
              </div>
              {inboxNotesCount > 0 && (
                <span className="text-xs bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full">
                  {inboxNotesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onSelectFilter({ type: 'favorites' });
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isCurrent({ type: 'favorites' })
                  ? 'bg-amber-50 text-amber-900'
                  : 'text-stone-700 hover:bg-stone-100/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>المفضلة</span>
              </div>
              <span className="text-xs text-stone-400 font-mono">{favoritesCount}</span>
            </button>
          </div>

          {/* Folders Section */}
          <div>
            <div className="flex items-center justify-between px-3 pb-2 text-xs font-semibold text-stone-400 tracking-wider">
              <span>الملفات والتصنيفات ({folders.length})</span>
              <button
                onClick={() => onOpenNewFolderModal()}
                title="إضافة ملف جديد"
                className="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium px-1.5 py-0.5 rounded hover:bg-amber-50"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>إضافة</span>
              </button>
            </div>

            <div className="space-y-1">
              {sortedFolders.map((folder, index) => {
                const count = getFolderNotesCount(folder.id);
                const isSelected = isCurrent({ type: 'folder', folderId: folder.id });
                const isMenuOpen = activeFolderMenuId === folder.id;

                return (
                  <div key={folder.id} className="relative group">
                    <button
                      onClick={() => {
                        onSelectFilter({ type: 'folder', folderId: folder.id });
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-amber-50 text-amber-950 font-semibold'
                          : 'text-stone-700 hover:bg-stone-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-base select-none">{folder.emoji || '📁'}</span>
                        <span className="truncate">{folder.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-stone-400 font-mono">{count}</span>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveFolderMenuId(isMenuOpen ? null : folder.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-1 text-stone-400 hover:text-stone-700 rounded transition-opacity"
                          title="خيارات الملف"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </button>

                    {/* Folder options dropdown */}
                    {isMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setActiveFolderMenuId(null)}
                        />
                        <div className="absolute left-2 top-8 z-20 w-40 bg-white border border-stone-200 rounded-lg shadow-lg py-1 text-xs">
                          <button
                            onClick={() => {
                              setActiveFolderMenuId(null);
                              onOpenNewFolderModal(folder);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-stone-700 hover:bg-stone-50"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                            <span>تعديل الملف</span>
                          </button>
                          {index > 0 && (
                            <button
                              onClick={() => {
                                onReorderFolder(folder.id, 'up');
                                setActiveFolderMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-stone-700 hover:bg-stone-50"
                            >
                              <ChevronUp className="w-3.5 h-3.5 text-stone-500" />
                              <span>تحريك للأعلى</span>
                            </button>
                          )}
                          {index < sortedFolders.length - 1 && (
                            <button
                              onClick={() => {
                                onReorderFolder(folder.id, 'down');
                                setActiveFolderMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-stone-700 hover:bg-stone-50"
                            >
                              <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                              <span>تحريك للأسفل</span>
                            </button>
                          )}
                          <div className="border-t border-stone-100 my-1" />
                          <button
                            onClick={() => {
                              setActiveFolderMenuId(null);
                              onDeleteFolder(folder.id);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف الملف</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Corbeille / Trash section (Critical User Requirement) */}
          <div className="pt-2 border-t border-stone-100">
            <button
              onClick={() => {
                onSelectFilter({ type: 'trash' });
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isCurrent({ type: 'trash' })
                  ? 'bg-rose-50 text-rose-900 font-semibold'
                  : 'text-stone-600 hover:bg-stone-100/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>سلة المهملات (Corbeille)</span>
              </div>
              {trashNotesCount > 0 ? (
                <span className="text-xs bg-rose-100 text-rose-700 font-semibold px-2 py-0.5 rounded-full">
                  {trashNotesCount}
                </span>
              ) : (
                <span className="text-xs text-stone-400 font-mono">0</span>
              )}
            </button>
          </div>
        </div>

        {/* Footer actions: Backup & Restore */}
        <div className="p-3 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between text-xs text-stone-500">
          <button
            onClick={onExportBackup}
            title="تصدير نسخة احتياطية من الأفكار"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-white hover:text-stone-800 transition-colors border border-transparent hover:border-stone-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>نسخة احتياطية</span>
          </button>

          <label
            title="استيراد نسخة احتياطية"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-white hover:text-stone-800 transition-colors border border-transparent hover:border-stone-200 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>استيراد</span>
            <input
              type="file"
              accept=".json"
              onChange={onImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </aside>
    </>
  );
};
