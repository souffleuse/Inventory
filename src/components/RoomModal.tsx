import React, { useState, useEffect } from 'react';
import { Room } from '../types';

const EMOJIS = ['🛋️', '🍳', '🛏️', '💻', '🚿', '🔧', '🌿', '📦', '🧺', '🪴', '🍷', '🎮', '📚', '🏋️', '🧸'];

interface RoomModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, emoji: string) => void;
  initialData?: Room | null;
}

export default function RoomModal({ open, onClose, onSave, initialData }: RoomModalProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📦');

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? '');
      setEmoji(initialData?.emoji ?? '📦');
    }
  }, [open, initialData]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), emoji);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialData ? 'Modifier la pièce' : 'Nouvelle pièce'}</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Fermer">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Nom de la pièce *
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Grenier"
              autoFocus
              required
            />
          </label>
          <label>
            Icône
            <div className="emoji-picker">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className={`emoji-btn ${emoji === e ? 'selected' : ''}`}
                  onClick={() => setEmoji(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </label>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              {initialData ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
