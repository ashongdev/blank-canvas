import { useState, useCallback } from "react";

export interface Template {
  id: string;
  name: string;
  thumbnailUrl: string;
  publicId: string;
  createdAt: string;
  collectionId: string | null;
  trashed: boolean;
}

export interface Collection {
  id: string;
  name: string;
  createdAt: string;
}

const SEED_COLLECTIONS: Collection[] = [
  { id: "c1", name: "Events", createdAt: "2025-12-01" },
  { id: "c2", name: "Corporate", createdAt: "2025-12-10" },
];

const SEED_TEMPLATES: Template[] = [
  { id: "t1", name: "Award Certificate", thumbnailUrl: "/placeholder.svg", publicId: "cert_award_001", createdAt: "2026-01-15", collectionId: "c1", trashed: false },
  { id: "t2", name: "Workshop Completion", thumbnailUrl: "/placeholder.svg", publicId: "cert_workshop_002", createdAt: "2026-02-01", collectionId: "c1", trashed: false },
  { id: "t3", name: "Employee of the Month", thumbnailUrl: "/placeholder.svg", publicId: "cert_eom_003", createdAt: "2026-02-20", collectionId: "c2", trashed: false },
  { id: "t4", name: "Training Badge", thumbnailUrl: "/placeholder.svg", publicId: "cert_badge_004", createdAt: "2026-03-05", collectionId: null, trashed: false },
  { id: "t5", name: "Volunteer Appreciation", thumbnailUrl: "/placeholder.svg", publicId: "cert_vol_005", createdAt: "2026-03-12", collectionId: null, trashed: false },
];

export function useDashboardStore() {
  const [templates, setTemplates] = useState<Template[]>(SEED_TEMPLATES);
  const [collections, setCollections] = useState<Collection[]>(SEED_COLLECTIONS);

  // Templates
  const activeTemplates = templates.filter((t) => !t.trashed);
  const trashedTemplates = templates.filter((t) => t.trashed);

  const trashTemplate = useCallback((id: string) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, trashed: true, collectionId: null } : t)));
  }, []);

  const restoreTemplate = useCallback((id: string) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, trashed: false } : t)));
  }, []);

  const permanentlyDelete = useCallback((id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateTemplate = useCallback((id: string, updates: Partial<Template>) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const assignCollection = useCallback((templateId: string, collectionId: string | null) => {
    setTemplates((prev) => prev.map((t) => (t.id === templateId ? { ...t, collectionId } : t)));
  }, []);

  // Collections
  const createCollection = useCallback((name: string) => {
    const newCol: Collection = { id: `c${Date.now()}`, name, createdAt: new Date().toISOString() };
    setCollections((prev) => [...prev, newCol]);
    return newCol;
  }, []);

  const updateCollection = useCallback((id: string, name: string) => {
    setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
  }, []);

  const deleteCollection = useCallback((id: string) => {
    // Unassign templates but don't trash them
    setTemplates((prev) => prev.map((t) => (t.collectionId === id ? { ...t, collectionId: null } : t)));
    setCollections((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
    templates, activeTemplates, trashedTemplates, collections,
    trashTemplate, restoreTemplate, permanentlyDelete, updateTemplate, assignCollection,
    createCollection, updateCollection, deleteCollection,
  };
}
