import type { LucideIcon } from 'lucide-react'
import {
  Book,
  BookOpen,
  Box,
  Calendar,
  ClipboardList,
  Database,
  FileText,
  Folder,
  Globe,
  Grid3X3,
  Image,
  LayoutGrid,
  List,
  MessageSquare,
  Notebook,
  Package,
  Sparkles,
  Square,
  Star,
  Tag,
  TicketCheck,
  User,
  Users,
  Zap,
} from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  book: Book,
  'book-open': BookOpen,
  box: Box,
  calendar: Calendar,
  clipboard: ClipboardList,
  'clipboard-list': ClipboardList,
  database: Database,
  file: FileText,
  'file-text': FileText,
  folder: Folder,
  globe: Globe,
  grid: Grid3X3,
  'grid-3x3': Grid3X3,
  image: Image,
  layout: LayoutGrid,
  'layout-grid': LayoutGrid,
  list: List,
  message: MessageSquare,
  'message-square': MessageSquare,
  note: Notebook,
  notebook: Notebook,
  package: Package,
  sparkle: Sparkles,
  sparkles: Sparkles,
  square: Square,
  star: Star,
  tag: Tag,
  ticket: TicketCheck,
  'ticket-check': TicketCheck,
  user: User,
  users: Users,
  zap: Zap,
}

const DEFAULT_ICON: LucideIcon = FileText

function normalizeIconName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
}

export function getIconByName(value?: string | null): LucideIcon {
  if (!value) {
    return DEFAULT_ICON
  }
  const key = normalizeIconName(value)
  return ICON_MAP[key] ?? DEFAULT_ICON
}
