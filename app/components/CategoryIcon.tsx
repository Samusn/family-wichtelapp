import {
  Bath,
  BookOpen,
  Clapperboard,
  CreditCard,
  Dices,
  Dumbbell,
  Gamepad2,
  Gem,
  Gift,
  GraduationCap,
  Lamp,
  Luggage,
  Mountain,
  Music,
  Palette,
  PawPrint,
  Shirt,
  Smartphone,
  Sparkles,
  Sprout,
  Ticket,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  books: BookOpen,
  experiences: Ticket,
  travel: Luggage,
  tech: Smartphone,
  gaming: Gamepad2,
  games: Dices,
  clothing: Shirt,
  accessories: Gem,
  beauty: Sparkles,
  wellness: Bath,
  home: Lamp,
  garden: Sprout,
  fitness: Dumbbell,
  outdoor: Mountain,
  creative: Palette,
  music: Music,
  movies: Clapperboard,
  learning: GraduationCap,
  pets: PawPrint,
  vouchers: CreditCard,
};

export default function CategoryIcon({
  categoryId,
  className,
}: {
  categoryId: string;
  className?: string;
}) {
  const Icon = ICONS[categoryId] ?? Gift;
  return <Icon className={className} aria-hidden />;
}
