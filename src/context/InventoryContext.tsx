import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Item, Room, DEFAULT_ROOMS } from '../types';

interface InventoryContextType {
  items: Item[];
  rooms: Room[];
  loaded: boolean;
  addItem: (data: Omit<Item, 'id' | 'createdAt'>) => void;
  updateItem: (id: string, data: Partial<Omit<Item, 'id' | 'createdAt'>>) => void;
  deleteItem: (id: string) => void;
  moveItemToRoom: (itemId: string, roomId: string | null) => void;
  addRoom: (name: string, emoji: string) => void;
  updateRoom: (id: string, name: string, emoji: string) => void;
  deleteRoom: (id: string) => void;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

const API = '/api/inventory';

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [rooms, setRooms] = useState<Room[]>(DEFAULT_ROOMS);
  const [loaded, setLoaded] = useState(false);
  const loadedRef = useRef(false);

  // Load from server on mount
  useEffect(() => {
    fetch(API)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setRooms(data.rooms?.length ? data.rooms : DEFAULT_ROOMS);
        loadedRef.current = true;
        setLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to load inventory from server:', err);
        loadedRef.current = true;
        setLoaded(true);
      });
  }, []);

  // Save to server whenever data changes (skip initial load)
  useEffect(() => {
    if (!loadedRef.current) return;
    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, rooms }),
    }).catch((err) => console.error('Failed to save inventory:', err));
  }, [items, rooms]);

  const addItem = useCallback(
    (data: Omit<Item, 'id' | 'createdAt'>) => {
      const newItem: Item = {
        ...data,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      setItems((prev) => [...prev, newItem]);
    },
    []
  );

  const updateItem = useCallback(
    (id: string, data: Partial<Omit<Item, 'id' | 'createdAt'>>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...data } : item))
      );
    },
    []
  );

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const moveItemToRoom = useCallback((itemId: string, roomId: string | null) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, roomId } : item))
    );
  }, []);

  const addRoom = useCallback((name: string, emoji: string) => {
    const newRoom: Room = { id: uuidv4(), name, emoji };
    setRooms((prev) => [...prev, newRoom]);
  }, []);

  const updateRoom = useCallback((id: string, name: string, emoji: string) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, name, emoji } : r))
    );
  }, []);

  const deleteRoom = useCallback((id: string) => {
    // Move all items from deleted room to "unclassified"
    setItems((prev) =>
      prev.map((item) => (item.roomId === id ? { ...item, roomId: null } : item))
    );
    setRooms((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <InventoryContext.Provider
      value={{
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
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory(): InventoryContextType {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used inside InventoryProvider');
  return ctx;
}
