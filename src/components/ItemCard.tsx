import React from 'react';
import { Item, Room, ItemStatus, STATUS_LABELS, STATUS_COLORS } from '../types';

const STATUS_ORDER: ItemStatus[] = [
  'keep_canada',
  'transfer_italy',
  'to_sell',
  'to_give',
  'unknown',
];

interface ItemCardProps {
  item: Item;
  rooms: Room[];
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
  onStatusChange: (itemId: string, status: ItemStatus) => void;
}

export default function ItemCard({ item, rooms, onEdit, onDelete, onStatusChange }: ItemCardProps) {
  const color = STATUS_COLORS[item.status];

  return (
    <div className="item-card">
      <div className="item-card-bar" style={{ background: color }} />
      <div className="item-card-body">
        <div className="item-card-top">
          <span className="item-name">{item.name}</span>
        </div>
        {item.description && (
          <p className="item-desc">{item.description}</p>
        )}
        <div className="item-card-actions">
          <select
            className="item-move-select"
            value={item.status}
            onChange={(e) => onStatusChange(item.id, e.target.value as ItemStatus)}
            title="Changer le statut"
            style={{ borderColor: color, color }}
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <button
            className="btn-icon"
            onClick={() => onEdit(item)}
            title="Modifier"
          >
            ✏️
          </button>
          <button
            className="btn-icon btn-danger"
            onClick={() => {
              if (confirm(`Supprimer "${item.name}" ?`)) onDelete(item.id);
            }}
            title="Supprimer"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
