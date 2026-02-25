import React, { useState, useEffect } from 'react';
import { Item, ItemStatus, Room, STATUS_LABELS } from '../types';

interface ItemModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Item, 'id' | 'createdAt'>) => void;
  rooms: Room[];
  initialData?: Item | null;
  defaultRoomId?: string | null;
}

const EMPTY: Omit<Item, 'id' | 'createdAt'> = {
  name: '',
  description: '',
  roomId: null,
  status: 'unknown',
};

export default function ItemModal({
  open,
  onClose,
  onSave,
  rooms,
  initialData,
  defaultRoomId,
}: ItemModalProps) {
  const [form, setForm] = useState({ ...EMPTY });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          name: initialData.name,
          description: initialData.description,
          roomId: initialData.roomId,
          status: initialData.status,
        });
      } else {
        setForm({ ...EMPTY, roomId: defaultRoomId ?? null });
      }
    }
  }, [open, initialData, defaultRoomId]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialData ? 'Modifier l\'item' : 'Ajouter un item'}</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Fermer">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Nom *
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Canapé gris"
              autoFocus
              required
            />
          </label>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Détails, marque, couleur..."
              rows={3}
            />
          </label>

          <label>
            Pièce
            <select
              value={form.roomId ?? ''}
              onChange={(e) =>
                setForm({ ...form, roomId: e.target.value || null })
              }
            >
              <option value="">— Non classé —</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.emoji} {r.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Statut
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as ItemStatus })
              }
            >
              {(Object.keys(STATUS_LABELS) as ItemStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              {initialData ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
