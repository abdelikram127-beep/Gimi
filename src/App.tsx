import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { NoteCard } from './components/NoteCard';
import { NoteEditorModal } from './components/NoteEditorModal';
import { FolderModal } from './components/FolderModal';
import { BrainDumpModal } from './components/BrainDumpModal';
import { TrashView } from './components/TrashView';
import { QuickAddBar } from './components/QuickAddBar';
import { BatchActionsBar } from './components/BatchActionsBar';
import { 
  Folder, 
  Note, 
  SortOption, 
  ViewFilter, 
  ViewMode 
} from './types';
import { 
  loadFolders, 
  loadNotes, 
  saveFolders, 
  saveNotes, 
  exportBackup 
} from './lib/storage';
import { 
  batchSortThoughts, 
  categorizeThought 
} from './lib/ai';
import { Sparkles, Inbox, Plus, FolderPlus } from 'lucide-react';

export default function App() {
  const [folders, setFolders] = useState<Folder[]>(loadFolders);
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [currentFilter, setCurrentFilter] = useState<ViewFilter>({ type: 'all' });
  
  // Layout and View State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('updated-desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Selection State
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  
  // Modals
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  
  const [isBrainDumpOpen, setIsBrainDumpOpen] = useState(false);
  
  // Status & Notifications
  const [isAiSorting, setIsAiSorting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Persist folders and notes
  useEffect(() => {
    saveFolders(folders);
  }, [folders]);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Active (non-deleted) notes vs Trash
  const activeNotes = useMemo(() => notes.filter((n) => !n.deletedAt), [notes]);
  const trashNotes = useMemo(() => notes.filter((n) => n.deletedAt !== null), [notes]);
  const inboxNotes = useMemo(() => activeNotes.filter((n) => !n.folderId), [activeNotes]);

  // Filtered Notes according to current filter & search
  const displayedNotes = useMemo(() => {
    let result = activeNotes;

    if (currentFilter.type === 'inbox') {
      result = activeNotes.filter((n) => !n.folderId);
    } else if (currentFilter.type === 'favorites') {
      result = activeNotes.filter((n) => n.isFavorite);
    } else if (currentFilter.type === 'folder') {
      result = activeNotes.filter((n) => n.folderId === currentFilter.folderId);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    return [...result].sort((a, b) => {
      // Pinned always come first unless sorting by something special
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortOption === 'updated-desc') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortOption === 'created-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortOption === 'title-asc') {
        return a.title.localeCompare(b.title, 'ar');
      }
      return 0;
    });
  }, [activeNotes, currentFilter, searchQuery, sortOption]);

  // Folder Operations (Add, Edit, Delete, Reorder)
  const handleSaveFolder = (data: { name: string; emoji: string; color: string; description?: string }) => {
    if (editingFolder) {
      setFolders((prev) =>
        prev.map((f) =>
          f.id === editingFolder.id
            ? { ...f, ...data }
            : f
        )
      );
      setToastMessage(`تم تعديل الملف "${data.name}" بنجاح`);
    } else {
      const newFolder: Folder = {
        id: `folder-${Date.now()}`,
        name: data.name,
        emoji: data.emoji,
        color: data.color,
        description: data.description,
        order: folders.length + 1,
        createdAt: new Date().toISOString(),
      };
      setFolders((prev) => [...prev, newFolder]);
      setToastMessage(`تمت إضافة ملف "${data.name}" بنجاح`);
    }
    setEditingFolder(null);
  };

  const handleDeleteFolder = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return;

    // Check how many notes are inside
    const affectedNotes = notes.filter((n) => n.folderId === folderId);
    
    // Move notes in this folder to Inbox / Uncategorized rather than losing them
    setNotes((prev) =>
      prev.map((n) =>
        n.folderId === folderId ? { ...n, folderId: null, updatedAt: new Date().toISOString() } : n
      )
    );

    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    
    // If user was viewing that folder, return to All
    if (currentFilter.type === 'folder' && currentFilter.folderId === folderId) {
      setCurrentFilter({ type: 'all' });
    }

    setToastMessage(
      `تم حذف الملف "${folder.name}". تم نقل أفكاره (${affectedNotes.length}) إلى صندوق الوارد بأمان.`
    );
  };

  const handleReorderFolder = (folderId: string, direction: 'up' | 'down') => {
    const sorted = [...folders].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((f) => f.id === folderId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    // Swap orders
    const currentOrder = sorted[index].order;
    const targetOrder = sorted[targetIndex].order;

    sorted[index].order = targetOrder;
    sorted[targetIndex].order = currentOrder;

    setFolders([...sorted]);
  };

  // Note Operations (Add, Edit, Pin, Favorite, Move to Folder, Move to Corbeille)
  const handleSaveNote = (noteData: Partial<Note> & { id?: string }) => {
    const now = new Date().toISOString();
    if (noteData.id) {
      // Update
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteData.id
            ? { ...n, ...noteData, updatedAt: now }
            : n
        )
      );
      setToastMessage('تم تحديث الفكرة بنجاح');
    } else {
      // Create
      const newNote: Note = {
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: noteData.title || '',
        content: noteData.content || '',
        folderId: noteData.folderId !== undefined ? noteData.folderId : (currentFilter.type === 'folder' ? currentFilter.folderId : null),
        tags: noteData.tags || [],
        color: noteData.color || 'stone',
        isPinned: noteData.isPinned || false,
        isFavorite: noteData.isFavorite || false,
        actionItems: noteData.actionItems || [],
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };
      setNotes((prev) => [newNote, ...prev]);
      
      const targetFolder = folders.find((f) => f.id === newNote.folderId);
      const folderMsg = targetFolder ? `في ملف "${targetFolder.name}"` : 'في صندوق الوارد';
      setToastMessage(`تم حفظ الفكرة الجديدة ${folderMsg}`);
    }
  };

  // Quick Add with optional instant AI auto-sort
  const handleQuickAdd = async (text: string, autoCategorize: boolean) => {
    const now = new Date().toISOString();
    let assignedFolderId: string | null = currentFilter.type === 'folder' ? currentFilter.folderId : null;
    let suggestedTags: string[] = ['فكرة_سريعة'];

    if (autoCategorize) {
      setIsAiSorting(true);
      try {
        const catResult = await categorizeThought(text, text, folders);
        if (catResult.folderId) {
          assignedFolderId = catResult.folderId;
        }
        if (catResult.suggestedTags && catResult.suggestedTags.length > 0) {
          suggestedTags = catResult.suggestedTags;
        }
      } catch (e) {
        console.error('Quick add auto-categorize failed', e);
      } finally {
        setIsAiSorting(false);
      }
    }

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: text.length > 40 ? text.slice(0, 40) + '...' : text,
      content: text,
      folderId: assignedFolderId,
      tags: suggestedTags,
      isPinned: false,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    setNotes((prev) => [newNote, ...prev]);
    const targetFolder = folders.find((f) => f.id === assignedFolderId);
    if (targetFolder) {
      setToastMessage(`✨ تم الترتيب الذكي! أضيفت الفكرة إلى "${targetFolder.emoji} ${targetFolder.name}"`);
    } else {
      setToastMessage('تمت إضافة الفكرة إلى صندوق الوارد');
    }
  };

  const handleTogglePin = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() } : n
      )
    );
  };

  const handleToggleFavorite = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId ? { ...n, isFavorite: !n.isFavorite, updatedAt: new Date().toISOString() } : n
      )
    );
  };

  const handleToggleActionItem = (noteId: string, actionId: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId || !n.actionItems) return n;
        return {
          ...n,
          actionItems: n.actionItems.map((item) =>
            item.id === actionId ? { ...item, done: !item.done } : item
          ),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const handleMoveToFolder = (noteId: string, targetFolderId: string | null) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId ? { ...n, folderId: targetFolderId, updatedAt: new Date().toISOString() } : n
      )
    );
    const targetFolder = folders.find((f) => f.id === targetFolderId);
    setToastMessage(
      targetFolder
        ? `تم نقل الفكرة إلى ملف "${targetFolder.name}"`
        : 'تم نقل الفكرة إلى صندوق الوارد (غير مصنف)'
    );
  };

  // Corbeille / Trash operations
  const handleDeleteToTrash = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId) return n;
        return {
          ...n,
          deletedAt: new Date().toISOString(),
          originalFolderId: n.folderId,
        };
      })
    );
    // remove from selection if selected
    setSelectedNoteIds((prev) => prev.filter((id) => id !== noteId));
    setToastMessage('تم نقل الفكرة إلى سلة المهملات (Corbeille). يمكنك استعادتها في أي وقت.');
  };

  const handleRestoreNote = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId) return n;
        return {
          ...n,
          deletedAt: null,
          folderId: n.originalFolderId !== undefined ? n.originalFolderId : n.folderId,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    setToastMessage('تمت استعادة الفكرة بنجاح');
  };

  const handleRestoreAllTrash = () => {
    setNotes((prev) =>
      prev.map((n) => {
        if (!n.deletedAt) return n;
        return {
          ...n,
          deletedAt: null,
          folderId: n.originalFolderId !== undefined ? n.originalFolderId : n.folderId,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    setToastMessage('تمت استعادة جميع الأفكار من سلة المهملات');
  };

  const handlePermanentDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    setToastMessage('تم حذف الفكرة نهائياً');
  };

  const handleEmptyTrash = () => {
    setNotes((prev) => prev.filter((n) => n.deletedAt === null));
    setToastMessage('تم إفراغ سلة المهملات بالكامل');
  };

  // Single Note AI Smart Categorize
  const handleSmartCategorizeNote = async (note: Note) => {
    setIsAiSorting(true);
    try {
      const res = await categorizeThought(note.title, note.content, folders);
      if (res.folderId) {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === note.id
              ? {
                  ...n,
                  folderId: res.folderId,
                  tags: Array.from(new Set([...n.tags, ...res.suggestedTags])),
                  updatedAt: new Date().toISOString(),
                }
              : n
          )
        );
        const folder = folders.find((f) => f.id === res.folderId);
        setToastMessage(`✨ تم الترتيب الذكي! نُقلت الفكرة إلى ملف "${folder?.name || ''}"`);
      }
    } catch (e) {
      setToastMessage('تعذر الفرز الآلي حالياً');
    } finally {
      setIsAiSorting(false);
    }
  };

  // Bulk AI Sort Inbox
  const handleTriggerSmartSortInbox = async () => {
    const unorganized = activeNotes.filter((n) => !n.folderId);
    if (unorganized.length === 0) {
      setToastMessage('كل الأفكار مرتبة في ملفاتها بالفعل! لا توجد أفكار غير مصنفة.');
      return;
    }

    setIsAiSorting(true);
    setToastMessage(`جارٍ ترتيب وتصنيف ${unorganized.length} فكرة تلقائياً بواسطة الذكاء الاصطناعي...`);

    try {
      const { results } = await batchSortThoughts(unorganized, folders);
      
      let organizedCount = 0;
      setNotes((prev) =>
        prev.map((n) => {
          const match = results.find((r) => r.id === n.id);
          if (match && match.folderId) {
            organizedCount++;
            return {
              ...n,
              folderId: match.folderId,
              tags: Array.from(new Set([...n.tags, ...(match.tags || [])])),
              updatedAt: new Date().toISOString(),
            };
          }
          return n;
        })
      );

      setToastMessage(`🎉 تم بنجاح ترتيب وتوزيع ${organizedCount} فكرة في أماكنها المخصصة (مثل: جمال، صحة، عمل)!`);
    } catch (e) {
      setToastMessage('حدث خطأ أثناء الترتيب الآلي');
    } finally {
      setIsAiSorting(false);
    }
  };

  // Multi-select & Batch Actions
  const handleSelectNote = (noteId: string, isMulti: boolean) => {
    setSelectedNoteIds((prev) => {
      if (prev.includes(noteId)) {
        return prev.filter((id) => id !== noteId);
      } else {
        return isMulti ? [...prev, noteId] : [noteId];
      }
    });
  };

  const handleBatchMoveToFolder = (targetFolderId: string | null) => {
    setNotes((prev) =>
      prev.map((n) =>
        selectedNoteIds.includes(n.id)
          ? { ...n, folderId: targetFolderId, updatedAt: new Date().toISOString() }
          : n
      )
    );
    const folder = folders.find((f) => f.id === targetFolderId);
    setToastMessage(`تم نقل ${selectedNoteIds.length} أفكار إلى "${folder?.name || 'صندوق الوارد'}"`);
    setSelectedNoteIds([]);
  };

  const handleBatchDeleteToTrash = () => {
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) =>
        selectedNoteIds.includes(n.id)
          ? { ...n, deletedAt: now, originalFolderId: n.folderId }
          : n
      )
    );
    setToastMessage(`تم نقل ${selectedNoteIds.length} أفكار إلى سلة المهملات (Corbeille)`);
    setSelectedNoteIds([]);
  };

  // Brain Dump Import
  const handleImportExtractedNotes = (
    extracted: Array<{ title: string; content: string; folderId: string | null; tags: string[]; actionItems?: string[] }>
  ) => {
    const now = new Date().toISOString();
    const newItems: Note[] = extracted.map((item, idx) => ({
      id: `dump-note-${Date.now()}-${idx}`,
      title: item.title,
      content: item.content,
      folderId: item.folderId,
      tags: item.tags || [],
      color: 'stone',
      isPinned: false,
      isFavorite: false,
      actionItems: (item.actionItems || []).map((t, i) => ({
        id: `dump-act-${Date.now()}-${idx}-${i}`,
        text: t,
        done: false,
      })),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    }));

    setNotes((prev) => [...newItems, ...prev]);
    setToastMessage(`تم تفريغ وترتيب ${newItems.length} أفكار في ملفاتها المخصصة بنجاح!`);
  };

  // Backup & Restore
  const handleExportBackup = () => {
    exportBackup(notes, folders);
    setToastMessage('تم تحميل نسخة احتياطية من جميع أفكارك وملفاتك بنجاح');
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.folders && Array.isArray(json.folders)) {
          setFolders(json.folders);
        }
        if (json.notes && Array.isArray(json.notes)) {
          setNotes(json.notes);
        }
        setToastMessage('تم استيراد النسخة الاحتياطية بنجاح!');
      } catch (err) {
        setToastMessage('ملف النسخة الاحتياطية غير صالح');
      }
    };
    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-row">
      {/* Sidebar Navigation */}
      <Sidebar
        folders={folders}
        notes={notes}
        currentFilter={currentFilter}
        onSelectFilter={(f) => {
          setCurrentFilter(f);
          setSelectedNoteIds([]);
        }}
        onOpenNewFolderModal={(folderToEdit) => {
          setEditingFolder(folderToEdit || null);
          setIsFolderModalOpen(true);
        }}
        onDeleteFolder={handleDeleteFolder}
        onReorderFolder={handleReorderFolder}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Header
          currentFilter={currentFilter}
          folders={folders}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortOption={sortOption}
          onSortOptionChange={setSortOption}
          onOpenNewNote={() => {
            setEditingNote(null);
            setIsNoteEditorOpen(true);
          }}
          onOpenBrainDump={() => setIsBrainDumpOpen(true)}
          onTriggerSmartSortInbox={handleTriggerSmartSortInbox}
          inboxNotesCount={inboxNotes.length}
          isAiSorting={isAiSorting}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Quick Add Bar (only visible when not in trash) */}
          {currentFilter.type !== 'trash' && (
            <QuickAddBar
              currentFolderId={currentFilter.type === 'folder' ? currentFilter.folderId : null}
              folders={folders}
              onQuickAdd={handleQuickAdd}
              isCategorizing={isAiSorting}
            />
          )}

          {/* Render Trash View or Notes Grid */}
          {currentFilter.type === 'trash' ? (
            <TrashView
              trashNotes={trashNotes}
              folders={folders}
              onRestoreNote={handleRestoreNote}
              onRestoreAll={handleRestoreAllTrash}
              onPermanentDeleteNote={handlePermanentDeleteNote}
              onEmptyTrash={handleEmptyTrash}
            />
          ) : displayedNotes.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20 bg-white border border-stone-200/80 rounded-2xl p-8 space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl">
                {currentFilter.type === 'inbox' ? '📥' : '💡'}
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">
                  {searchQuery ? 'لا توجد أفكار مطابقة لبحثك' : 'لا توجد أفكار هنا حتى الآن'}
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  {searchQuery
                    ? 'جرب البحث بكلمات أخرى أو مسح نص البحث'
                    : 'ابدأ بتدوين أول فكرة، أو استخدم ميزة تفريغ الأفكار لترتيب خواطرك تلقائياً.'}
                </p>
              </div>

              {!searchQuery && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setEditingNote(null);
                      setIsNoteEditorOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>كتابة فكرة</span>
                  </button>
                  <button
                    onClick={() => setIsBrainDumpOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors"
                  >
                    <span>تفريغ خواطر عشوائية</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Notes Grid or List */
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'space-y-2.5'
              }
            >
              {displayedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  folders={folders}
                  viewMode={viewMode}
                  isSelected={selectedNoteIds.includes(note.id)}
                  onSelect={handleSelectNote}
                  onEdit={(n) => {
                    setEditingNote(n);
                    setIsNoteEditorOpen(true);
                  }}
                  onTogglePin={handleTogglePin}
                  onToggleFavorite={handleToggleFavorite}
                  onDeleteToTrash={handleDeleteToTrash}
                  onMoveToFolder={handleMoveToFolder}
                  onToggleActionItem={handleToggleActionItem}
                  onSmartCategorizeNote={handleSmartCategorizeNote}
                  isCategorizing={isAiSorting}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Floating Batch Actions Bar */}
      <BatchActionsBar
        selectedCount={selectedNoteIds.length}
        folders={folders}
        onClearSelection={() => setSelectedNoteIds([])}
        onBatchMoveToFolder={handleBatchMoveToFolder}
        onBatchDeleteToTrash={handleBatchDeleteToTrash}
      />

      {/* Note Editor Modal */}
      <NoteEditorModal
        isOpen={isNoteEditorOpen}
        onClose={() => {
          setIsNoteEditorOpen(false);
          setEditingNote(null);
        }}
        noteToEdit={editingNote}
        folders={folders}
        currentFolderId={currentFilter.type === 'folder' ? currentFilter.folderId : null}
        onSave={handleSaveNote}
        onDeleteToTrash={handleDeleteToTrash}
      />

      {/* Folder Create/Edit Modal */}
      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => {
          setIsFolderModalOpen(false);
          setEditingFolder(null);
        }}
        folderToEdit={editingFolder}
        onSave={handleSaveFolder}
      />

      {/* Brain Dump Modal */}
      <BrainDumpModal
        isOpen={isBrainDumpOpen}
        onClose={() => setIsBrainDumpOpen(false)}
        folders={folders}
        onImportExtractedNotes={handleImportExtractedNotes}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-stone-800 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
