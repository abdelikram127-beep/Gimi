import React from 'react';
import { 
  Search, 
  Plus, 
  Menu, 
  LayoutGrid, 
  List, 
  Sparkles, 
  Brain, 
  ArrowUpDown, 
  X,
  Layers,
  Inbox,
  Star,
  Trash2
} from 'lucide-react';
import { Folder, SortOption, ViewFilter, ViewMode } from '../types';

interface HeaderProps {
  currentFilter: ViewFilter;
  folders: Folder[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  sortOption: SortOption;
  onSortOptionChange: (s: SortOption) => void;
  onOpenNewNote: () => void;
  onOpenBrainDump: () => void;
  onTriggerSmartSortInbox: () => void;
  inboxNotesCount: number;
  isAiSorting: boolean;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentFilter,
  folders,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortOption,
  onSortOptionChange,
  onOpenNewNote,
  onOpenBrainDump,
  onTriggerSmartSortInbox,
  inboxNotesCount,
  isAiSorting,
  onToggleMobileMenu,
}) => {
  const getViewTitle = () => {
    switch (currentFilter.type) {
      case 'all':
        return { title: 'كل الأفكار', icon: <Layers className="w-5 h-5 text-stone-600" /> };
      case 'inbox':
        return { title: 'صندوق الوارد (غير مصنف)', icon: <Inbox className="w-5 h-5 text-amber-600" /> };
      case 'favorites':
        return { title: 'المفضلة', icon: <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> };
      case 'trash':
        return { title: 'سلة المهملات (Corbeille)', icon: <Trash2 className="w-5 h-5 text-rose-500" /> };
      case 'folder': {
        const folder = folders.find((f) => f.id === currentFilter.folderId);
        return {
          title: folder ? folder.name : 'الملف',
          icon: <span className="text-xl">{folder?.emoji || '📁'}</span>,
          description: folder?.description,
        };
      }
    }
  };

  const viewInfo = getViewTitle();

  return (
    <header className="sticky top-0 z-20 bg-stone-50/95 backdrop-blur-md border-b border-stone-200/70 px-4 lg:px-8 py-3.5 space-y-3">
      {/* Top row: Title, Mobile menu, Action Buttons */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200/60"
            aria-label="القائمة"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5">
            {viewInfo.icon}
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-stone-900 leading-none">
                {viewInfo.title}
              </h2>
              {viewInfo.description && (
                <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                  {viewInfo.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Smart Organize button (especially highlighted when inbox has notes) */}
          {currentFilter.type !== 'trash' && (
            <button
              onClick={onTriggerSmartSortInbox}
              disabled={isAiSorting}
              title="ترتيب الأفكار غير المصنفة ووضعها في ملفاتها المناسبة تلقائياً"
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                inboxNotesCount > 0
                  ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 ring-1 ring-amber-300 shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              } disabled:opacity-50`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAiSorting ? 'animate-spin text-amber-600' : 'text-amber-500'}`} />
              <span className="hidden sm:inline">
                {isAiSorting ? 'جارٍ الترتيب...' : 'ترتيب ذكي'}
              </span>
              {inboxNotesCount > 0 && (
                <span className="bg-amber-200 text-amber-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {inboxNotesCount}
                </span>
              )}
            </button>
          )}

          {/* Brain dump modal trigger */}
          {currentFilter.type !== 'trash' && (
            <button
              onClick={onOpenBrainDump}
              title="تفريغ كل أفكارك دفعة واحدة وسيقوم التطبيق بترتيبها وتقسيمها"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white text-stone-700 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors shadow-2xs"
            >
              <Brain className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">تفريغ الأفكار</span>
            </button>
          )}

          {/* New Note Button */}
          {currentFilter.type !== 'trash' && (
            <button
              onClick={onOpenNewNote}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 rounded-lg transition-all shadow-xs active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>فكرة جديدة</span>
            </button>
          )}
        </div>
      </div>

      {/* Second row: Search, Sorting, and View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث في الأفكار، العناوين، أو الوسوم..."
            className="w-full pr-9 pl-8 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-stone-800 placeholder-stone-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute left-2.5 top-2.5 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort & View toggles */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs text-stone-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={sortOption}
              onChange={(e) => onSortOptionChange(e.target.value as SortOption)}
              className="bg-transparent text-stone-700 text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="updated-desc">الأحدث تعديلاً</option>
              <option value="created-desc">الأحدث إضافة</option>
              <option value="title-asc">أبجدياً (أ - ي)</option>
            </select>
          </div>

          {/* View Mode (Grid vs List) */}
          <div className="flex items-center bg-stone-200/70 p-0.5 rounded-lg">
            <button
              onClick={() => onViewModeChange('grid')}
              title="عرض شبكة البطاقات"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              title="عرض القائمة المنظمة"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
