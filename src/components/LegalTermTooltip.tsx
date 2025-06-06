
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info } from "lucide-react";

interface LegalTermTooltipProps {
  term: string;
  children: React.ReactNode;
}

const legalTerms: Record<string, string> = {
  "hotărâre de guvern": "Hotărârea de Guvern este un act normativ adoptat de Guvernul României pentru aplicarea legilor sau pentru reglementarea unor aspecte administrative specifice.",
  "hotărâre": "Hotărârea de Guvern este un act normativ adoptat de Guvernul României pentru aplicarea legilor sau pentru reglementarea unor aspecte administrative specifice.",
  "ordonanță de urgență": "Ordonanța de urgență este un act normativ adoptat de Guvern în situații excepționale, care intră în vigoare imediat și trebuie să fie aprobată ulterior de Parlament.",
  "ordonanță": "Ordonanța este un act normativ adoptat de Guvern pentru reglementarea unor domenii care nu sunt rezervate legii, sau pentru detalierea unor prevederi legale.",
  "ordin": "Ordinul este un act administrativ emis de un ministru sau de șeful unei instituții publice pentru aplicarea legilor în domeniul său de competență.",
  "comunicat de presă": "Comunicatul de presă este o informare oficială destinată mijloacelor de informare în masă despre activitățile și deciziile instituțiilor publice.",
  "informare": "Informarea reprezintă comunicarea oficială către public a unor informații de interes general despre activitatea instituțiilor publice.",
  "act normativ": "Actul normativ este un document oficial care conține norme juridice și care reglementează comportamentul în societate."
};

const LegalTermTooltip: React.FC<LegalTermTooltipProps> = ({ term, children }) => {
  const lowerTerm = term.toLowerCase();
  const explanation = legalTerms[lowerTerm];

  if (!explanation) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HoverCard>
            <HoverCardTrigger asChild>
              <span className="cursor-help underline decoration-dotted decoration-blue-500 hover:decoration-solid hover:text-blue-600 transition-all">
                {children}
              </span>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">
                    {term}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {explanation}
                  </p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click pentru explicație detaliată</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LegalTermTooltip;
