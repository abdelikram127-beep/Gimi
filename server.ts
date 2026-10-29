import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get GoogleGenAI client
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Timeout wrapper for Gemini API calls (2.5 seconds max)
async function callGeminiWithTimeout<T>(promise: Promise<T>, timeoutMs = 2500): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('AI request timeout')), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

// Intelligent Arabic semantic & keyword classifier
function smartArabicCategorize(
  title: string,
  content: string,
  folders: { id: string; name: string; description?: string }[]
): { folderId: string | null; tags: string[]; explanation: string } {
  const text = `${title} ${content}`.toLowerCase();

  const domainKeywords: Record<string, { triggers: string[]; tags: string[]; desc: string }> = {
    beauty: {
      triggers: [
        'جمال', 'بشرة', 'شعر', 'مكياج', 'عناية', 'ترطيب', 'واقي', 'ماسك', 
        'نضارة', 'روتين', 'كريم', 'عطور', 'جماليه', 'أظافر', 'سيروم', 'تونر',
        'تقشير', 'غسول', 'شفاه', 'تسريحة', 'صبغة', 'خلايا', 'هيالورونيك', 'كولاجين',
        'skincare', 'hair', 'beauty', 'glow'
      ],
      tags: ['عناية_بالجمال', 'روتين_يومي', 'نضارة'],
      desc: 'مناسب لملف الجمال والعناية الشخصية'
    },
    health: {
      triggers: [
        'صحة', 'رياضة', 'تغذية', 'تمارين', 'جيم', 'فيتامين', 'دايت', 'حمية', 
        'ماء', 'نوم', 'طبيب', 'علاج', 'أدوية', 'ضغط', 'سكر', 'طاقة', 'سعرات', 
        'وزن', 'مشي', 'ركض', 'كارديو', 'حديد', 'عضلات', 'مكملات', 'فطور', 'بروتين',
        'ألياف', 'استرخاء', 'تنفس', 'يوغا', 'نظام_غذائي', 'health', 'fitness'
      ],
      tags: ['صحة_ولياقة', 'عادات_صحية', 'نشاط'],
      desc: 'مناسب لملف الصحة واللياقة والتغذية'
    },
    work: {
      triggers: [
        'عمل', 'مشروع', 'مهمة', 'وظيفة', 'اجتماع', 'تقرير', 'عميل', 'فكرة عمل', 
        'تسويق', 'مبيعات', 'خطة', 'شركة', 'استثمار', 'ميزانية', 'أرباح', 'متجر', 
        'شعار', 'ريادة', 'إدارة', 'فريق', 'بريد', 'عرض', 'work', 'project', 'business'
      ],
      tags: ['مشاريع_وعمل', 'ريادة_أعمال', 'تخطيط'],
      desc: 'مناسب لملف العمل والمشاريع والمهام'
    },
    learning: {
      triggers: [
        'تعلم', 'كتاب', 'قراءة', 'دورة', 'كورس', 'لغة', 'مهارة', 'بحث', 'جامعة', 
        'دراسة', 'بودكاست', 'ملخص', 'تدريب', 'انجليزي', 'معرفة', 'اقتباس', 'تطوير',
        'learn', 'book', 'course', 'study'
      ],
      tags: ['تطوير_ذاتي', 'كتب_وقراءة', 'مهارات'],
      desc: 'مناسب لملف التعلم وتطوير المهارات'
    },
    creativity: {
      triggers: [
        'إبداع', 'خاطرة', 'شعر', 'رسم', 'تصميم', 'إلهام', 'كتابة', 'فكرة جديدة', 
        'موسيقى', 'فن', 'قصة', 'مقال', 'ألوان', 'تصوير', 'خيال', 'سيناريو'
      ],
      tags: ['إلهام_وإبداع', 'خواطر', 'أفكار_جديدة'],
      desc: 'مناسب لملف الخواطر والإلهام الإبداعي'
    },
    personal: {
      triggers: [
        'شخصي', 'يوميات', 'مشتريات', 'تسوق', 'سفر', 'عائلة', 'أصدقاء', 'مشاعر', 
        'تأمل', 'امتنان', 'أهداف', 'منزل', 'تنظيف', 'شراء', 'سوبرماركت', 'عيد'
      ],
      tags: ['يوميات_شخصية', 'تنظيم'],
      desc: 'مناسب للملفات الشخصية واليوميات'
    }
  };

  let bestFolderId: string | null = null;
  let highestScore = 0;
  let detectedTags: string[] = [];
  let explanation = 'تم الترتيب بناءً على الكلمات المفتاحية وسياق الفكرة';

  for (const folder of folders) {
    let score = 0;
    const folderNameLower = folder.name.toLowerCase();
    const folderDescLower = (folder.description || '').toLowerCase();

    // 1. Direct name occurrence
    if (text.includes(folderNameLower)) {
      score += 6;
    }

    // 2. Check each domain against folder and text
    for (const [domainKey, config] of Object.entries(domainKeywords)) {
      const folderMatchesDomain =
        folderNameLower.includes(domainKey) ||
        config.triggers.some(trig => folderNameLower.includes(trig) || folderDescLower.includes(trig));

      if (folderMatchesDomain) {
        // Count how many triggers appear in text
        for (const trig of config.triggers) {
          if (text.includes(trig)) {
            score += 3;
          }
        }

        if (score > highestScore) {
          detectedTags = config.tags;
          explanation = config.desc;
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestFolderId = folder.id;
    }
  }

  // Fallback tags if none detected
  if (detectedTags.length === 0) {
    if (text.includes('جمال') || text.includes('بشرة')) detectedTags = ['جمال_وعناية'];
    else if (text.includes('صحة') || text.includes('ماء')) detectedTags = ['صحة_وعافية'];
    else detectedTags = ['فكرة_جديدة', 'تنظيم'];
  }

  return {
    folderId: bestFolderId || (folders.length > 0 ? folders[0].id : null),
    tags: detectedTags,
    explanation,
  };
}

// 1. Categorize a single thought
app.post('/api/ai/categorize', async (req, res) => {
  const { title, content, folders } = req.body;
  if (!title && !content) {
    return res.status(400).json({ error: 'Title or content required' });
  }

  const fallback = smartArabicCategorize(title || '', content || '', folders || []);

  const ai = getGenAIClient();
  if (!ai) {
    return res.json({
      folderId: fallback.folderId,
      suggestedTags: fallback.tags,
      explanation: fallback.explanation,
      summary: (content || title || '').slice(0, 100),
    });
  }

  try {
    const foldersList = (folders || []).map((f: any) => `- ID: "${f.id}", Name: "${f.name}", Desc: "${f.description || ''}"`).join('\n');
    const prompt = `أنت مساعد ذكي لتنظيم الأفكار والملاحظات.
لدينا الفكرة التالية:
العنوان: ${title || 'بدون عنوان'}
المحتوى: ${content || ''}

وقائمة المجلدات/الملفات المتاحة للمستخدم هي:
${foldersList}

المطلوب:
1. اختر أفضل مجلد (folderId) يناسب هذه الفكرة من القائمة.
2. اقترح 2 إلى 4 وسوم (tags) باللغة العربية ملائمة جداً.
3. اكتب ملخصاً مركزاً للفكرة في جملة واحدة (summary).
4. اكتب سبباً وجيزاً ومقنعاً لاختيار هذا المجلد (explanation).

أجب فقط بصيغة JSON نظيفة:
{
  "folderId": "id_من_القائمة",
  "suggestedTags": ["وسم1", "وسم2"],
  "summary": "ملخص الفكرة",
  "explanation": "شرح سبب التصنيف"
}`;

    const response = await callGeminiWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      }),
      2500
    );

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      folderId: parsed.folderId || fallback.folderId,
      suggestedTags: parsed.suggestedTags || fallback.tags,
      summary: parsed.summary || (content || title || '').slice(0, 100),
      explanation: parsed.explanation || fallback.explanation,
    });
  } catch (error) {
    return res.json({
      folderId: fallback.folderId,
      suggestedTags: fallback.tags,
      explanation: fallback.explanation,
      summary: (content || title || '').slice(0, 100),
    });
  }
});

