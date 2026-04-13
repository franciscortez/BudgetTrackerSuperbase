import React, { memo } from "react";
import {
  Building2,
  Wallet,
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowDownToLine,
  Plus,
  PencilLine,
  Trash2,
  Search,
  Clock,
  Calendar,
  Smartphone,
  Wallet2,
  User,
  LogOut,
  Lock,
  ArrowLeft,
  Banknote,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Menu,
  Settings,
  Moon,
  Sun,
  History,
  ArrowRightLeft,
  ChevronDown,
  Sparkles,
  Bot,
  MessageSquare,
  Send,
  X as CloseIcon,
  ArrowRight,
  Brain,
  Cpu,
  Calculator
} from "lucide-react";

const icons = {
  bank: Building2,
  wallet: Wallet,
  card: CreditCard,
  income: ArrowDownCircle,
  expense: ArrowUpCircle,
  withdrawal: ArrowDownToLine,
  plus: Plus,
  edit: PencilLine,
  delete: Trash2,
  search: Search,
  clock: Clock,
  calendar: Calendar,
  digital: Smartphone,
  traditional: Building2,
  ewallet: Wallet2,
  user: User,
  x: CloseIcon,
  logout: LogOut,
  lock: Lock,
  arrowLeft: ArrowLeft,
  cash: Banknote,
  reports: TrendingUp,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  briefcase: Briefcase,
  menu: Menu,
  settings: Settings,
  moon: Moon,
  sun: Sun,
  history: History,
  exchange: ArrowRightLeft,
  chevronDown: ChevronDown,
  sparkles: Sparkles,
  bot: Bot,
  chat: MessageSquare,
  send: Send,
  close: CloseIcon,
  search: Search,
  arrowRight: ArrowRight,
  brain: Brain,
  cpu: Cpu,
  calculator: Calculator
};

const Icon = memo(({
  name,
  color = "currentColor",
  className = "w-6 h-6",
  size,
  ...props
}) => {
  const IconComponent = icons[name];

  if (!IconComponent) return null;

  return (
    <IconComponent
      color={color}
      size={size}
      className={className}
      strokeWidth={2}
      {...props}
    />
  );
});

Icon.displayName = 'Icon';

export default Icon;
