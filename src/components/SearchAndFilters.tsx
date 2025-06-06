
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter } from "lucide-react";
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
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  documentType,
  onDocumentTypeChange,
  subject,
  onSubjectChange,
  onClearFilters,
  hasActiveFilters
}) => {
  const documentTypes = [
    { value: "all", label: "Toate tipurile" },
    { value: "hotarare", label: "Hotărâri" },
    { value: "ordonanta", label: "Ordonanțe" },
    { value: "ordin", label: "Ordine" },
    { value: "informare", label: "Informări" },
    { value: "comunicat", label: "Comunicate" }
  ];

  const subjects = [
    { value: "all", label: "Toate subiectele" },
    { value: "sanatate", label: "Sănătate" },
    { value: "educatie", label: "Educație" },
    { value: "transport", label: "Transport" },
    { value: "infrastructura", label: "Infrastructură" },
    { value: "economie", label: "Economie" },
    { value: "mediu", label: "Mediu" },
    { value: "securitate", label: "Securitate" },
    { value: "administratie", label: "Administrație" }
  ];

  return (
    <Card className="border-2 border-blue-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Căutare și Filtrare
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Căutați după cuvinte-cheie..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Tip Document
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
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Subiect
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
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Resetează Filtrele
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-gray-600">Filtre active:</span>
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Căutare: "{searchTerm}"
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => onSearchChange("")}
                />
              </Badge>
            )}
            {documentType !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Tip: {documentTypes.find(t => t.value === documentType)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => onDocumentTypeChange("all")}
                />
              </Badge>
            )}
            {subject !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Subiect: {subjects.find(s => s.value === subject)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => onSubjectChange("all")}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchAndFilters;
