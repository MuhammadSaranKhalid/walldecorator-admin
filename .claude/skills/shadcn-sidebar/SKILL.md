---
name: shadcn-sidebar
description: Expert guidance for building sidebars using the shadcn/ui Sidebar component. Use when creating, configuring, or customizing sidebars — including collapsible behavior, variants, navigation menus, submenus, badges, skeletons, and controlled state.
user-invocable: true
disable-model-invocation: false
argument-hint: [layout|menu|collapsible|controlled]
allowed-tools: Read, Grep, Glob
---

# shadcn/ui Sidebar Guide

Based on the official shadcn/ui Sidebar documentation.

## Installation

```bash
pnpm dlx shadcn@latest add sidebar
```

---

## Core Architecture

The sidebar system is composable. Every sidebar follows this structure:

```tsx
<SidebarProvider>
  <Sidebar>
    <SidebarHeader />
    <SidebarContent>
      <SidebarGroup />
    </SidebarContent>
    <SidebarFooter />
    <SidebarRail />
  </Sidebar>
  <SidebarInset>
    <main>{children}</main>
  </SidebarInset>
</SidebarProvider>
```

> `SidebarInset` is required when using `variant="inset"`. For other variants, wrap main content directly.

---

## SidebarProvider

Manages sidebar state and provides context. Must wrap the entire sidebar system.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `defaultOpen` | `boolean` | Initial open state (uncontrolled) |
| `open` | `boolean` | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | State change handler |

### Width Configuration

Default widths are set as constants in `components/ui/sidebar.tsx`:
```typescript
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
```

Override per-instance with inline CSS variables:
```tsx
<SidebarProvider
  style={{
    "--sidebar-width": "20rem",
    "--sidebar-width-mobile": "20rem",
  } as React.CSSProperties}
>
```

### Keyboard Shortcut

`cmd+b` (Mac) / `ctrl+b` (Windows) — toggles sidebar. Configurable via `SIDEBAR_KEYBOARD_SHORTCUT` constant.

---

## Sidebar Component Props

| Prop | Values | Description |
|------|--------|-------------|
| `side` | `"left"` \| `"right"` | Sidebar placement |
| `variant` | `"sidebar"` \| `"floating"` \| `"inset"` | Visual style |
| `collapsible` | `"offcanvas"` \| `"icon"` \| `"none"` | Collapse behavior |

### Collapsible Behaviors

| Value | Behavior |
|-------|----------|
| `offcanvas` | Slides in/out from the screen edge |
| `icon` | Collapses to icon-only strip |
| `none` | Always visible, non-collapsible |

---

## useSidebar Hook

Access sidebar state from any child component:

```typescript
const {
  state,          // "expanded" | "collapsed"
  open,           // boolean
  setOpen,        // (open: boolean) => void
  openMobile,     // boolean
  setOpenMobile,  // (open: boolean) => void
  isMobile,       // boolean
  toggleSidebar,  // () => void
} = useSidebar()
```

---

## Layout Components

### SidebarHeader

Sticky region at the top. Ideal for workspace/tenant selectors.

```tsx
<SidebarHeader>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton>
            Select Workspace
            <ChevronDown className="ml-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Workspace A</DropdownMenuItem>
          <DropdownMenuItem>Workspace B</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</SidebarHeader>
```

### SidebarFooter

Sticky region at the bottom. Ideal for user profile menus.

```tsx
<SidebarFooter>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton>
            <User2 />
            <span>Username</span>
            <ChevronUp className="ml-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top">
          <DropdownMenuItem>Account</DropdownMenuItem>
          <DropdownMenuItem>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</SidebarFooter>
```

### SidebarContent

Scrollable wrapper for navigation groups.

```tsx
<SidebarContent>
  <SidebarGroup>...</SidebarGroup>
  <SidebarGroup>...</SidebarGroup>
</SidebarContent>
```

---

## Navigation Components

### SidebarGroup

Organizational section with optional label and action.

```tsx
<SidebarGroup>
  <SidebarGroupLabel>Application</SidebarGroupLabel>
  <SidebarGroupAction>
    <Plus />
    <span className="sr-only">Add Project</span>
  </SidebarGroupAction>
  <SidebarGroupContent>
    <SidebarMenu>...</SidebarMenu>
  </SidebarGroupContent>
</SidebarGroup>
```

### Collapsible Group

Wrap in `Collapsible` for expandable/collapsible sections:

```tsx
<Collapsible defaultOpen className="group/collapsible">
  <SidebarGroup>
    <SidebarGroupLabel asChild>
      <CollapsibleTrigger>
        Help
        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
      </CollapsibleTrigger>
    </SidebarGroupLabel>
    <CollapsibleContent>
      <SidebarGroupContent />
    </CollapsibleContent>
  </SidebarGroup>
</Collapsible>
```

