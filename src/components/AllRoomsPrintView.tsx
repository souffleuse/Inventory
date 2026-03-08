import React from 'react';
import { Item, Room, STATUS_LABELS, STATUS_COLORS, ItemStatus } from '../types';

const STATUS_ORDER: ItemStatus[] = [
  'keep_canada',
  'transfer_italy',
  'to_sell',
  'to_give',
  'unknown',
];

interface AllRoomsPrintViewProps {
  rooms: Room[];
  items: Item[];
}

export default function AllRoomsPrintView({ rooms, items }: AllRoomsPrintViewProps) {
  function handlePrint() {
    window.print();
  }

  const unclassified = items.filter((i) => i.roomId === null);
  const totalItems = items.length;

  // Build list of rooms that have items
  const roomsWithItems = rooms
    .map((room) => ({
      room,
      items: items.filter((i) => i.roomId === room.id),
    }))
    .filter(({ items }) => items.length > 0);

  return (
    <div className="detail-view">
      {/* Controls — hidden on print */}
      <div className="detail-controls no-print">
        <div className="detail-room-selector" style={{ flex: 1 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>
            Toutes les pièces — {rooms.length} pièce{rooms.length !== 1 ? 's' : ''},{' '}
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="detail-actions">
          <button className="btn btn-print" onClick={handlePrint}>
            🖨️ Imprimer / PDF — Toutes les pièces
          </button>
        </div>
      </div>

      {/* Print area */}
      <div className="print-area" id="print-area">
        {/* Print header (visible only when printing) */}
        <div className="print-header">
          <div className="print-title">
            <span className="print-emoji">🏠</span>
            <h2>Inventaire Maison — Toutes les pièces</h2>
          </div>
          <div className="print-meta no-print">
            <span>
              {rooms.length} pièce{rooms.length !== 1 ? 's' : ''} · {totalItems} item{totalItems !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="print-only print-date">
            Inventaire Maison — Toutes les pièces — imprimé le{' '}
            {new Date().toLocaleDateString('fr-CA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Summary table (screen only) */}
        <div className="detail-summary no-print">
          {STATUS_ORDER.map((status) => {
            const count = items.filter((i) => i.status === status).length;
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

        {totalItems === 0 ? (
          <p className="empty-hint">Aucun item dans l'inventaire.</p>
        ) : (
          <>
            {/* One section per room */}
            {roomsWithItems.map(({ room, items: roomItems }, roomIdx) => {
              const grouped = STATUS_ORDER.reduce<Record<string, Item[]>>((acc, status) => {
                const group = roomItems.filter((i) => i.status === status);
                if (group.length > 0) acc[status] = group;
                return acc;
              }, {});

              return (
                <div
                  key={room.id}
                  className="all-rooms-section"
                  style={{ pageBreakBefore: roomIdx > 0 ? 'auto' : 'avoid' }}
                >
                  {/* Room title */}
                  <div className="all-rooms-room-header">
                    <span className="all-rooms-room-emoji">{room.emoji}</span>
                    <h3 className="all-rooms-room-name">{room.name}</h3>
                    <span className="all-rooms-room-count">
                      {roomItems.length} item{roomItems.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Status badges for this room */}
                  <div className="detail-summary" style={{ marginBottom: 10 }}>
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
                            fontSize: 11,
                          }}
                        >
                          {STATUS_LABELS[status]} : <strong>{count}</strong>
                        </span>
                      );
                    })}
                  </div>

                  {/* Items grouped by status */}
                  {Object.entries(grouped).map(([status, groupItems]) => (
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
                          </tr>
                        </thead>
                        <tbody>
                          {groupItems.map((item, idx) => (
                            <tr key={item.id}>
                              <td className="td-num">{idx + 1}</td>
                              <td className="td-name">{item.name}</td>
                              <td className="td-desc">{item.description || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Unclassified items */}
            {unclassified.length > 0 && (
              <div className="all-rooms-section">
                <div className="all-rooms-room-header">
                  <span className="all-rooms-room-emoji">📋</span>
                  <h3 className="all-rooms-room-name">Non classés</h3>
                  <span className="all-rooms-room-count">
                    {unclassified.length} item{unclassified.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <table className="detail-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nom</th>
                      <th>Description</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unclassified.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="td-num">{idx + 1}</td>
                        <td className="td-name">{item.name}</td>
                        <td className="td-desc">{item.description || '—'}</td>
                        <td>
                          <span
                            style={{
                              color: STATUS_COLORS[item.status],
                              fontWeight: 600,
                              fontSize: 12,
                            }}
                          >
                            {STATUS_LABELS[item.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
