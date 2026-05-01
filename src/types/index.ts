export interface ApiError {
  error: string;
}

export interface ClientWithProjects {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  slug: string;
  createdAt: string;
  _count?: { projects: number };
}

export interface CostItemData {
  id: string;
  name: string;
  category?: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ProjectWithDetails {
  id: string;
  name: string;
  description?: string | null;
  date: string;
  marginPercent: number;
  status: string;
  clientId: string;
  costItems: CostItemData[];
  mediaFiles: MediaFileData[];
  totalCost: number;
  finalPrice: number;
  client?: { name: string; slug: string };
}

export interface MediaFileData {
  id: string;
  url: string;
  storagePath: string;
  type: string;
  name: string;
  size: number;
}
