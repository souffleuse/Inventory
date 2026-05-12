export type ItemStatus =
  | 'unknown'
  | 'to_sell'
  | 'to_give'
  | 'keep_canada'
  | 'transfer_italy'
  | 'sold';

export const STATUS_LABELS: Record<ItemStatus, string> = {
  unknown: 'Ne sait pas',
  to_sell: 'À vendre',
  to_give: 'À donner',
  keep_canada: 'Garder Canada',
  transfer_italy: 'Transférer Italie',
  sold: 'Vendu',
};

export const STATUS_COLORS: Record<ItemStatus, string> = {
  unknown: '#94a3b8',
  to_sell: '#f59e0b',
  to_give: '#10b981',
  keep_canada: '#3b82f6',
  transfer_italy: '#8b5cf6',
  sold: '#ef4444',
};

export interface Item {
  id: string;
  name: string;
  description: string;
  roomId: string | null; // null = non classé
  status: ItemStatus;
  soldAmount?: number;
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  emoji: string;
}

export const DEFAULT_ROOMS: Room[] = [
  { id: 'salon', name: 'Salon', emoji: '🛋️' },
  { id: 'cuisine', name: 'Cuisine', emoji: '🍳' },
  { id: 'chambre1', name: 'Chambre principale', emoji: '🛏️' },
  { id: 'chambre2', name: 'Chambre 2', emoji: '🛏️' },
  { id: 'bureau', name: 'Bureau', emoji: '💻' },
  { id: 'sdb', name: 'Salle de bain', emoji: '🚿' },
  { id: 'garage', name: 'Cave / Garage', emoji: '🔧' },
  { id: 'exterieur', name: 'Extérieur', emoji: '🌿' },
];
