export type DocumentStatus = 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';
export type DocumentType = 'receipt' | 'delivery' | 'internal' | 'adjustment';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitOfMeasure: string;
  stock: Record<string, number>; // warehouse/location ID -> quantity
  minStock?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface ReceiptLine {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface Receipt {
  id: string;
  supplierId: string;
  warehouseId: string;
  status: DocumentStatus;
  lines: ReceiptLine[];
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface DeliveryLine {
  productId: string;
  quantity: number;
}

export interface Delivery {
  id: string;
  warehouseId: string;
  status: DocumentStatus;
  lines: DeliveryLine[];
  customerName?: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface TransferLine {
  productId: string;
  quantity: number;
}

export interface Transfer {
  id: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  lines: TransferLine[];
  status: DocumentStatus;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface AdjustmentLine {
  productId: string;
  countedQuantity: number;
  systemQuantity: number;
  difference: number;
  reason: string;
}

export interface Adjustment {
  id: string;
  warehouseId: string;
  lines: AdjustmentLine[];
  status: DocumentStatus;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'staff';
}

export interface KPI {
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
}

export interface FilterState {
  documentType: DocumentType | 'all';
  status: DocumentStatus | 'all';
  warehouseId: string | 'all';
  category: string | 'all';
  searchQuery: string;
}
