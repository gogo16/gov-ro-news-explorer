import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Country, CountryConfig, ScrapedArticle, ArticleTag, romaniaConfig, ukConfig } from '@/data/countryConfig';

interface AppData {
  ro: CountryConfig;
  uk: CountryConfig;
}

interface AppDataContextType {
  getData: (country: Country) => CountryConfig;
  // Articles
  addArticle: (country: Country, article: ScrapedArticle) => void;
  updateArticle: (country: Country, id: string, article: Partial<ScrapedArticle>) => void;
  deleteArticle: (country: Country, id: string) => void;
  // Sources (websites)
  addSource: (country: Country, source: { id: string; name: string; emoji: string; description: string }) => void;
  deleteSource: (country: Country, id: string) => void;
  // Document types
  addDocumentType: (country: Country, dt: { value: string; label: string }) => void;
  deleteDocumentType: (country: Country, value: string) => void;
  // Subjects
  addSubject: (country: Country, subj: { value: string; label: string }) => void;
  deleteSubject: (country: Country, value: string) => void;
  // Interests
  addInterest: (country: Country, interest: string) => void;
  deleteInterest: (country: Country, interest: string) => void;
  // Page texts
  updateLabel: (country: Country, key: string, value: string) => void;
}

const AppDataContext = createContext<AppDataContextType | null>(null);

const STORAGE_KEY = 'friendlygov_data';

// Deep clone config for initialization, converting function labels
const serializeConfig = (config: CountryConfig): any => {
  const { labels, ...rest } = config;
  const { articleCount, ...labelRest } = labels;
  return { ...rest, labels: { ...labelRest, _articleCountTemplate: config.code === 'ro' ? '{n} articole' : '{n} articles' } };
};

const deserializeConfig = (data: any, defaultConfig: CountryConfig): CountryConfig => {
  if (!data) return { ...defaultConfig };
  const { labels: savedLabels, ...rest } = data;
  const { _articleCountTemplate, ...labelRest } = savedLabels || {};
  const template = _articleCountTemplate || (data.code === 'ro' ? '{n} articole' : '{n} articles');
  return {
    ...defaultConfig,
    ...rest,
    websites: rest.websites || defaultConfig.websites,
    articles: rest.articles || defaultConfig.articles,
    documentTypes: rest.documentTypes || defaultConfig.documentTypes,
    subjects: rest.subjects || defaultConfig.subjects,
    interests: rest.interests || defaultConfig.interests,
    labels: {
      ...defaultConfig.labels,
      ...labelRest,
      articleCount: (n: number) => template.replace('{n}', String(n)),
    },
  };
};

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<{ ro: any; uk: any }>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      ro: serializeConfig(romaniaConfig),
      uk: serializeConfig(ukConfig),
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const update = (country: Country, updater: (d: any) => any) => {
    setData(prev => ({ ...prev, [country]: updater(prev[country]) }));
  };

  const getData = useCallback((country: Country): CountryConfig => {
    return deserializeConfig(data[country], country === 'ro' ? romaniaConfig : ukConfig);
  }, [data]);

  const addArticle = (country: Country, article: ScrapedArticle) => {
    update(country, d => ({ ...d, articles: [...d.articles, article] }));
  };

  const updateArticle = (country: Country, id: string, updates: Partial<ScrapedArticle>) => {
    update(country, d => ({
      ...d,
      articles: d.articles.map((a: any) => a.id === id ? { ...a, ...updates } : a),
    }));
  };

  const deleteArticle = (country: Country, id: string) => {
    update(country, d => ({ ...d, articles: d.articles.filter((a: any) => a.id !== id) }));
  };

  const addSource = (country: Country, source: { id: string; name: string; emoji: string; description: string }) => {
    update(country, d => ({
      ...d,
      websites: [...d.websites, { ...source, icon: 'FileText' }],
    }));
  };

  const deleteSource = (country: Country, id: string) => {
    update(country, d => ({
      ...d,
      websites: d.websites.filter((w: any) => w.id !== 'all' && w.id !== id),
    }));
  };

  const addDocumentType = (country: Country, dt: { value: string; label: string }) => {
    update(country, d => ({ ...d, documentTypes: [...d.documentTypes, dt] }));
  };

  const deleteDocumentType = (country: Country, value: string) => {
    update(country, d => ({
      ...d,
      documentTypes: d.documentTypes.filter((t: any) => t.value !== 'all' && t.value !== value),
    }));
  };

  const addSubject = (country: Country, subj: { value: string; label: string }) => {
    update(country, d => ({ ...d, subjects: [...d.subjects, subj] }));
  };

  const deleteSubject = (country: Country, value: string) => {
    update(country, d => ({
      ...d,
      subjects: d.subjects.filter((s: any) => s.value !== 'all' && s.value !== value),
    }));
  };

  const addInterest = (country: Country, interest: string) => {
    update(country, d => ({ ...d, interests: [...d.interests, interest] }));
  };

  const deleteInterest = (country: Country, interest: string) => {
    update(country, d => ({
      ...d,
      interests: d.interests.filter((i: string) => i !== interest),
    }));
  };

  const updateLabel = (country: Country, key: string, value: string) => {
    update(country, d => ({
      ...d,
      labels: { ...d.labels, [key]: value },
    }));
  };

  return (
    <AppDataContext.Provider value={{
      getData, addArticle, updateArticle, deleteArticle,
      addSource, deleteSource, addDocumentType, deleteDocumentType,
      addSubject, deleteSubject, addInterest, deleteInterest, updateLabel,
    }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
};
