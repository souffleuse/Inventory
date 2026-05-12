import React, { useState, useEffect } from 'react';
import { Item, Room, ItemStatus, STATUS_LABELS, STATUS_COLORS } from '../types';

const STATUS_ORDER: ItemStatus[] = [
  'keep_canada',
  'transfer_italy',
  'to_sell',
  'to_give',
  'unknown',
  'sold',
];

interface ItemCardProps {
  item: Item;
  rooms: Room[];
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
  onStatusChange: (itemId: string, status: ItemStatus) => void;
  onSoldAmountChange: (itemId: string, amount: number | undefined) => void;
}

export default function ItemCard({ item, rooms, onEdit, onDelete, onStatusChange, onSoldAmountChange }: ItemCardProps) {
  const color = STATUS_COLORS[item.status];
  const [soldAmountInput, setSoldAmountInput] = useState<string>(
    item.soldAmount !== undefined ? String(item.soldAmount) : ''
  );
  const [showSoldPopup, setShowSoldPopup] = useState(false);
  const [pendingAmount, setPendingAmount] = useState<string>('');

  useEffect(() => {
    setSoldAmountInput(item.soldAmount !== undefined ? String(item.soldAmount) : '');
  }, [item.soldAmount]);

  function handleStatusChange(newStatus: ItemStatus) {
    if (newStatus === 'sold' && item.status !== 'sold') {
      setPendingAmount('');
      setShowSoldPopup(true);
    } else {
      onStatusChange(item.id, newStatus);
    }
  }

  function confirmSold() {
    onStatusChange(item.id, 'sold');
    const val = parseFloat(pendingAmount);
    onSoldAmountChange(item.id, isNaN(val) ? undefined : val);
    setShowSoldPopup(false);
  }

  function cancelSoldPopup() {
    setShowSoldPopup(false);
  }

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
        <div className="item-card-actions" style={{ position: 'relative' }}>
          <select
            className="item-move-select"
            value={item.status}
            onChange={(e) => handleStatusChange(e.target.value as ItemStatus)}
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

          {showSoldPopup && (
            <div className="sold-popup">
              <span className="sold-popup-label">Montant vendu</span>
              <input
                className="sold-popup-input"
                type="number"
                min="0"
                step="0.01"
                value={pendingAmount}
                onChange={(e) => setPendingAmount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmSold();
                  if (e.key === 'Escape') cancelSoldPopup();
                }}
                placeholder="0.00"
                autoFocus
              />
              <span className="sold-popup-currency">$</span>
              <button className="btn-icon sold-popup-confirm" onClick={confirmSold} title="Confirmer">✓</button>
              <button className="btn-icon sold-popup-cancel" onClick={cancelSoldPopup} title="Annuler">✕</button>
            </div>
          )}
        </div>
        {item.status === 'sold' && (
          <div className="item-sold-amount">
            <label>
              Montant vendu
              <input
                type="number"
                min="0"
                step="0.01"
                value={soldAmountInput}
                onChange={(e) => setSoldAmountInput(e.target.value)}
                onBlur={() => {
                  const val = parseFloat(soldAmountInput);
                  onSoldAmountChange(item.id, isNaN(val) ? undefined : val);
                }}
                placeholder="0.00"
              />
              <span className="item-sold-currency">$</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
