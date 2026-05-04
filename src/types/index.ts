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
  priceVisible: boolean;
  costItems: CostItemData[];
  mediaFiles: MediaFileData[];
  totalCost: number;
  finalPrice: number;
  client?: { name: string; slug: string };
  budgetReview?: BudgetReviewWithItems | null;
}

export interface MediaFileData {
  id: string;
  url: string;
  storagePath: string;
  type: string;
  name: string;
  size: number;
}

export interface SupplyItemData {
  id: string;
  name: string;
  category?: string | null;
  unitPrice: number;
  createdAt: string;
}

export interface BudgetItemReviewData {
  id: string;
  costItemId: string;
  itemStatus: "approved" | "contested";
  comment?: string | null;
  costItem: {
    id: string;
    name: string;
    category?: string | null;
    quantity: number;
    unitPrice: number;
  };
}

export interface BudgetReviewWithItems {
  id: string;
  projectId: string;
  status: "pending" | "submitted";
  sentAt: string;
  submittedAt?: string | null;
  itemReviews: BudgetItemReviewData[];
}
