import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import InterestFilter from "@/components/InterestFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  documentType: string;
  onDocumentTypeChange: (value: string) => void;
  subject: string;
  onSubjectChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  labels: {
    searchTitle: string;
    searchPlaceholder: string;
    documentType: string;
    subject: string;
    clearFilters: string;
    activeFilters: string;
    search: string;
    interestsPlaceholder?: string;
    interestsLabel?: string;
  };
  documentTypes: { value: string; label: string }[];
  subjects: { value: string; label: string }[];
  interest?: string;
  onInterestChange?: (value: string) => void;
  interestSuggestions?: string[];
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  documentType,
  onDocumentTypeChange,
  subject,
  onSubjectChange,
  onClearFilters,
  hasActiveFilters,
  labels,
  documentTypes,
  subjects,
  interest,
  onInterestChange,
  interestSuggestions,
}) => {
  return (
    <Card className="border-2 border-border shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary to-accent-foreground text-primary-foreground rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          {labels.searchTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={labels.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {interest !== undefined && onInterestChange && interestSuggestions && (
          <InterestFilter
            interest={interest}
            onInterestChange={onInterestChange}
            suggestions={interestSuggestions}
            placeholder={labels.interestsPlaceholder || ''}
            label={labels.interestsLabel || ''}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">
              {labels.documentType}
            </label>
            <Select value={documentType} onValueChange={onDocumentTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">
              {labels.subject}
            </label>
            <Select value={subject} onValueChange={onSubjectChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subj => (
                  <SelectItem key={subj.value} value={subj.value}>
                    {subj.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            {hasActiveFilters && (
              <Button variant="outline" onClick={onClearFilters} className="w-full">
                <X className="h-4 w-4 mr-2" />
                {labels.clearFilters}
              </Button>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground">{labels.activeFilters}</span>
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {labels.search}: "{searchTerm}"
                <X className="h-3 w-3 cursor-pointer" onClick={() => onSearchChange("")} />
              </Badge>
            )}
            {documentType !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {labels.documentType}: {documentTypes.find(t => t.value === documentType)?.label}
                <X className="h-3 w-3 cursor-pointer" onClick={() => onDocumentTypeChange("all")} />
              </Badge>
            )}
            {subject !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {labels.subject}: {subjects.find(s => s.value === subject)?.label}
                <X className="h-3 w-3 cursor-pointer" onClick={() => onSubjectChange("all")} />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchAndFilters;
