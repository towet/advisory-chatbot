import knowledgeBaseData from '../data/knowledgeBase.json';

export interface KnowledgeEntry {
  id?: string;
  topic: string;
  content: string;
  category: 'course' | 'university' | 'career' | 'general';
  created_at?: string;
  created_by?: string;
}

const STORAGE_KEY = 'knowledge_base_entries';

// Load entries from localStorage
const loadStoredEntries = (): KnowledgeEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading stored entries:', error);
    return [];
  }
};

// Save entries to localStorage
const saveEntries = (entries: KnowledgeEntry[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving entries:', error);
  }
};

// Initialize in-memory storage from localStorage
let newEntries: KnowledgeEntry[] = loadStoredEntries();

export const addKnowledgeEntry = async (entry: KnowledgeEntry) => {
  try {
    const newEntry = {
      ...entry,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    
    newEntries.push(newEntry);
    saveEntries(newEntries);
    return newEntry;
  } catch (error) {
    console.error('Error adding knowledge entry:', error);
    throw error;
  }
};

export const getKnowledgeEntries = async () => {
  try {
    return [...knowledgeBaseData.entries, ...newEntries];
  } catch (error) {
    console.error('Error getting knowledge entries:', error);
    return [];
  }
};

export const searchInternet = async (query: string) => {
  try {
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
    const data = await response.json();
    return data.RelatedTopics?.slice(0, 3).map((topic: any) => ({
      title: topic.Text?.split(' - ')[0] || '',
      snippet: topic.Text || ''
    })) || [];
  } catch (error) {
    console.error('Error searching internet:', error);
    return [];
  }
};

export const getKnowledgeByCategory = async (category: KnowledgeEntry['category']) => {
  try {
    const allEntries = await getKnowledgeEntries();
    return allEntries.filter(entry => entry.category === category);
  } catch (error) {
    console.error('Error getting knowledge by category:', error);
    return [];
  }
};

export const removeKnowledgeEntry = async (id: string) => {
  try {
    newEntries = newEntries.filter(entry => entry.id !== id);
    saveEntries(newEntries);
  } catch (error) {
    console.error('Error removing knowledge entry:', error);
    throw error;
  }
};
