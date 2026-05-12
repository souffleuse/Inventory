import React, { useRef, useState } from 'react';
import { Item, Room, STATUS_LABELS, STATUS_COLORS, ItemStatus } from '../types';

const STATUS_ORDER_ALL: ItemStatus[] = [
  'keep_canada',
  'transfer_italy',
  'to_sell',
  'to_give',
  'unknown',
  'sold',
];

interface RoomDetailViewProps {
  rooms: Room[];
  items: Item[];
  selectedRoomId: string | null;
  onSelectRoom: (id: string) => void;
  onEditItem: (item: Item) => void;
  onDeleteItem: (id: string) => void;
  onStatusChange: (itemId: string, status: ItemStatus) => void;
  onSoldAmountChange: (itemId: string, amount: number | undefined) => void;
  onAddItem: (roomId: string) => void;
}

const STATUS_ORDER: ItemStatus[] = [
  'keep_canada',
  'transfer_italy',
  'to_sell',
  'to_give',
  'unknown',
  'sold',
];

export default function RoomDetailView({
  rooms,
  items,
  selectedRoomId,
  onSelectRoom,
  onEditItem,
  onDeleteItem,
  onStatusChange,
  onSoldAmountChange,
  onAddItem,
}: RoomDetailViewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [soldPopup, setSoldPopup] = useState<{ itemId: string; amount: string } | null>(null);

  function handleStatusChange(itemId: string, newStatus: ItemStatus, currentStatus: ItemStatus) {
    if (newStatus === 'sold' && currentStatus !== 'sold') {
      setSoldPopup({ itemId, amount: '' });
    } else {
      onStatusChange(itemId, newStatus);
    }
  }

  function confirmSold() {
    if (!soldPopup) return;
    onStatusChange(soldPopup.itemId, 'sold');
    const val = parseFloat(soldPopup.amount);
    onSoldAmountChange(soldPopup.itemId, isNaN(val) ? undefined : val);
    setSoldPopup(null);
  }

  function cancelSold() {
    setSoldPopup(null);
  }

  const room = rooms.find((r) => r.id === selectedRoomId) ?? null;
  const roomItems = selectedRoomId
    ? items.filter((i) => i.roomId === selectedRoomId)
    : [];

  function handlePrint() {
    window.print();
  }

  // Group items by status
  const grouped = STATUS_ORDER.reduce<Record<string, Item[]>>((acc, status) => {
    const group = roomItems.filter((i) => i.status === status);
    if (group.length > 0) acc[status] = group;
    return acc;
  }, {});

  return (
    <div className="detail-view">
      {/* Controls - hidden on print */}
      <div className="detail-controls no-print">
        <div className="detail-room-selector">
          <label htmlFor="room-select">Pièce :</label>
          <select
            id="room-select"
            value={selectedRoomId ?? ''}
            onChange={(e) => onSelectRoom(e.target.value)}
          >
            <option value="" disabled>— Choisir une pièce —</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.emoji} {r.name}
              </option>
            ))}
          </select>
        </div>

        {room && (
          <div className="detail-actions">
            <button
              className="btn btn-primary"
              onClick={() => onAddItem(room.id)}
            >
              ＋ Ajouter un item
            </button>
            <button className="btn btn-print" onClick={handlePrint}>
              🖨️ Imprimer / PDF
            </button>
          </div>
        )}
      </div>

      {!room ? (
        <div className="empty-state">
          <p style={{ fontSize: 48 }}>🏠</p>
          <p>Sélectionnez une pièce pour afficher son contenu.</p>
        </div>
      ) : (
        /* Print area */
        <div className="print-area" ref={printRef} id="print-area">
          {/* Print header */}
          <div className="print-header">
            <div className="print-title">
              <span className="print-emoji">{room.emoji}</span>
              <h2>{room.name}</h2>
            </div>
            <div className="print-meta no-print">
              <span>{roomItems.length} item{roomItems.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="print-only print-date">
              Inventaire Maison — {room.emoji} {room.name} — imprimé le{' '}
              {new Date().toLocaleDateString('fr-CA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          {/* Summary badges */}
          <div className="detail-summary">
            {STATUS_ORDER.map((status) => {
              const count = roomItems.filter((i) => i.status === status).length;
              if (count === 0) return null;
              return (
                <span
                  key={status}
                  className="summary-badge"
                  style={{
                    background: STATUS_COLORS[status] + '18',
                    color: STATUS_COLORS[status],
                    borderColor: STATUS_COLORS[status] + '44',
                  }}
                >
                  {STATUS_LABELS[status]} : <strong>{count}</strong>
                </span>
              );
            })}
          </div>

          {/* Items grouped by status */}
          {roomItems.length === 0 ? (
            <p className="empty-hint">Aucun item dans cette pièce.</p>
          ) : (
            Object.entries(grouped).map(([status, groupItems]) => (
              <div key={status} className="detail-group">
                <div
                  className="detail-group-header"
                  style={{ borderColor: STATUS_COLORS[status as ItemStatus] }}
                >
                  <span
                    className="detail-group-dot"
                    style={{ background: STATUS_COLORS[status as ItemStatus] }}
                  />
                  <span className="detail-group-label">
                    {STATUS_LABELS[status as ItemStatus]}
                  </span>
                  <span className="detail-group-count">{groupItems.length}</span>
                </div>

                <table className="detail-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nom</th>
                      <th>Description</th>
                      <th className="no-print">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupItems.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="td-num">{idx + 1}</td>
                        <td className="td-name">{item.name}</td>
                        <td className="td-desc">{item.description || '—'}</td>
                        <td className="td-actions no-print">
                          <div className="table-actions">
                              <div style={{ position: 'relative' }}>
                                <select
                                  className="item-move-select"
                                  value={item.status}
                                  onChange={(e) =>
                                    handleStatusChange(item.id, e.target.value as ItemStatus, item.status)
                                  }
                                  title="Changer le statut"
                                  style={{ borderColor: STATUS_COLORS[item.status], color: STATUS_COLORS[item.status] }}
                                >
                                  {STATUS_ORDER_ALL.map((s) => (
                                    <option key={s} value={s}>
                                      {STATUS_LABELS[s]}
                                    </option>
                                  ))}
                                </select>
                                {soldPopup?.itemId === item.id && (
                                  <div className="sold-popup">
                                    <span className="sold-popup-label">Montant vendu</span>
                                    <input
                                      className="sold-popup-input"
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={soldPopup.amount}
                                      onChange={(e) => setSoldPopup({ ...soldPopup, amount: e.target.value })}
                                      onKeyDown={(e) => { if (e.key === 'Enter') confirmSold(); if (e.key === 'Escape') cancelSold(); }}
                                      placeholder="0.00"
                                      autoFocus
                                    />
                                    <span className="sold-popup-currency">$</span>
                                    <button className="btn-icon sold-popup-confirm" onClick={confirmSold} title="Confirmer">✓</button>
                                    <button className="btn-icon sold-popup-cancel" onClick={cancelSold} title="Annuler">✕</button>
                                  </div>
                                )}
                              </div>
                            <button
                              className="btn-icon"
                              onClick={() => onEditItem(item)}
                              title="Modifier"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-icon btn-danger"
                              onClick={() => {
                                if (confirm(`Supprimer "${item.name}" ?`))
                                  onDeleteItem(item.id);
                              }}
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
