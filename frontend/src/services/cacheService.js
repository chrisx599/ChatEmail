import { openDB } from 'idb';

// 数据库配置
const DB_NAME = 'ChatEmailCache';
const DB_VERSION = 1;
const EMAILS_STORE = 'emails';
const BATCH_SUMMARY_STORE = 'batchSummary';
const ANALYZED_EMAILS_STORE = 'analyzedEmails';
const CALENDAR_EVENTS_STORE = 'calendarEvents';

// 初始化数据库
let dbPromise;

const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // 创建邮件存储
        if (!db.objectStoreNames.contains(EMAILS_STORE)) {
          const emailStore = db.createObjectStore(EMAILS_STORE, {
            keyPath: 'id'
          });
          // 创建索引以便按时间排序
          emailStore.createIndex('timestamp', 'timestamp');
        }

        // 创建批量摘要存储
        if (!db.objectStoreNames.contains(BATCH_SUMMARY_STORE)) {
          db.createObjectStore(BATCH_SUMMARY_STORE, {
            keyPath: 'id'
          });
        }

        // 创建分析过的邮件存储
        if (!db.objectStoreNames.contains(ANALYZED_EMAILS_STORE)) {
          const analyzedStore = db.createObjectStore(ANALYZED_EMAILS_STORE, {
            keyPath: 'id'
          });
          analyzedStore.createIndex('timestamp', 'timestamp');
        }

        // 创建日历事件存储
        if (!db.objectStoreNames.contains(CALENDAR_EVENTS_STORE)) {
          db.createObjectStore(CALENDAR_EVENTS_STORE, {
            keyPath: 'id'
          });
        }
      },
    });
  }
  return dbPromise;
};

// 邮件缓存操作
export const emailCache = {
  // 保存邮件列表
  async saveEmails(emails) {
    try {
      const db = await initDB();
      const tx = db.transaction(EMAILS_STORE, 'readwrite');
      const store = tx.objectStore(EMAILS_STORE);
      
      // 添加时间戳
      const emailsWithTimestamp = emails.map(email => ({
        ...email,
        timestamp: Date.now(),
        cachedAt: new Date().toISOString()
      }));
      
      // 批量保存
      await Promise.all([
        ...emailsWithTimestamp.map(email => store.put(email)),
        tx.done
      ]);
      
      console.log(`Cached ${emails.length} emails to IndexedDB`);
    } catch (error) {
      console.error('Failed to cache emails:', error);
    }
  },

  // 获取缓存的邮件
  async getEmails() {
    try {
      const db = await initDB();
      const emails = await db.getAll(EMAILS_STORE);
      
      // 按时间戳排序（最新的在前）
      emails.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      
      console.log(`Retrieved ${emails.length} emails from cache`);
      return emails;
    } catch (error) {
      console.error('Failed to get cached emails:', error);
      return [];
    }
  },

  // 清除邮件缓存
  async clearEmails() {
    try {
      const db = await initDB();
      await db.clear(EMAILS_STORE);
      console.log('Cleared email cache');
    } catch (error) {
      console.error('Failed to clear email cache:', error);
    }
  },

  // 检查缓存是否存在
  async hasCache() {
    try {
      const emails = await this.getEmails();
      return emails.length > 0;
    } catch (error) {
      return false;
    }
  }
};

// 批量摘要缓存操作
export const batchSummaryCache = {
  // 保存批量摘要报告
  async saveBatchSummary(report) {
    try {
      const db = await initDB();
      const summaryData = {
        id: 'latest', // 使用固定ID，只保存最新的报告
        report,
        timestamp: Date.now(),
        cachedAt: new Date().toISOString()
      };
      
      await db.put(BATCH_SUMMARY_STORE, summaryData);
      console.log('Cached batch summary report to IndexedDB');
    } catch (error) {
      console.error('Failed to cache batch summary:', error);
    }
  },

  // 获取缓存的批量摘要
  async getBatchSummary() {
    try {
      const db = await initDB();
      const summaryData = await db.get(BATCH_SUMMARY_STORE, 'latest');
      
      if (summaryData) {
        console.log('Retrieved batch summary from cache');
        return summaryData.report;
      }
      return null;
    } catch (error) {
      console.error('Failed to get cached batch summary:', error);
      return null;
    }
  },

  // 清除批量摘要缓存
  async clearBatchSummary() {
    try {
      const db = await initDB();
      await db.clear(BATCH_SUMMARY_STORE);
      console.log('Cleared batch summary cache');
    } catch (error) {
      console.error('Failed to clear batch summary cache:', error);
    }
  },

  // 检查批量摘要缓存是否存在
  async hasCache() {
    try {
      const summary = await this.getBatchSummary();
      return summary !== null;
    } catch (error) {
      return false;
    }
  }
};

