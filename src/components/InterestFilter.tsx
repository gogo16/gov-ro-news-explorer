import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X, Lightbulb } from "lucide-react";

interface InterestFilterProps {
  interest: string;
  onInterestChange: (value: string) => void;
  suggestions: string[];
  placeholder: string;
  label: string;
}

const InterestFilter: React.FC<InterestFilterProps> = ({
  interest,
  onInterestChange,
  suggestions,
  placeholder,
  label,
}) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Lightbulb className="h-4 w-4" />
        {label}
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={interest}
          onChange={(e) => onInterestChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {interest && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => onInterestChange('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <Badge
            key={suggestion}
            variant={interest === suggestion ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => onInterestChange(interest === suggestion ? '' : suggestion)}
          >
            {suggestion}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default InterestFilter;
