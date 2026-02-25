import React from 'react';
import { Item, Room, STATUS_LABELS, STATUS_COLORS } from '../types';

interface ItemCardProps {
  item: Item;
  rooms: Room[];
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
  onMove: (itemId: string, roomId: string | null) => void;
}

export default function ItemCard({ item, rooms, onEdit, onDelete, onMove }: ItemCardProps) {
  const color = STATUS_COLORS[item.status];

  return (
    <div className="item-card">
      <div className="item-card-bar" style={{ background: color }} />
      <div className="item-card-body">
        <div className="item-card-top">
          <span className="item-name">{item.name}</span>
          <span className="item-badge" style={{ background: color + '22', color }}>
            {STATUS_LABELS[item.status]}
          </span>
        </div>
        {item.description && (
          <p className="item-desc">{item.description}</p>
        )}
        <div className="item-card-actions">
          <select
            className="item-move-select"
            value={item.roomId ?? ''}
            onChange={(e) => onMove(item.id, e.target.value || null)}
            title="Déplacer vers une pièce"
          >
            <option value="">— Non classé —</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.emoji} {r.name}
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
