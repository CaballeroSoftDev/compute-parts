'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CrudOperations<T> {
  items: T[];
  create: (item: Omit<T, 'id' | 'createdAt'>) => void;
  update: (id: number, item: Partial<T>) => void;
  remove: (id: number) => void;
  getById: (id: number) => T | undefined;
}

export function useCrud<T extends { id: number; createdAt: string }>(
  initialItems: T[],
  storageKey: string,
  entityName: string
): CrudOperations<T> {
  const [items, setItems] = useState<T[]>(initialItems);
  const { toast } = useToast();

  const create = useCallback(
    (itemData: Omit<T, 'id' | 'createdAt'>) => {
      const newItem = {
        ...itemData,
        id: Math.max(...items.map((item) => item.id), 0) + 1,
        createdAt: new Date().toISOString().split('T')[0],
      } as T;

      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      localStorage.setItem(storageKey, JSON.stringify(updatedItems));

      toast({
        title: `${entityName} creado`,
        description: `El ${entityName.toLowerCase()} se ha creado exitosamente`,
      });
    },
    [items, storageKey, entityName, toast]
  );

  const update = useCallback(
    (id: number, itemData: Partial<T>) => {
      const updatedItems = items.map((item) => (item.id === id ? { ...item, ...itemData } : item));
      setItems(updatedItems);
      localStorage.setItem(storageKey, JSON.stringify(updatedItems));

      toast({
        title: `${entityName} actualizado`,
        description: `El ${entityName.toLowerCase()} se ha actualizado exitosamente`,
      });
    },
    [items, storageKey, entityName, toast]
  );

  const remove = useCallback(
    (id: number) => {
      const updatedItems = items.filter((item) => item.id !== id);
      setItems(updatedItems);
      localStorage.setItem(storageKey, JSON.stringify(updatedItems));

      toast({
        title: `${entityName} eliminado`,
        description: `El ${entityName.toLowerCase()} se ha eliminado exitosamente`,
      });
    },
    [items, storageKey, entityName, toast]
  );

  const getById = useCallback(
    (id: number) => {
      return items.find((item) => item.id === id);
    },
    [items]
  );

  return { items, create, update, remove, getById };
}
