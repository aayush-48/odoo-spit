import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, Warehouse, Receipt, Delivery, Transfer, Adjustment, Supplier, User, FilterState } from '@/types';
import { initialProducts, initialWarehouses, initialSuppliers } from '@/lib/mockData';

interface InventoryContextType {
  // Data
  products: Product[];
  warehouses: Warehouse[];
  receipts: Receipt[];
  deliveries: Delivery[];
  transfers: Transfer[];
  adjustments: Adjustment[];
  suppliers: Supplier[];
  user: User | null;
  
  // Filters
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  
  // Actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  addReceipt: (receipt: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReceipt: (id: string, receipt: Partial<Receipt>) => void;
  confirmReceipt: (id: string) => void;
  
  addDelivery: (delivery: Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDelivery: (id: string, delivery: Partial<Delivery>) => void;
  pickDelivery: (id: string) => void;
  packDelivery: (id: string) => void;
  confirmDelivery: (id: string) => void;
  
  addTransfer: (transfer: Omit<Transfer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransfer: (id: string, transfer: Partial<Transfer>) => void;
  confirmTransfer: (id: string) => void;
  
  addAdjustment: (adjustment: Omit<Adjustment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAdjustment: (id: string, adjustment: Partial<Adjustment>) => void;
  confirmAdjustment: (id: string) => void;
  
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [warehouses] = useState<Warehouse[]>(initialWarehouses);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [suppliers] = useState<Supplier[]>(initialSuppliers);
  const [user, setUser] = useState<User | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    documentType: 'all',
    status: 'all',
    warehouseId: 'all',
    category: 'all',
    searchQuery: '',
  });

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Product actions
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, ...productData, updatedAt: new Date() } : p
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  // Receipt actions
  const addReceipt = (receiptData: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newReceipt: Receipt = {
      ...receiptData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setReceipts([...receipts, newReceipt]);
  };

  const updateReceipt = (id: string, receiptData: Partial<Receipt>) => {
    setReceipts(receipts.map(r => 
      r.id === id ? { ...r, ...receiptData, updatedAt: new Date() } : r
    ));
  };

  const confirmReceipt = (id: string) => {
    const receipt = receipts.find(r => r.id === id);
    if (!receipt) return;

    // Update stock levels
    setProducts(products.map(product => {
      const line = receipt.lines.find(l => l.productId === product.id);
      if (line) {
        return {
          ...product,
          stock: {
            ...product.stock,
            [receipt.warehouseId]: (product.stock[receipt.warehouseId] || 0) + line.quantity,
          },
          updatedAt: new Date(),
        };
      }
      return product;
    }));

    // Update receipt status
    updateReceipt(id, { status: 'done' });
  };

  // Delivery actions
  const addDelivery = (deliveryData: Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDelivery: Delivery = {
      ...deliveryData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setDeliveries([...deliveries, newDelivery]);
  };

  const updateDelivery = (id: string, deliveryData: Partial<Delivery>) => {
    setDeliveries(deliveries.map(d => 
      d.id === id ? { ...d, ...deliveryData, updatedAt: new Date() } : d
    ));
  };

  const pickDelivery = (id: string) => {
    updateDelivery(id, { status: 'waiting' });
  };

  const packDelivery = (id: string) => {
    updateDelivery(id, { status: 'ready' });
  };

  const confirmDelivery = (id: string) => {
    const delivery = deliveries.find(d => d.id === id);
    if (!delivery) return;

    // Update stock levels
    setProducts(products.map(product => {
      const line = delivery.lines.find(l => l.productId === product.id);
      if (line) {
        return {
          ...product,
          stock: {
            ...product.stock,
            [delivery.warehouseId]: Math.max(0, (product.stock[delivery.warehouseId] || 0) - line.quantity),
          },
          updatedAt: new Date(),
        };
      }
      return product;
    }));

    updateDelivery(id, { status: 'done' });
  };

  // Transfer actions
  const addTransfer = (transferData: Omit<Transfer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTransfer: Transfer = {
      ...transferData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTransfers([...transfers, newTransfer]);
  };

  const updateTransfer = (id: string, transferData: Partial<Transfer>) => {
    setTransfers(transfers.map(t => 
      t.id === id ? { ...t, ...transferData, updatedAt: new Date() } : t
    ));
  };

  const confirmTransfer = (id: string) => {
    const transfer = transfers.find(t => t.id === id);
    if (!transfer) return;

    // Update stock levels for each line
    setProducts(products.map(product => {
      const line = transfer.lines.find(l => l.productId === product.id);
      if (line) {
        return {
          ...product,
          stock: {
            ...product.stock,
            [transfer.fromWarehouseId]: Math.max(0, (product.stock[transfer.fromWarehouseId] || 0) - line.quantity),
            [transfer.toWarehouseId]: (product.stock[transfer.toWarehouseId] || 0) + line.quantity,
          },
          updatedAt: new Date(),
        };
      }
      return product;
    }));

    updateTransfer(id, { status: 'done' });
  };

  // Adjustment actions
  const addAdjustment = (adjustmentData: Omit<Adjustment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAdjustment: Adjustment = {
      ...adjustmentData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setAdjustments([...adjustments, newAdjustment]);
  };

  const updateAdjustment = (id: string, adjustmentData: Partial<Adjustment>) => {
    setAdjustments(adjustments.map(a => 
      a.id === id ? { ...a, ...adjustmentData, updatedAt: new Date() } : a
    ));
  };

  const confirmAdjustment = (id: string) => {
    const adjustment = adjustments.find(a => a.id === id);
    if (!adjustment) return;

    // Update stock levels for each line
    setProducts(products.map(product => {
      const line = adjustment.lines.find(l => l.productId === product.id);
      if (line) {
        return {
          ...product,
          stock: {
            ...product.stock,
            [adjustment.warehouseId]: line.countedQuantity,
          },
          updatedAt: new Date(),
        };
      }
      return product;
    }));

    updateAdjustment(id, { status: 'done' });
  };

  // Auth actions
  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email && password) {
      setUser({
        id: generateId(),
        email,
        name: email.split('@')[0],
        role: 'manager',
      });
      return true;
    }
    return false;
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    // Mock signup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email && password && name) {
      setUser({
        id: generateId(),
        email,
        name,
        role: 'manager',
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const value: InventoryContextType = {
    products,
    warehouses,
    receipts,
    deliveries,
    transfers,
    adjustments,
    suppliers,
    user,
    filters,
    setFilters,
    addProduct,
    updateProduct,
    deleteProduct,
    addReceipt,
    updateReceipt,
    confirmReceipt,
    addDelivery,
    updateDelivery,
    pickDelivery,
    packDelivery,
    confirmDelivery,
    addTransfer,
    updateTransfer,
    confirmTransfer,
    addAdjustment,
    updateAdjustment,
    confirmAdjustment,
    login,
    signup,
    logout,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
