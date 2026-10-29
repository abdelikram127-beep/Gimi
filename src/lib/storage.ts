import { Folder, Note } from '../types';

export const DEFAULT_FOLDERS: Folder[] = [
  {
    id: 'folder-beauty',
    name: 'جمال وعناية',
    emoji: '💅',
    color: 'rose',
    description: 'روتين البشرة، العناية بالشعر، مستحضرات الجمال والنضارة',
    order: 1,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'folder-health',
    name: 'صحة ولياقة',
    emoji: '🌿',
    color: 'emerald',
    description: 'التغذية المتوازنة، التمارين، شرب الماء والعادات الصحية',
    order: 2,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'folder-work',
    name: 'عمل ومشاريع',
    emoji: '💼',
    color: 'amber',
    description: 'خطط الأعمال، مهام العمل، الأفكار الريادية والمشاريع',
    order: 3,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'folder-learning',
    name: 'تعلم وثقافة',
    emoji: '📚',
    color: 'sky',
    description: 'ملخصات الكتب، دورات تدريبية، مهارات جديدة واقتباسات',
    order: 4,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'folder-thoughts',
    name: 'خواطر وإبداع',
    emoji: '💡',
    color: 'indigo',
    description: 'ومضات تفكير، تأملات يومية، وإلهام إبداعي',
    order: 5,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export const DEFAULT_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'روتين العناية بالبشرة المسائي',
    content: '1. تنظيف مزدوج بالزيت ثم الغسول المائي.\n2. استخدام سيروم حمض الهيالورونيك على بشرة رطبة.\n3. كريم مرطب مغذي قبل النوم بنصف ساعة.\n4. استبدال غطاء الوسادة الحريري مرتين أسبوعياً.',
    folderId: 'folder-beauty',
    tags: ['عناية_بالبشرة', 'روتين_مسائي', 'نضارة'],
    color: 'rose',
    isPinned: true,
    isFavorite: true,
    actionItems: [
      { id: 'act-1', text: 'شراء غسول وجه لطيف خالٍ من العطور', done: true },
      { id: 'act-2', text: 'فحص تاريخ صلاحية واقي الشمس', done: false },
    ],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    deletedAt: null,
  },
  {
    id: 'note-2',
    title: 'خطة شرب 2.5 لتر ماء والحفاظ على النشاط',
    content: 'توزيع شرب الماء طوال اليوم:\n- كوبان بعد الاستيقاظ مباشرة مع ليمون.\n- زجاجة 1 لتر أثناء ساعات العمل صباحاً.\n- لتر متبقي بين العصر والمساء.\n- الامتناع عن السكريات المصنعة بعد الساعة السابعة مساءً.',
    folderId: 'folder-health',
    tags: ['صحة', 'ترطيب', 'نشاط_بدني'],
    color: 'emerald',
    isPinned: true,
    isFavorite: false,
    actionItems: [
      { id: 'act-3', text: 'إعداد زجاجة ماء مدرجة بالمواعيد', done: true },
      { id: 'act-4', text: 'المشي 30 دقيقة يومياً قبل الإفطار', done: false },
    ],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    deletedAt: null,
  },
  {
    id: 'note-3',
    title: 'فكرة متجر إلكتروني للمنتجات الطبيعية',
    content: 'دراسة جدوى سريعة:\n- التركيز على الزيوت العضوية والشموع المصنوعة يدوياً.\n- تصميم تغليف صديق للبيئة مع لمسة أنيقة.\n- بدء حساب إنستغرام وتيك توك لعرض خطوات التحضير.',
    folderId: 'folder-work',
    tags: ['مشروع', 'تجارة_إلكترونية', 'تسويق'],
    color: 'amber',
    isPinned: false,
    isFavorite: true,
    actionItems: [
      { id: 'act-5', text: 'البحث عن مورد موثوق للزيوت النقية', done: false },
      { id: 'act-6', text: 'تصميم نموذج أولي للشعار', done: false },
    ],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    deletedAt: null,
  },
  {
    id: 'note-4',
    title: 'ماسكات طبيعية لتقوية بصيلات الشعر',
    content: 'خلطة زيت إكليل الجبل وزيت الجوجوبا:\n- تدليك الفروة بحركات دائرية لمدة 5 دقائق.\n- ترك الزيت لمدة ساعتين قبل الاستحمام.\n- تكرار الوصفة مرتين في الأسبوع لنتائج ملحوظة.',
    folderId: 'folder-beauty',
    tags: ['شعر', 'عناية_طبيعية', 'زيوت'],
    color: 'rose',
    isPinned: false,
    isFavorite: false,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    deletedAt: null,
  },
  {
    id: 'note-5',
    title: 'وجبات خفيفة غنية بالبروتين للدوام',
    content: 'أفكار سريعة ومغذية:\n- زبادي يوناني مع حبات التوت وبذور الشيا.\n- حفنة لوز وجوز نيء مع تمرتين.\n- حمص مع شرائح الخيار والجزر.',
    folderId: 'folder-health',
    tags: ['تغذية_صحية', 'وجبات_سريعة', 'طاقة'],
    color: 'emerald',
    isPinned: false,
    isFavorite: true,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    deletedAt: null,
  },
  {
    id: 'note-6',
    title: 'فكرة سريعة: تجربة ماسك الأفوكادو والعسل',
    content: 'سمعت خبيرة تتحدث عن ماسك الأفوكادو المغذي للبشرة الجافة في فصل الشتاء. أحتاج تجربة هذه الفكرة الأسبوع القادم.',
    folderId: null, // In inbox / Uncategorized! User can test AI sort button!
    tags: ['خاطرة_سريعة'],
    color: 'stone',
    isPinned: false,
    isFavorite: false,
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    deletedAt: null,
  },
  {
    id: 'note-7',
    title: 'مسودة فكرة قديمة تم نقلها لسلة المهملات',
    content: 'هذه فكرة قديمة تم حذفها لتجربة سلة المهملات (Corbeille). يمكنك استعادتها لأي مجلد أو حذفها نهائياً.',
    folderId: 'folder-thoughts',
    tags: ['مسودة', 'سلة_المهملات'],
    color: 'stone',
    isPinned: false,
    isFavorite: false,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    deletedAt: new Date(Date.now() - 1 * 86400000).toISOString(), // Deleted in Trash
    originalFolderId: 'folder-thoughts',
  },
];

const STORAGE_KEYS = {
  FOLDERS: 'fikra_folders_v1',
  NOTES: 'fikra_notes_v1',
};

export function loadFolders(): Folder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FOLDERS);
    if (!raw) {
      saveFolders(DEFAULT_FOLDERS);
      return DEFAULT_FOLDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_FOLDERS;
  } catch (e) {
    console.error('Failed to load folders from storage', e);
    return DEFAULT_FOLDERS;
  }
}

export function saveFolders(folders: Folder[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  } catch (e) {
    console.error('Failed to save folders to storage', e);
  }
}

export function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!raw) {
      saveNotes(DEFAULT_NOTES);
      return DEFAULT_NOTES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_NOTES;
  } catch (e) {
    console.error('Failed to load notes from storage', e);
    return DEFAULT_NOTES;
  }
}

export function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes to storage', e);
  }
}

export function exportBackup(notes: Note[], folders: Folder[]) {
  const data = {
    app: 'Fikra Smart Thought Organizer',
    version: '1.0',
    exportDate: new Date().toISOString(),
    folders,
    notes,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fikra-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
