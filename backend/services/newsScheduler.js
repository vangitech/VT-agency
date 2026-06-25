import cron from 'node-cron';
import Setting from '../models/Setting.js';
import News from '../models/News.js';

const CATEGORIES = [
  { id: 'software', search: 'software OR IT' },
  { id: 'cybersecurity', search: 'cybersecurity OR security threat' },
  { id: 'fintech', search: 'fintech OR financial technology' },
  { id: 'business' },
  { id: 'technology' },
  { id: 'science' },
];

const PAGE_SIZE = 12;

async function fetchAndImport() {
  const setting = await Setting.findOne({ key: 'newsApiKey' });
  const apiKey = setting?.value;
  if (!apiKey) {
    console.log('[NewsScheduler] No NewsAPI key configured, skipping auto-fetch');
    return;
  }

  let totalImported = 0;
  let totalSkipped = 0;

  for (const cat of CATEGORIES) {
    try {
      const params = new URLSearchParams({ apiKey });
      if (cat.search) {
        params.set('q', cat.search);
      } else {
        params.set('category', cat.id);
        params.set('country', 'us');
      }
      params.set('pageSize', String(PAGE_SIZE));

      const endpoint = cat.search ? 'everything' : 'top-headlines';
      const response = await fetch(
        `https://newsapi.org/v2/${endpoint}?${params.toString()}`
      );

      if (!response.ok) {
        console.log(`[NewsScheduler] Failed to fetch ${cat.id}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const articles = data.articles || [];

      for (const article of articles) {
        if (!article.title) continue;

        const existing = await News.findOne({ title: article.title });
        if (existing) {
          totalSkipped++;
          continue;
        }

        await News.create({
          title: article.title,
          summary: article.description || 'No summary available',
          content: article.content || article.description || 'No content available',
          image: article.urlToImage || '',
          source: article.source?.name || 'NewsAPI',
          url: article.url || '',
          category: cat.id,
          isActive: true,
          publishedAt: new Date(),
        });
        totalImported++;
      }
    } catch (err) {
      console.log(`[NewsScheduler] Error fetching ${cat.id}:`, err.message);
    }
  }

  await Setting.findOneAndUpdate(
    { key: 'lastAutoFetch' },
    { key: 'lastAutoFetch', value: new Date().toISOString() },
    { upsert: true }
  );

  console.log(`[NewsScheduler] Done: ${totalImported} imported, ${totalSkipped} skipped`);
}

export { fetchAndImport };

export function startNewsScheduler() {
  cron.schedule('0 6 * * *', () => {
    console.log('[NewsScheduler] Running daily auto-fetch...');
    fetchAndImport().catch((err) =>
      console.error('[NewsScheduler] Error:', err)
    );
  });

  console.log('[NewsScheduler] Scheduled daily at 6:00 AM');

  fetchAndImport().catch((err) =>
    console.error('[NewsScheduler] Initial fetch error:', err)
  );
}
