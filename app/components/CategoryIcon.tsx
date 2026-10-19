import {
  BookOpen,
  Candy,
  ChefHat,
  Dices,
  Gift,
  HandHeart,
  Lamp,
  Mountain,
  Music,
  Palette,
  Shirt,
  Smartphone,
  Sparkles,
  Ticket,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  books: BookOpen,
  sweets: Candy,
  experiences: Ticket,
  tech: Smartphone,
  games: Dices,
  clothing: Shirt,
  wellness: Sparkles,
  kitchen: ChefHat,
  home: Lamp,
  sports: Mountain,
  creative: Palette,
  media: Music,
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
