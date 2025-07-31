import { Bell, LogOut, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import tspLogo from "@/attached_assets/LOGOS/TSP_transparent.png";
import { useAuth } from "@/hooks/useAuth";
import { useMessaging } from "@/hooks/useMessaging";
import MessageNotifications from "@/components/message-notifications";

interface TSPHeaderProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  onSectionChange: (section: string) => void;
}

export default function TSPHeader({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen,
  onSectionChange 
}: TSPHeaderProps) {
  const { user, logOut } = useAuth();
  const { totalUnread } = useMessaging();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 shadow-sm">
      <div className="container flex h-16 items-center px-4">
        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="xl:hidden mr-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 text-tsp-navy" />
          ) : (
            <Menu className="h-5 w-5 text-tsp-navy" />
          )}
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo and Brand */}
        <div className="flex items-center gap-3 flex-1">
          <img 
            src={tspLogo} 
            alt="The Sandwich Project" 
            className="h-10 w-auto"
          />
          <div className="hidden sm:block">
            <h1 className="text-lg font-main-heading text-tsp-navy">
              THE SANDWICH PROJECT
            </h1>
            <p className="text-xs text-muted-foreground font-body-light">
              Volunteer Management Platform
            </p>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <MessageNotifications />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-tsp-burgundy animate-pulse" />
            )}
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-2 hover:bg-tsp-navy-light transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-tsp flex items-center justify-center text-white font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:inline-block text-sm font-medium">
                    {user?.name || 'User'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem 
                onClick={() => onSectionChange('profile')}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={logOut}
                className="cursor-pointer text-destructive hover:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Breadcrumb or Status Bar */}
      <div className="xl:hidden border-t border-border/50 bg-tsp-navy-light px-4 py-2">
        <p className="text-xs text-tsp-navy font-medium">
          Welcome back, {user?.name?.split(' ')[0] || 'Volunteer'}!
        </p>
      </div>
    </header>
  );
}