// 2. Batch sort multiple thoughts
app.post('/api/ai/batch-sort', async (req, res) => {
  const { thoughts, folders } = req.body;
  if (!Array.isArray(thoughts) || thoughts.length === 0) {
    return res.status(400).json({ error: 'Thoughts array required' });
  }

  const fallbackResults = thoughts.map((t: any) => {
    const cat = smartArabicCategorize(t.title || '', t.content || '', folders || []);
    return {
      id: t.id,
      folderId: cat.folderId,
      tags: cat.tags,
      explanation: cat.explanation,
    };
  });

  const ai = getGenAIClient();
  if (!ai) {
    return res.json({ results: fallbackResults });
  }

  try {
    const foldersList = (folders || []).map((f: any) => `- ID: "${f.id}", Name: "${f.name}"`).join('\n');
    const thoughtsList = thoughts.map((t: any) => `ID: "${t.id}" | العنوان: "${t.title || ''}" | المحتوى: "${(t.content || '').slice(0, 120)}"`).join('\n');

    const prompt = `قم بتصنيف الأفكار التالية في أنسب مجلد من قائمة المجلدات المتاحة:

المجلدات:
${foldersList}

الأفكار:
${thoughtsList}

أجب بصيغة JSON:
{
  "results": [
    {
      "id": "معرف_الفكرة",
      "folderId": "معرف_المجلد",
      "tags": ["وسم1", "وسم2"],
      "explanation": "سبب وجيز"
    }
  ]
}`;

    const response = await callGeminiWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      }),
      2500
    );

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed.results ? parsed : { results: fallbackResults });
  } catch (error) {
    return res.json({ results: fallbackResults });
  }
});

