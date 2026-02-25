import React from 'react';
import { Item, Room } from '../types';
import ItemCard from './ItemCard';

const MAX_VISIBLE = 5;

interface RoomCardProps {
  room: Room;
  items: Item[];
  allRooms: Room[];
  focused: boolean;
  onFocus: () => void;
  onAddItem: (roomId: string) => void;
  onEditItem: (item: Item) => void;
  onDeleteItem: (id: string) => void;
  onMoveItem: (itemId: string, roomId: string | null) => void;
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (id: string) => void;
}

export default function RoomCard({
  room,
  items,
  allRooms,
  focused,
  onFocus,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onMoveItem,
  onEditRoom,
  onDeleteRoom,
}: RoomCardProps) {
  const visibleItems = focused ? items : items.slice(0, MAX_VISIBLE);
  const hiddenCount = items.length - MAX_VISIBLE;

  return (
    <div className={`room-card ${focused ? 'room-card--focused' : ''}`}>
      <div className="room-card-header">
        <button
          className="room-focus-btn"
          onClick={onFocus}
          title={focused ? 'Affichage normal' : 'Voir tous les items'}
        >
          <span className="room-emoji">{room.emoji}</span>
          <span className="room-name">{room.name}</span>
          <span className="room-count">{items.length}</span>
          <span className="room-focus-icon">{focused ? '⊙' : '○'}</span>
        </button>
        <div className="room-header-actions">
          <button className="btn-icon" onClick={() => onAddItem(room.id)} title="Ajouter un item">
            ＋
          </button>
          <button className="btn-icon" onClick={() => onEditRoom(room)} title="Modifier la pièce">
            ✏️
          </button>
          <button
            className="btn-icon btn-danger"
            onClick={() => {
              if (confirm(`Supprimer la pièce "${room.name}" ? Les items seront mis en Non classé.`))
                onDeleteRoom(room.id);
            }}
            title="Supprimer la pièce"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="room-items">
        {items.length === 0 ? (
          <p className="empty-hint">Aucun item dans cette pièce.</p>
        ) : (
          <>
            {visibleItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                rooms={allRooms}
                onEdit={onEditItem}
                onDelete={onDeleteItem}
                onMove={onMoveItem}
              />
            ))}
            {!focused && hiddenCount > 0 && (
              <button className="room-show-more" onClick={onFocus}>
                + {hiddenCount} item{hiddenCount > 1 ? 's' : ''} de plus
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