// 分析过的邮件缓存操作
export const analyzedEmailsCache = {
  // 保存分析过的邮件
  async saveAnalyzedEmails(analyzedEmails) {
    try {
      const db = await initDB();
      const tx = db.transaction(ANALYZED_EMAILS_STORE, 'readwrite');
      const store = tx.objectStore(ANALYZED_EMAILS_STORE);
      
      // 添加时间戳
      const emailsWithTimestamp = analyzedEmails.map(email => ({
        ...email,
        timestamp: Date.now(),
        cachedAt: new Date().toISOString()
      }));
      
      // 批量保存
      await Promise.all([
        ...emailsWithTimestamp.map(email => store.put(email)),
        tx.done
      ]);
      
      console.log(`Cached ${analyzedEmails.length} analyzed emails to IndexedDB`);
    } catch (error) {
      console.error('Failed to cache analyzed emails:', error);
    }
  },

  // 获取缓存的分析过的邮件
  async getAnalyzedEmails() {
    try {
      const db = await initDB();
      const emails = await db.getAll(ANALYZED_EMAILS_STORE);
      
      // 按时间戳排序（最新的在前）
      emails.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      
      console.log(`Retrieved ${emails.length} analyzed emails from cache`);
      return emails;
    } catch (error) {
      console.error('Failed to get cached analyzed emails:', error);
      return [];
    }
  },

  // 清除分析过的邮件缓存
  async clearAnalyzedEmails() {
    try {
      const db = await initDB();
      await db.clear(ANALYZED_EMAILS_STORE);
      console.log('Cleared analyzed emails cache');
    } catch (error) {
      console.error('Failed to clear analyzed emails cache:', error);
    }
  },

  // 检查分析过的邮件缓存是否存在
  async hasCache() {
    try {
      const emails = await this.getAnalyzedEmails();
      return emails.length > 0;
    } catch (error) {
      return false;
    }
  }
};

// 日历事件缓存操作
export const calendarEventsCache = {
  // 保存日历事件
  async saveCalendarEvents(events) {
    try {
      const db = await initDB();
      const eventsData = {
        id: 'latest', // 使用固定ID，只保存最新的事件
        events,
        timestamp: Date.now(),
        cachedAt: new Date().toISOString()
      };
      
      await db.put(CALENDAR_EVENTS_STORE, eventsData);
      console.log(`Cached ${events.length} calendar events to IndexedDB`);
    } catch (error) {
      console.error('Failed to cache calendar events:', error);
    }
  },

  // 获取缓存的日历事件
  async getCalendarEvents() {
    try {
      const db = await initDB();
      const eventsData = await db.get(CALENDAR_EVENTS_STORE, 'latest');
      
      if (eventsData) {
        console.log(`Retrieved ${eventsData.events.length} calendar events from cache`);
        return eventsData.events;
      }
      return [];
    } catch (error) {
      console.error('Failed to get cached calendar events:', error);
      return [];
    }
  },

  // 清除日历事件缓存
  async clearCalendarEvents() {
    try {
      const db = await initDB();
      await db.clear(CALENDAR_EVENTS_STORE);
      console.log('Cleared calendar events cache');
    } catch (error) {
      console.error('Failed to clear calendar events cache:', error);
    }
  },

  // 检查日历事件缓存是否存在
  async hasCache() {
    try {
      const events = await this.getCalendarEvents();
      return events.length > 0;
    } catch (error) {
      return false;
    }
  }
};

// 通用缓存管理
export const cacheManager = {
  // 清除所有缓存
  async clearAllCache() {
    await Promise.all([
      emailCache.clearEmails(),
      batchSummaryCache.clearBatchSummary(),
      analyzedEmailsCache.clearAnalyzedEmails(),
      calendarEventsCache.clearCalendarEvents()
    ]);
    console.log('Cleared all cache data');
  },

  // 获取缓存状态
  async getCacheStatus() {
    const [hasEmails, hasBatchSummary, hasAnalyzedEmails, hasCalendarEvents] = await Promise.all([
      emailCache.hasCache(),
      batchSummaryCache.hasCache(),
      analyzedEmailsCache.hasCache(),
      calendarEventsCache.hasCache()
    ]);

    return {
      hasEmails,
      hasBatchSummary,
      hasAnalyzedEmails,
      hasCalendarEvents
    };
  }
};

// 初始化数据库（可选，在应用启动时调用）
export const initializeCache = async () => {
  try {
    await initDB();
    console.log('IndexedDB cache initialized successfully');
  } catch (error) {
    console.error('Failed to initialize IndexedDB cache:', error);
  }
};