import React, { useState } from 'react';
import { useInventory } from './context/InventoryContext';
import { Item, Room, ItemStatus } from './types';
import ItemModal from './components/ItemModal';
import RoomModal from './components/RoomModal';
import RoomCard from './components/RoomCard';
import ItemCard from './components/ItemCard';
import RoomDetailView from './components/RoomDetailView';
import StatusView from './components/StatusView';
import AllRoomsPrintView from './components/AllRoomsPrintView';

type View = 'all' | 'unclassified' | 'detail' | 'status' | 'print-all';

export default function App() {
  const {
    items,
    rooms,
    loaded,
    addItem,
    updateItem,
    deleteItem,
    moveItemToRoom,
    addRoom,
    updateRoom,
    deleteRoom,
  } = useInventory();

  const [view, setView] = useState<View>('all');
  const [focusedRoomId, setFocusedRoomId] = useState<string | null>(null);
  const [detailRoomId, setDetailRoomId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Item modal state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [defaultRoomId, setDefaultRoomId] = useState<string | null>(null);

  // Room modal state
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  if (!loaded) {
    return (
      <div className="app-loading">
        <span>Chargement de l'inventaire…</span>
      </div>
    );
  }

  // ------ Item handlers ------
  function openAddItem(roomId: string | null = null) {
    setEditingItem(null);
    setDefaultRoomId(roomId);
    setItemModalOpen(true);
  }

  function openEditItem(item: Item) {
    setEditingItem(item);
    setDefaultRoomId(item.roomId);
    setItemModalOpen(true);
  }

  function handleSaveItem(data: Omit<Item, 'id' | 'createdAt'>) {
    if (editingItem) {
      updateItem(editingItem.id, data);
    } else {
      addItem(data);
    }
  }

  function changeItemStatus(itemId: string, status: ItemStatus) {
    updateItem(itemId, { status });
  }

  function changeItemSoldAmount(itemId: string, amount: number | undefined) {
    updateItem(itemId, { soldAmount: amount });
  }

  // ------ Room handlers ------
  function openAddRoom() {
    setEditingRoom(null);
    setRoomModalOpen(true);
  }

  function openEditRoom(room: Room) {
    setEditingRoom(room);
    setRoomModalOpen(true);
  }

  function handleSaveRoom(name: string, emoji: string) {
    if (editingRoom) {
      updateRoom(editingRoom.id, name, emoji);
    } else {
      addRoom(name, emoji);
    }
  }

  function toggleFocusRoom(roomId: string) {
    setFocusedRoomId((prev) => (prev === roomId ? null : roomId));
  }

  // ------ Data ------
  const searchLower = search.trim().toLowerCase();
  const filteredItems = searchLower
    ? items.filter(
        (i) =>
          i.name.toLowerCase().includes(searchLower) ||
          i.description.toLowerCase().includes(searchLower)
      )
    : items;
  const unclassified = filteredItems.filter((i) => i.roomId === null);

  // Summary stats
  const total = items.length;

  return (
    <div className="app">
      {/* ===== HEADER ===== */}
      <header className="app-header">
        <div className="header-left">
          <span className="header-logo">🏠</span>
          <div>
            <h1>Inventaire Maison</h1>
            <span className="header-sub">{total} item{total !== 1 ? 's' : ''} au total</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => openAddItem()}>
            ＋ Ajouter un item
          </button>
          <button className="btn btn-secondary" onClick={openAddRoom}>
            ＋ Pièce
          </button>
        </div>
      </header>

      {/* ===== NAV ===== */}
      <nav className="app-nav">
        <button
          className={`nav-btn ${view === 'all' ? 'active' : ''}`}
          onClick={() => setView('all')}
        >
          🏠 Toutes les pièces
        </button>
        <button
          className={`nav-btn ${view === 'unclassified' ? 'active' : ''}`}
          onClick={() => setView('unclassified')}
        >
          📋 Non classés
          {unclassified.length > 0 && (
            <span className="nav-badge">{unclassified.length}</span>
          )}
        </button>
        <button
          className={`nav-btn ${view === 'detail' ? 'active' : ''}`}
          onClick={() => setView('detail')}
        >
          🔍 Pièce en détail
        </button>
        <button
          className={`nav-btn ${view === 'status' ? 'active' : ''}`}
          onClick={() => setView('status')}
        >
          🏷️ Par statut
        </button>
        <button
          className={`nav-btn ${view === 'print-all' ? 'active' : ''}`}
          onClick={() => setView('print-all')}
        >
          🖨️ Toutes les pièces
        </button>
        <div className="nav-search">
          <span className="nav-search-icon">🔎</span>
          <input
            className="nav-search-input"
            type="text"
            placeholder="Rechercher un item…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="nav-search-clear" onClick={() => setSearch('')} title="Effacer">✕</button>
          )}
        </div>
      </nav>

      {/* ===== MAIN ===== */}
      <main className="app-main">
        {view === 'unclassified' && (
          <section className="section">
            <div className="section-header">
              <h2>📋 Items non classés</h2>
              <button className="btn btn-primary" onClick={() => openAddItem(null)}>
                ＋ Ajouter
              </button>
            </div>
            {unclassified.length === 0 ? (
              <p className="empty-hint">{search ? 'Aucun résultat pour cette recherche.' : 'Aucun item non classé. Bravo !'}</p>
            ) : (
              <div className="item-list">
                {unclassified.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    rooms={rooms}
                    onEdit={openEditItem}
                    onDelete={deleteItem}
                    onStatusChange={changeItemStatus}
                    onSoldAmountChange={changeItemSoldAmount}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {view === 'status' && (
          <StatusView
            items={filteredItems}
            rooms={rooms}
            onEditItem={openEditItem}
            onDeleteItem={deleteItem}
            onStatusChange={changeItemStatus}
          />
        )}

        {view === 'print-all' && (
          <AllRoomsPrintView
            rooms={rooms}
            items={filteredItems}
          />
        )}

        {view === 'detail' && (
          <RoomDetailView
            rooms={rooms}
            items={filteredItems}
            selectedRoomId={detailRoomId}
            onSelectRoom={setDetailRoomId}
            onEditItem={openEditItem}
            onDeleteItem={deleteItem}
            onStatusChange={changeItemStatus}
            onAddItem={openAddItem}
          />
        )}

        {view === 'all' && (
          <>
            {focusedRoomId && (
              <div className="focus-hint">
                <span>Pièce en avant : <strong>{rooms.find(r => r.id === focusedRoomId)?.emoji} {rooms.find(r => r.id === focusedRoomId)?.name}</strong></span>
                <button className="btn btn-secondary btn-sm" onClick={() => setFocusedRoomId(null)}>
                  Réinitialiser la vue
                </button>
              </div>
            )}
            <div className={`rooms-grid ${focusedRoomId ? 'has-focused' : ''}`}>
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  items={filteredItems.filter((i) => i.roomId === room.id)}
                  allRooms={rooms}
                  focused={focusedRoomId === room.id}
                  onFocus={() => toggleFocusRoom(room.id)}
                  onAddItem={openAddItem}
                  onEditItem={openEditItem}
                  onDeleteItem={deleteItem}
                  onStatusChange={changeItemStatus}
                  onSoldAmountChange={changeItemSoldAmount}
                  onEditRoom={openEditRoom}
                  onDeleteRoom={deleteRoom}
                />
              ))}
              {rooms.length === 0 && (
                <div className="empty-state">
                  <p>Aucune pièce créée.</p>
                  <button className="btn btn-primary" onClick={openAddRoom}>
                    Créer une pièce
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ===== MODALS ===== */}
      <ItemModal
        open={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        onSave={handleSaveItem}
        rooms={rooms}
        initialData={editingItem}
        defaultRoomId={defaultRoomId}
      />
      <RoomModal
        open={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        onSave={handleSaveRoom}
        initialData={editingRoom}
      />
    </div>
  );
}
