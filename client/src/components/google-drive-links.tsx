import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import * as Icons from "lucide-react";
import type { DriveLink } from "@shared/schema";

export default function GoogleDriveLinks() {
  const { data: links = [], isLoading } = useQuery<DriveLink[]>({
    queryKey: ["/api/drive-links"]
  });

  const getIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      folder: Icons.Folder,
      "chart-line": Icons.TrendingUp,
      utensils: Icons.Utensils,
      users: Icons.Users,
    };
    
    const IconComponent = iconMap[iconName] || Icons.Folder;
    return IconComponent;
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case "blue": return "text-blue-500";
      case "green": return "text-green-500";
      case "amber": return "text-amber-500";
      case "purple": return "text-purple-500";
      default: return "text-blue-500";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="h-6 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="p-6 space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center p-3 bg-slate-50 rounded-lg">
              <div className="w-6 h-6 bg-slate-200 rounded mr-3 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-3 bg-slate-100 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center">
          <Icons.FolderOpen className="text-blue-500 mr-2 w-5 h-5" />
          Quick Links
        </h2>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {links.map((link) => {
            const IconComponent = getIcon(link.icon);
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
              >
                <IconComponent className={`${getIconColor(link.iconColor)} mr-3 w-5 h-5`} />
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900 group-hover:text-blue-600">
                    {link.title}
                  </h3>
                  <p className="text-sm text-slate-600">{link.description}</p>
                </div>
                <ExternalLink className="text-slate-400 ml-auto w-4 h-4" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
