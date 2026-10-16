/**
 * Centralized icon registry — uses lucide-react.
 * Import like:  import { Icon } from '../../components/ui/Icon';
 * Then use:     <Icon name="dashboard" />  OR  <Icon name="dashboard" size={20} />
 *
 * This keeps the icon library swappable and gives consistent sizing across the app.
 */
import {
  LayoutDashboard, Settings2, Users, ArrowLeftRight, DollarSign,
  Handshake, Trophy, Award, Bell, Wrench, BarChart3,
  LogOut, Search, Plus, Pencil, Trash2, Check, X, AlertTriangle,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ChevronDown, ChevronUp, MoreVertical, Filter, Download,
  Mail, Phone, MapPin, Globe, Calendar, Clock, User, UserCircle,
  Package, Recycle, Wallet, Coins, TrendingUp, TrendingDown,
  Activity, Server, AlertCircle, Info, CheckCircle2, XCircle,
  Menu, PanelRightClose, PanelRightOpen, Command, BellRing,
  HelpCircle, RefreshCw, Eye, EyeOff, Save, ArrowRight, ArrowLeft,
  ExternalLink, Star, Leaf, Banknote, Building2, Store, Smartphone,
  FileText, ClipboardList, Tag, Percent,
  CircleDot, Dot, Circle, Heart, Sparkles, ShieldCheck, Zap,
  Home, Sprout, Gem, Ticket, History, Gauge, ShieldAlert, QrCode, Printer, Crown, Medal,
} from 'lucide-react';

const REGISTRY = {
  // Navigation
  dashboard:        LayoutDashboard,
  machines:         Settings2,
  users:            Users,
  transactions:     ArrowLeftRight,
  pricing:          DollarSign,
  partners:         Handshake,
  leaderboard:      Trophy,
  trophy:           Trophy,
  wrench:           Wrench,
  achievements:     Award,
  notifications:    Bell,
  issues:           Wrench,
  reports:          BarChart3,

  // Actions
  logout:           LogOut,
  search:           Search,
  add:              Plus,
  edit:             Pencil,
  delete:           Trash2,
  check:            Check,
  close:            X,
  warning:          AlertTriangle,
  filter:           Filter,
  download:         Download,
  refresh:          RefreshCw,
  view:             Eye,
  hide:             EyeOff,
  save:             Save,
  more:             MoreVertical,
  external:         ExternalLink,

  // Chevrons / Arrows
  chevronLeft:      ChevronLeft,
  chevronRight:     ChevronRight,
  chevronsLeft:     ChevronsLeft,
  chevronsRight:    ChevronsRight,
  chevronDown:      ChevronDown,
  chevronUp:        ChevronUp,
  arrowRight:       ArrowRight,
  arrowLeft:        ArrowLeft,

  // Contact / User
  mail:             Mail,
  phone:            Phone,
  mapPin:           MapPin,
  globe:            Globe,
  calendar:         Calendar,
  clock:            Clock,
  user:             User,
  userCircle:       UserCircle,

  // Domain
  package:          Package,
  recycle:          Recycle,
  wallet:           Wallet,
  coins:            Coins,
  trendingUp:       TrendingUp,
  trendingDown:     TrendingDown,
  activity:         Activity,
  server:           Server,
  banknote:         Banknote,
  building:         Building2,
  store:            Store,
  smartphone:       Smartphone,
  fileText:         FileText,
  clipboardList:    ClipboardList,
  tag:              Tag,
  percent:          Percent,
  leaf:             Leaf,
  shield:           ShieldCheck,
  zap:              Zap,
  star:             Star,
  heart:            Heart,
  sparkles:         Sparkles,

  // New (business features)
  home:             Home,
  sprout:           Sprout,
  gem:              Gem,
  ticket:           Ticket,
  history:          History,
  gauge:            Gauge,
  shieldAlert:      ShieldAlert,
  qrCode:           QrCode,
  printer:          Printer,
  crown:            Crown,
  medal:            Medal,

  // UI
  menu:             Menu,
  sidebarClose:     PanelRightClose,
  sidebarOpen:      PanelRightOpen,
  command:          Command,
  bellRing:         BellRing,
  help:             HelpCircle,
  info:             Info,
  alertCircle:      AlertCircle,
  checkCircle:      CheckCircle2,
  xCircle:          XCircle,
  circleDot:        CircleDot,
  dot:              Dot,
  circle:           Circle,
};

/**
 * Icon — wrapper around lucide-react icons.
 * Props: name (key in REGISTRY), size (px), strokeWidth, className, ...rest
 */
export function Icon({ name, size = 18, strokeWidth = 2, className = '', ...rest }) {
  const Cmp = REGISTRY[name];
  if (!Cmp) {
    if (import.meta.env?.DEV) {
      console.warn(`[Icon] Unknown icon name: "${name}"`);
    }
    return null;
  }
  return <Cmp size={size} strokeWidth={strokeWidth} className={className} aria-hidden {...rest} />;
}

export { REGISTRY };
