export type AlertType = 'low_stock' | 'overstock' | 'pending_receipt' | 'pending_delivery' | 'pending_transfer' | 'expiring_soon' | 'reorder_needed';

export type AlertSeverity = 'info' | 'warning' | 'error' | 'success';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    productId?: string;
    warehouseId?: string;
    documentId?: string;
    [key: string]: any;
  };
}

export interface OrderPrediction {
  productId: string;
  productName: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  currentStock: number;
  predictedDemand: number;
  recommendedOrder: number;
  daysUntilStockout: number;
  confidence: number; // 0-100
  reason: string;
}

