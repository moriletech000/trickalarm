import {
  Coffee,
  Wine,
  Armchair,
  Laptop,
  Keyboard,
  Mouse,
  BookOpen,
  Backpack,
  Smartphone,
  Tv,
  Clock,
  Scissors,
  Brush,
  Utensils,
  UtensilsCrossed,
  Soup,
  Umbrella,
  ShoppingBag,
  Briefcase,
  Footprints,
} from 'lucide-react';

export const objectIcons: Record<string, any> = {
  'cup': Coffee,
  'bottle': Wine,
  'chair': Armchair,
  'laptop': Laptop,
  'keyboard': Keyboard,
  'mouse': Mouse,
  'book': BookOpen,
  'backpack': Backpack,
  'cell phone': Smartphone,
  'remote': Tv,
  'clock': Clock,
  'scissors': Scissors,
  'toothbrush': Brush,
  'spoon': Utensils,
  'fork': UtensilsCrossed,
  'bowl': Soup,
  'umbrella': Umbrella,
  'handbag': ShoppingBag,
  'suitcase': Briefcase,
  'shoe': Footprints,
};

export function getObjectIcon(objectName: string) {
  const IconComponent = objectIcons[objectName.toLowerCase()];
  return IconComponent || Coffee; // Default to Coffee icon
}
