import React, { useState } from 'react';
import { Item, Room, ItemStatus, STATUS_LABELS, STATUS_COLORS } from '../types';

interface StatusViewProps {
  items: Item[];
  rooms: Room[];
  onEditItem: (item: Item) => void;
  onDeleteItem: (id: string) => void;
  onMoveItem: (itemId: string, roomId: string | null) => void;
}

const STATUS_ORDER: ItemStatus[] = [
  'keep_canada',
  'transfer_italy',
  'to_sell',
  'to_give',
  'unknown',
];

export default function StatusView({
  items,
  rooms,
  onEditItem,
  onDeleteItem,
  onMoveItem,
}: StatusViewProps) {
  const [visibleStatuses, setVisibleStatuses] = useState<Set<ItemStatus>>(
    new Set(STATUS_ORDER)
  );

  function toggleStatus(status: ItemStatus) {
    setVisibleStatuses((prev) => {
      const next = new Set(prev);
      next.has(status) ? next.delete(status) : next.add(status);
      return next;
    });
  }

  function selectAll() {
    setVisibleStatuses(new Set(STATUS_ORDER));
  }

  function selectNone() {
    setVisibleStatuses(new Set());
  }

  const activeStatuses = STATUS_ORDER.filter((s) => visibleStatuses.has(s));
  const filteredItems = items.filter((i) => visibleStatuses.has(i.status));

  function getRoomLabel(roomId: string | null): string {
    if (!roomId) return '— Non classé —';
    const r = rooms.find((r) => r.id === roomId);
    return r ? `${r.emoji} ${r.name}` : '—';
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="status-view" id="print-area">

      {/* ── Controls bar (hidden on print) ── */}
      <div className="status-view-header no-print">
        <div>
          <h2>Par statut</h2>
          <span className="header-sub">
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} affichés
          </span>
        </div>
        <button className="btn-print btn" onClick={handlePrint}>
          🖨️ Imprimer / PDF
        </button>
      </div>

      {/* ── Status filter toggles (hidden on print) ── */}
      <div className="status-filter no-print">
        <span className="status-filter-label">Afficher :</span>
        <div className="status-toggles">
          {STATUS_ORDER.map((status) => {
            const active = visibleStatuses.has(status);
            const count = items.filter((i) => i.status === status).length;
            return (
              <button
                key={status}
                className={`status-toggle-btn ${active ? 'active' : ''}`}
                style={
                  active
                    ? {
                        background: STATUS_COLORS[status] + '20',
                        borderColor: STATUS_COLORS[status],
                        color: STATUS_COLORS[status],
                      }
                    : {}
                }
                onClick={() => toggleStatus(status)}
              >
                {active ? '✓ ' : ''}{STATUS_LABELS[status]}
                <span className="toggle-count">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="status-filter-quicklinks">
          <button className="btn-link" onClick={selectAll}>Tous</button>
          <span>·</span>
          <button className="btn-link" onClick={selectNone}>Aucun</button>
        </div>
      </div>

      {/* ── Print title (only visible on print) ── */}
      <div className="print-only print-date" style={{ marginBottom: 16 }}>
        Inventaire Maison — Par statut ({activeStatuses.map((s) => STATUS_LABELS[s]).join(', ')}) — imprimé le{' '}
        {new Date().toLocaleDateString('fr-CA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </div>

      {/* ── Summary badges ── */}
      {activeStatuses.length > 0 && (
        <div className="detail-summary">
          {activeStatuses.map((status) => {
            const count = items.filter((i) => i.status === status).length;
            return (
              <span
                key={status}
                className="summary-badge"
                style={{
                  background: STATUS_COLORS[status] + '18',
                  color: STATUS_COLORS[status],
                  borderColor: STATUS_COLORS[status] + '44',
                  opacity: count === 0 ? 0.4 : 1,
                }}
              >
                {STATUS_LABELS[status]} : <strong>{count}</strong>
              </span>
            );
          })}
        </div>
      )}

      {/* ── Groups ── */}
      {activeStatuses.length === 0 ? (
        <p className="empty-hint">Sélectionnez au moins un statut à afficher.</p>
      ) : (
        activeStatuses.map((status) => {
          const group = items.filter((i) => i.status === status);
          return (
            <div key={status} className="detail-group">
              <div
                className="detail-group-header"
                style={{ borderColor: STATUS_COLORS[status] }}
              >
                <span
                  className="detail-group-dot"
                  style={{ background: STATUS_COLORS[status] }}
                />
                <span className="detail-group-label">{STATUS_LABELS[status]}</span>
                <span className="detail-group-count">{group.length}</span>
              </div>

              {group.length === 0 ? (
                <p className="empty-hint" style={{ padding: '10px 0' }}>
                  Aucun item avec ce statut.
                </p>
              ) : (
                <table className="detail-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nom</th>
                      <th>Description</th>
                      <th>Pièce</th>
                      <th className="no-print">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="td-num">{idx + 1}</td>
                        <td className="td-name">{item.name}</td>
                        <td className="td-desc">{item.description || '—'}</td>
                        <td className="td-room">{getRoomLabel(item.roomId)}</td>
                        <td className="td-actions no-print">
                          <div className="table-actions">
                            <select
                              className="item-move-select"
                              value={item.roomId ?? ''}
                              onChange={(e) =>
                                onMoveItem(item.id, e.target.value || null)
                              }
                              title="Déplacer"
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
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
