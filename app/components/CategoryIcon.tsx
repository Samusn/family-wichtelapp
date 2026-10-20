import {
  Bath,
  BookOpen,
  Candy,
  ChefHat,
  Clapperboard,
  CreditCard,
  Dices,
  Dumbbell,
  Gamepad2,
  Gem,
  Gift,
  GraduationCap,
  HandHeart,
  Lamp,
  Luggage,
  Mountain,
  Music,
  Palette,
  PawPrint,
  Sandwich,
  Shirt,
  Smartphone,
  Sparkles,
  Sprout,
  Ticket,
  Wine,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  books: BookOpen,
  sweets: Candy,
  delicatessen: Sandwich,
  drinks: Wine,
  cooking: ChefHat,
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
  handmade: HandHeart,
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