### SidebarMenu / SidebarMenuItem

Container and item for navigation links.

```tsx
<SidebarMenu>
  {items.map((item) => (
    <SidebarMenuItem key={item.name}>
      <SidebarMenuButton asChild>
        <a href={item.url}>
          <item.icon />
          <span>{item.name}</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ))}
</SidebarMenu>
```

### SidebarMenuButton

Interactive button for menu items. Supports `asChild` for rendering as a link.

| Prop | Type | Description |
|------|------|-------------|
| `asChild` | `boolean` | Render as child component (e.g. `<a>`) |
| `isActive` | `boolean` | Marks item as the active route |
| `tooltip` | `string` | Tooltip shown when sidebar is collapsed to icon mode |

```tsx
<SidebarMenuButton asChild isActive tooltip="Dashboard">
  <a href="/dashboard">
    <LayoutDashboard />
    <span>Dashboard</span>
  </a>
</SidebarMenuButton>
```

### SidebarMenuAction

Secondary action button inside a menu item (e.g. add, more options).

```tsx
<SidebarMenuItem>
  <SidebarMenuButton asChild>
    <a href="#">
      <FolderIcon />
      <span>Projects</span>
    </a>
  </SidebarMenuButton>
  <SidebarMenuAction showOnHover>
    <MoreHorizontal />
    <span className="sr-only">More</span>
  </SidebarMenuAction>
</SidebarMenuItem>
```

### SidebarMenuBadge

Display a count or status badge inside a menu item.

```tsx
<SidebarMenuItem>
  <SidebarMenuButton>
    <Inbox />
    <span>Inbox</span>
  </SidebarMenuButton>
  <SidebarMenuBadge>24</SidebarMenuBadge>
</SidebarMenuItem>
```

### SidebarMenuSub / SidebarMenuSubItem / SidebarMenuSubButton

Nested submenu structure for hierarchical navigation.

```tsx
<SidebarMenuItem>
  <SidebarMenuButton>
    <BookOpen />
    <span>Docs</span>
  </SidebarMenuButton>
  <SidebarMenuSub>
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive>
        <a href="/docs/intro">Introduction</a>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild>
        <a href="/docs/api">API Reference</a>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  </SidebarMenuSub>
</SidebarMenuItem>
```

### SidebarMenuSkeleton

Loading placeholder while navigation items are being fetched.

```tsx
<SidebarMenu>
  {Array.from({ length: 5 }).map((_, i) => (
    <SidebarMenuItem key={i}>
      <SidebarMenuSkeleton showIcon />
    </SidebarMenuItem>
  ))}
</SidebarMenu>
```

### SidebarSeparator

Visual divider between groups.

```tsx
<SidebarSeparator />
```

---

## Toggle Components

### SidebarTrigger

Button to toggle sidebar open/closed. Typically placed in the page header.

```tsx
<header className="flex items-center gap-2 p-4">
  <SidebarTrigger />
  <h1>Page Title</h1>
</header>
```

### SidebarRail

Clickable strip on the sidebar edge for toggling in `collapsible="icon"` mode. Add as the last child of `<Sidebar>`.

```tsx
<Sidebar collapsible="icon">
  <SidebarHeader />
  <SidebarContent>...</SidebarContent>
  <SidebarFooter />
  <SidebarRail />
</Sidebar>
```

---

## Controlled Sidebar

Manage open state externally:

```tsx
export function AppLayout() {
  const [open, setOpen] = React.useState(true)

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <AppSidebar />
      <SidebarInset>
        <main>{/* page content */}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

---

## Styling Patterns

### Hide elements in icon-collapsed mode

```tsx
<SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
  Application
</SidebarGroupLabel>
```

### Show action only when menu item is active

```tsx
<SidebarMenuAction className="peer-data-[active=true]/menu-button:opacity-100 opacity-0" />
```

### Animate collapsible chevron

```tsx
<ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
```

---

## Theming

CSS variables (set in globals.css):

```css
@layer base {
  :root {
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
  .dark {
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 0 0% 98%;
    --sidebar-primary-foreground: 240 5.9% 10%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}
```

---

## Key Rules

1. Always wrap sidebar system in `<SidebarProvider>`
2. Use `SidebarInset` for main content when `variant="inset"`
3. Use `asChild` on `SidebarMenuButton` to render it as a `<Link>` or `<a>`
4. Use `isActive` on `SidebarMenuButton` / `SidebarMenuSubButton` to mark the current route
5. Add `SidebarRail` as last child of `<Sidebar>` when using `collapsible="icon"` for a draggable resize handle
6. Use `tooltip` prop on `SidebarMenuButton` so labels are accessible when collapsed to icon mode
7. `SidebarMenuAction` with `showOnHover` keeps the action hidden until the item is hovered
8. Use `group-data-[collapsible=icon]:hidden` to hide text/labels in icon-collapsed state
