export const BASE_PAGE_SIZE_OPTIONS = [25, 50, 100, 200];

export const CART_COLUMN_IDS = [
  'domain',
  'keywords',
  'similarity_score',
  'added_at',
  'actions',
] as const;

export type CartColumnId = (typeof CART_COLUMN_IDS)[number];

export interface CartColumn {
  id: CartColumnId;
  label: string;
  sortable: boolean;
}

export const DEFAULT_ORDER = 'similarity_score,DESC';

export const getDefaultColumns = (): CartColumn[] => [
  { id: 'domain', label: 'Domain', sortable: true },
  { id: 'keywords', label: 'Keywords', sortable: false },
  { id: 'similarity_score', label: 'Similarity Score', sortable: true },
  { id: 'added_at', label: 'Added', sortable: true },
  { id: 'actions', label: 'Actions', sortable: false },
];
