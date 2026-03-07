import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ArticleTag } from "@/data/countryConfig";

interface ArticleTagBadgeProps {
  tag: ArticleTag;
  labels: { tagNew: string; tagImportant: string; tagUrgent: string };
}

const tagStyles: Record<ArticleTag, string> = {
  new: 'bg-green-500 hover:bg-green-600 text-white',
  important: 'bg-amber-500 hover:bg-amber-600 text-white',
  urgent: 'bg-red-500 hover:bg-red-600 text-white animate-pulse',
};

const tagIcons: Record<ArticleTag, string> = {
  new: '🆕',
  important: '⚠️',
  urgent: '🚨',
};

const ArticleTagBadge: React.FC<ArticleTagBadgeProps> = ({ tag, labels }) => {
  const labelMap: Record<ArticleTag, string> = {
    new: labels.tagNew,
    important: labels.tagImportant,
    urgent: labels.tagUrgent,
  };

  return (
    <Badge className={`${tagStyles[tag]} text-xs font-bold`}>
      {tagIcons[tag]} {labelMap[tag]}
    </Badge>
  );
};

export default ArticleTagBadge;
