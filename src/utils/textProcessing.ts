
import React from 'react';

export const legalTerms = [
  "hotărâre de guvern",
  "hotărâre",
  "ordonanță de urgență", 
  "ordonanță",
  "ordin",
  "comunicat de presă",
  "informare",
  "act normativ"
];

export const highlightLegalTerms = (text: string): React.ReactNode[] => {
  // Sort terms by length (longest first) to avoid partial matches
  const sortedTerms = [...legalTerms].sort((a, b) => b.length - a.length);
  
  let parts: React.ReactNode[] = [text];
  
  sortedTerms.forEach((term, termIndex) => {
    const newParts: React.ReactNode[] = [];
    
    parts.forEach((part, partIndex) => {
      if (typeof part === 'string') {
        const regex = new RegExp(`(${term})`, 'gi');
        const splits = part.split(regex);
        
        splits.forEach((split, splitIndex) => {
          if (regex.test(split)) {
            newParts.push(
              React.createElement('span', {
                key: `${termIndex}-${partIndex}-${splitIndex}`,
                'data-term': term.toLowerCase(),
                className: 'legal-term'
              }, split)
            );
          } else if (split) {
            newParts.push(split);
          }
        });
      } else {
        newParts.push(part);
      }
    });
    
    parts = newParts;
  });
  
  return parts;
};

export const filterArticles = (
  articles: any[], 
  searchTerm: string, 
  documentType: string, 
  subject: string
) => {
  return articles.filter(article => {
    // Search term filter
    const searchMatch = !searchTerm || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.originalContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.simplifiedContent.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Document type filter
    const documentTypeMatch = documentType === "all" || 
      article.title.toLowerCase().includes(documentType) ||
      article.originalContent.toLowerCase().includes(documentType);
    
    // Subject filter
    const subjectMatch = subject === "all" || 
      article.category === subject ||
      article.title.toLowerCase().includes(subject) ||
      article.originalContent.toLowerCase().includes(subject);
    
    return searchMatch && documentTypeMatch && subjectMatch;
  });
};
