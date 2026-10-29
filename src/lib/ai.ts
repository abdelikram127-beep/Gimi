import { Folder, Note } from '../types';

export interface CategorizeResult {
  folderId: string | null;
  suggestedTags: string[];
  explanation?: string;
  summary?: string;
  suggestedNewFolder?: {
    name: string;
    emoji: string;
    color: string;
  } | null;
}

export async function categorizeThought(
  title: string,
  content: string,
  folders: Folder[]
): Promise<CategorizeResult> {
  try {
    const res = await fetch('/api/ai/categorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, folders }),
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('AI categorization server error, applying local classifier', err);
    return localFallbackCategorize(title, content, folders);
  }
}

export async function batchSortThoughts(
  thoughts: Note[],
  folders: Folder[]
): Promise<{ results: { id: string; folderId: string; tags?: string[]; explanation?: string }[] }> {
  try {
    const res = await fetch('/api/ai/batch-sort', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thoughts, folders }),
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Batch sort server error, applying local fallback', err);
    return {
      results: thoughts.map((t) => {
        const cat = localFallbackCategorize(t.title, t.content, folders);
        return {
          id: t.id,
          folderId: cat.folderId || (folders[0] ? folders[0].id : ''),
          tags: cat.suggestedTags,
          explanation: 'تم الترتيب بناءً على الكلمات المفتاحية',
        };
      }),
    };
  }
}

export async function splitBrainDump(
  rawText: string,
  folders: Folder[]
): Promise<{ thoughts: Array<{ title: string; content: string; folderId: string | null; tags: string[]; actionItems?: string[] }> }> {
  try {
    const res = await fetch('/api/ai/split-dump', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText, folders }),
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Brain dump split failed, using basic local separation', err);
    const paragraphs = rawText.split(/\n{2,}|\n(?=[•\-\*]|\d+[\.\)])/).map(p => p.trim()).filter(p => p.length > 5);
    const thoughts = paragraphs.map((p, i) => {
      const parts = p.split('\n');
      const title = parts[0].replace(/^[•\-\*\d\.\)\s]+/, '').slice(0, 60);
      const content = parts.slice(1).join('\n') || parts[0];
      const match = localFallbackCategorize(title, content, folders);
      return {
        title: title || `فكرة رقم ${i + 1}`,
        content,
        folderId: match.folderId,
        tags: match.suggestedTags,
      };
    });
    return { thoughts };
  }
}

export async function expandThought(
  title: string,
  content: string
): Promise<{ enhancedContent: string; actionItems: string[] }> {
  try {
    const res = await fetch('/api/ai/expand-idea', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Expand thought failed', err);
    return {
      enhancedContent: `${content}\n\n• خطوات تنفيذية:\n- تحديد المتطلبات الأساسية\n- وضع خطة زمنية للإنجاز\n- المتابعة الدورية`,
      actionItems: ['تحديد الخطوة الأولى', 'تحديد موعد للتنفيذ'],
    };
  }
}

// Local smart classifier when network or API key is absent
function localFallbackCategorize(
  title: string,
  content: string,
  folders: Folder[]
): CategorizeResult {
  const text = `${title} ${content}`.toLowerCase();
  const keywords: Record<string, string[]> = {
    beauty: ['جمال', 'بشرة', 'شعر', 'مكياج', 'عناية', 'ترطيب', 'واقي', 'ماسك', 'نضارة', 'روتين', 'كريم', 'عطور', 'جماليه', 'أظافر'],
    health: ['صحة', 'رياضة', 'تغذية', 'تمارين', 'جيم', 'فيتامين', 'دايت', 'حمية', 'ماء', 'نوم', 'طبيب', 'علاج', 'أدوية', 'طاقة', 'وزن', 'مشي'],
    work: ['عمل', 'مشروع', 'مهمة', 'وظيفة', 'اجتماع', 'تقرير', 'عميل', 'تسويق', 'مبيعات', 'خطة', 'شركة', 'استثمار', 'ميزانية'],
    learning: ['تعلم', 'كتاب', 'قراءة', 'دورة', 'كورس', 'لغة', 'مهارة', 'بحث', 'دراسة', 'بودكاست', 'ملخص'],
    thoughts: ['إبداع', 'خاطرة', 'شعر', 'رسم', 'تصميم', 'إلهام', 'كتابة', 'فكرة جديدة', 'فن', 'قصة'],
  };

  let bestFolderId: string | null = null;
  let maxScore = 0;

  for (const f of folders) {
    let score = 0;
    const nameLower = f.name.toLowerCase();
    if (text.includes(nameLower)) score += 4;

    for (const [key, kws] of Object.entries(keywords)) {
      if (nameLower.includes(key) || kws.some(k => nameLower.includes(k))) {
        for (const kw of kws) {
          if (text.includes(kw)) score += 2;
        }
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestFolderId = f.id;
    }
  }

  const tags: string[] = [];
  if (text.includes('بشرة') || text.includes('جمال')) tags.push('عناية_بالجمال');
  if (text.includes('صحة') || text.includes('رياضة')) tags.push('صحة_ولياقة');
  if (text.includes('مشروع') || text.includes('عمل')) tags.push('أعمال');
  if (tags.length === 0) tags.push('فكرة_جديدة');

  return {
    folderId: bestFolderId || (folders[0] ? folders[0].id : null),
    suggestedTags: tags,
    explanation: maxScore > 0 ? 'تم تحديد التصنيف بناءً على دلالات النص' : 'تم وضعه في التصنيف الافتراضي',
    summary: (content || title).slice(0, 80),
  };
}
