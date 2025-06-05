
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Globe, Shield, Hospital, Building } from "lucide-react";

interface Website {
  id: string;
  name: string;
  emoji: string;
  description: string;
  icon: React.ComponentType<any>;
  articleCount: number;
}

interface WebsiteMenuProps {
  selectedWebsite: string;
  onWebsiteChange: (websiteId: string) => void;
  websites: Website[];
}

const WebsiteMenu: React.FC<WebsiteMenuProps> = ({
  selectedWebsite,
  onWebsiteChange,
  websites
}) => {
  return (
    <div className="w-full">
      <NavigationMenu className="w-full max-w-none">
        <NavigationMenuList className="flex-wrap gap-2">
          {websites.map((website) => (
            <NavigationMenuItem key={website.id}>
              <Button
                variant={selectedWebsite === website.id ? "default" : "outline"}
                onClick={() => onWebsiteChange(website.id)}
                className={`flex items-center gap-2 ${
                  selectedWebsite === website.id 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'hover:bg-blue-50'
                }`}
              >
                <website.icon className="h-4 w-4" />
                <span className="text-lg">{website.emoji}</span>
                <span className="font-medium">{website.name}</span>
                <Badge variant="secondary" className="ml-1">
                  {website.articleCount}
                </Badge>
              </Button>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

export default WebsiteMenu;
