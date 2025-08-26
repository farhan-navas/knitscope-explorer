import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Home,
  GitBranch,
  BarChart3,
  GitCompare,
  FileText,
  Code2,
  Zap,
} from "lucide-react";

const navItems = [
  {
    title: "Import",
    url: "/",
    icon: Home,
    description: "Import graph data",
  },
  {
    title: "Graph Explorer",
    url: "/graph",
    icon: GitBranch,
    description: "Interactive visualization",
  },
  {
    title: "Analysis",
    url: "/analysis",
    icon: BarChart3,
    description: "Cycles & metrics",
  },
  {
    title: "Compare",
    url: "/compare",
    icon: GitCompare,
    description: "Graph diff analysis",
  },
  {
    title: "Report",
    url: "/report",
    icon: FileText,
    description: "Generate reports",
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const getNavClassName = (path: string) =>
    isActive(path)
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary"
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  return (
    <Sidebar className="border-r" collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Code2 className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold gradient-text">KnitScope</h2>
              <p className="text-xs text-muted-foreground">DI Visualizer</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={getNavClassName(item.url)}
                    tooltip={isCollapsed ? item.description : undefined}
                  >
                    <NavLink to={item.url} end={item.url === "/"}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && (
                        <div className="flex flex-col">
                          <span className="text-sm">{item.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!isCollapsed && (
        <SidebarFooter className="p-4">
          <div className="glass rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-medium">TikTok Knit DI</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dependency injection graph visualizer
            </p>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}