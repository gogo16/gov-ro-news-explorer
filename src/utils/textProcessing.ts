
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

// Function to remove diacritics from Romanian text
export const removeDiacritics = (text: string): string => {
  const diacriticsMap: { [key: string]: string } = {
    'ă': 'a', 'â': 'a', 'á': 'a', 'à': 'a',
    'î': 'i', 'í': 'i', 'ì': 'i',
    'ș': 's', 'ş': 's', 'ś': 's',
    'ț': 't', 'ţ': 't', 'ť': 't',
    'ó': 'o', 'ò': 'o', 'ô': 'o',
    'é': 'e', 'è': 'e', 'ê': 'e',
    'ú': 'u', 'ù': 'u', 'û': 'u',
    'ń': 'n', 'ň': 'n',
    'ć': 'c', 'č': 'c',
    'ř': 'r',
    'ď': 'd',
    'ľ': 'l',
    'ž': 'z',
    // Capital letters
    'Ă': 'A', 'Â': 'A', 'Á': 'A', 'À': 'A',
    'Î': 'I', 'Í': 'I', 'Ì': 'I',
    'Ș': 'S', 'Ş': 'S', 'Ś': 'S',
    'Ț': 'T', 'Ţ': 'T', 'Ť': 'T',
    'Ó': 'O', 'Ò': 'O', 'Ô': 'O',
    'É': 'E', 'È': 'E', 'Ê': 'E',
    'Ú': 'U', 'Ù': 'U', 'Û': 'U',
    'Ń': 'N', 'Ň': 'N',
    'Ć': 'C', 'Č': 'C',
    'Ř': 'R',
    'Ď': 'D',
    'Ľ': 'L',
    'Ž': 'Z'
  };

  return text.replace(/[ăâáàîíìșşśțţťóòôéèêúùûńňćčřďľž]/gi, (match) => {
    return diacriticsMap[match] || match;
  });
};

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
    // Search term filter - now ignoring diacritics
    const searchMatch = !searchTerm || 
      removeDiacritics(article.title.toLowerCase()).includes(removeDiacritics(searchTerm.toLowerCase())) ||
      removeDiacritics(article.originalContent.toLowerCase()).includes(removeDiacritics(searchTerm.toLowerCase())) ||
      removeDiacritics(article.simplifiedContent.toLowerCase()).includes(removeDiacritics(searchTerm.toLowerCase()));
    
    // Document type filter - also ignoring diacritics
    const documentTypeMatch = documentType === "all" || 
      removeDiacritics(article.title.toLowerCase()).includes(removeDiacritics(documentType)) ||
      removeDiacritics(article.originalContent.toLowerCase()).includes(removeDiacritics(documentType));
    
    // Subject filter - also ignoring diacritics
    const subjectMatch = subject === "all" || 
      article.category === subject ||
      removeDiacritics(article.title.toLowerCase()).includes(removeDiacritics(subject)) ||
      removeDiacritics(article.originalContent.toLowerCase()).includes(removeDiacritics(subject));
    
    return searchMatch && documentTypeMatch && subjectMatch;
  });
};
