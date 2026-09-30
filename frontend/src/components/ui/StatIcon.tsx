import {
  Award,
  BriefcaseBusiness,
  CalendarDays,
  ChartColumnIncreasing,
  Factory,
  Globe,
  Leaf,
  type LucideIcon,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react';

/** Icon names an admin can choose for a home-page figure (keep in sync with backend STAT_ICONS). */
export const STAT_ICON_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Automatic' },
  { value: 'calendar', label: 'Calendar (years)' },
  { value: 'target', label: 'Target (projects, Six Sigma)' },
  { value: 'shield', label: 'Shield (systems, ISO, audits)' },
  { value: 'globe', label: 'Globe (countries, international)' },
  { value: 'award', label: 'Award (recognition)' },
  { value: 'factory', label: 'Factory (manufacturing)' },
  { value: 'users', label: 'People (teams, suppliers)' },
  { value: 'chart', label: 'Chart (results, PPM)' },
  { value: 'leaf', label: 'Leaf (sustainability)' },
  { value: 'briefcase', label: 'Briefcase (roles, business)' },
];

const ICONS: Record<string, LucideIcon> = {
  calendar: CalendarDays,
  target: Target,
  shield: ShieldCheck,
  globe: Globe,
  award: Award,
  factory: Factory,
  users: Users,
  chart: ChartColumnIncreasing,
  leaf: Leaf,
  briefcase: BriefcaseBusiness,
};

/** Picks an icon from the figure's label when none was chosen in the dashboard. */
function guess(label: string): string {
  const text = label.toLowerCase();
  if (/\b(year|years|experience|since)\b/.test(text)) return 'calendar';
  if (/sigma|black belt|project|kaizen/.test(text)) return 'target';
  if (/iso|management system|certif|audit|compliance|standard/.test(text)) return 'shield';
  if (/countr|international|global|region|world/.test(text)) return 'globe';
  if (/award|recogni|honou?r/.test(text)) return 'award';
  if (/ppm|defect|reduc|result|improv|saving/.test(text)) return 'chart';
  if (/supplier|team|people|member/.test(text)) return 'users';
  if (/water|energy|sustain|csr|carbon/.test(text)) return 'leaf';
  if (/plant|factory|manufactur|industr/.test(text)) return 'factory';
  return 'briefcase';
}

export function StatIcon({ icon, label, className }: { icon?: string; label: string; className?: string }) {
  const Icon = ICONS[icon || guess(label)] ?? BriefcaseBusiness;
  return <Icon aria-hidden className={className} strokeWidth={1.5} />;
}
