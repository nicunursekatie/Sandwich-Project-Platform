import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, Home, Users, Calendar, FileText, BarChart3, Settings, Phone } from "lucide-react";
import { useLocation } from "wouter";

export function CollapsibleNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const navigationItems = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Projects", path: "/projects", icon: FileText },
    { name: "Meetings", path: "/meetings", icon: Calendar },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Phone Directory", path: "/phone-directory", icon: Phone },
    { name: "Team", path: "/team", icon: Users },
    { name: "Data Management", path: "/data-management", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white dark:bg-gray-800 shadow-lg"
        >
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Desktop Collapsible Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full z-40">
        <div className={`h-full bg-white dark:bg-gray-800 border-r shadow-lg transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}>
          <div className="p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="mb-4"
            >
              {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>

            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = location === item.path || location.startsWith(item.path + '/');
                
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start ${!isOpen && 'px-2'}`}
                    onClick={() => setLocation(item.path)}
                  >
                    <IconComponent className="w-4 h-4" />
                    {isOpen && <span className="ml-2">{item.name}</span>}
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Overlay Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Navigation</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = location === item.path || location.startsWith(item.path + '/');
                  
                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        setLocation(item.path);
                        setIsOpen(false);
                      }}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {item.name}
                    </Button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}