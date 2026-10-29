export interface ActionItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Folder {
  id: string;
  name: string;
  emoji: string;
  color: string; // Tailwind color key e.g. 'rose', 'emerald', 'amber', 'sky', 'indigo', 'stone'
  description?: string;
  order: number;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null; // null represents Uncategorized / Inbox
  tags: string[];
  color?: string; // custom accent color
  isPinned: boolean;
  isFavorite: boolean;
  actionItems?: ActionItem[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null; // null if active, ISO date if in Trash (corbeille)
  originalFolderId?: string | null; // preserved to restore to the same folder
}

export type ViewFilter = 
  | { type: 'all' }
  | { type: 'inbox' }
  | { type: 'folder'; folderId: string }
  | { type: 'favorites' }
  | { type: 'trash' };

export type SortOption = 'updated-desc' | 'updated-asc' | 'title-asc' | 'created-desc';
export type ViewMode = 'grid' | 'list';