// 3. Brain Dump Splitter: user enters raw multiple thoughts in one text
app.post('/api/ai/split-dump', async (req, res) => {
  const { rawText, folders } = req.body;
  if (!rawText || !rawText.trim()) {
    return res.status(400).json({ error: 'Raw text is required' });
  }

  // Fallback splitting logic
  const lines = rawText.split(/\n{2,}|\n(?=[•\-\*]|\d+[\.\)])|[؛،\.]\s*(?=[أاإإو])/)
    .map((l: string) => l.trim())
    .filter((l: string) => l.length > 5);

  const fallbackItems = lines.map((line: string, i: number) => {
    const parts = line.split('\n');
    const title = parts[0].replace(/^[•\-\*\d\.\)\s]+/, '').slice(0, 60);
    const content = parts.slice(1).join('\n') || parts[0];
    const cat = smartArabicCategorize(title, content, folders || []);
    return {
      title: title || `فكرة رقم ${i + 1}`,
      content: content,
      folderId: cat.folderId,
      tags: cat.tags,
      actionItems: ['البدء بالخطوة الأولى'],
    };
  });

  const ai = getGenAIClient();
  if (!ai) {
    return res.json({ thoughts: fallbackItems.length > 0 ? fallbackItems : [{ title: rawText.slice(0, 40), content: rawText, folderId: folders?.[0]?.id || null, tags: ['فكرة'] }] });
  }

  try {
    const foldersList = (folders || []).map((f: any) => `- ID: "${f.id}", Name: "${f.name}"`).join('\n');
    const prompt = `المستخدم كتب نصاً يحتوي على عدة أفكار أو خواطر عفوية:
"""
${rawText}
"""

المجلدات:
${foldersList}

المطلوب:
فكك هذا النص واستخرج كل فكرة كعنصر منفصل:
- title: عنوان بليغ
- content: تفاصيل منظمة
- folderId: المعرف ID للمجلد الأنسب من المجلدات المتاحة
- tags: قائمة وسوم ذكية
- actionItems: خطوات عمل قابلة للتنفيذ

أجب بصيغة JSON:
{
  "thoughts": [
    {
      "title": "عنوان الفكرة",
      "content": "محتوى منظم",
      "folderId": "id_المجلد",
      "tags": ["وسم1", "وسم2"],
      "actionItems": ["خطوة 1"]
    }
  ]
}`;

    const response = await callGeminiWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      }),
      2500
    );

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed.thoughts ? parsed : { thoughts: fallbackItems });
  } catch (error) {
    return res.json({ thoughts: fallbackItems });
  }
});

// 4. Expand idea
app.post('/api/ai/expand-idea', async (req, res) => {
  const { title, content } = req.body;
  const fallback = {
    enhancedContent: `${content}\n\n• خطوات تنفيذ مقترحة:\n- تحديد الهدف والنتيجة المرجوة بدقة\n- حصر المستلزمات أو المراجع المطلوبة\n- البدء بالخطوة الأولى ومتابعة النتائج`,
    actionItems: ['تحديد الخطوة الأولى', 'تحديد موعد للتنفيذ'],
  };

  const ai = getGenAIClient();
  if (!ai) {
    return res.json(fallback);
  }

  try {
    const prompt = `لدينا فكرة بعنوان: "${title || ''}"
المحتوى الحالي: "${content || ''}"

المطلوب:
1. أعد صياغة الفكرة وتوسيعها بشكل منظم وسلس ومفيد باللغة العربية.
2. استخرج 3 خطوات عمل تطبيقية (Action Items).

أجب بصيغة JSON:
{
  "enhancedContent": "المحتوى المطور",
  "actionItems": ["خطوة 1", "خطوة 2", "خطوة 3"]
}`;

    const response = await callGeminiWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      }),
      2500
    );

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed.enhancedContent ? parsed : fallback);
  } catch (error) {
    return res.json(fallback);
  }
});

// Dev vs Prod Vite handling
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fikra Thought Organizer running on port ${PORT}`);
  });
}

startServer();
