import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, Warehouse, Receipt, Delivery, Transfer, Adjustment, Supplier, User, FilterState, Location } from '@/types';
import { 
  initialProducts, 
  initialWarehouses, 
  initialSuppliers,
  initialReceipts,
  initialDeliveries,
  initialTransfers,
  initialAdjustments
} from '@/lib/mockData';

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
  
  login: (loginId: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, loginId: string, role: 'inventory_manager' | 'warehouse_staff') => Promise<boolean>;
  logout: () => void;
  generateOTP: (email: string) => Promise<string | null>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
  
  // Warehouse actions
  addWarehouse: (warehouse: Omit<Warehouse, 'id'>) => void;
  updateWarehouse: (id: string, warehouse: Partial<Warehouse>) => void;
  deleteWarehouse: (id: string) => void;
  
  // Location actions
  locations: Location[];
  addLocation: (location: Omit<Location, 'id'>) => void;
  updateLocation: (id: string, location: Partial<Location>) => void;
  deleteLocation: (id: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses);
  const [receipts, setReceipts] = useState<Receipt[]>(initialReceipts);
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [transfers, setTransfers] = useState<Transfer[]>(initialTransfers);
  const [adjustments, setAdjustments] = useState<Adjustment[]>(initialAdjustments);
  const [suppliers] = useState<Supplier[]>(initialSuppliers);
  const [locations, setLocations] = useState<Location[]>([]);
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
  const login = async (loginId: string, password: string): Promise<boolean> => {
    // Mock authentication
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (loginId && password) {
      // Mock: different users based on loginId
      const role = loginId.toLowerCase().includes('manager') || loginId.toLowerCase().includes('mgr') 
        ? 'inventory_manager' 
        : 'warehouse_staff';
      
      setUser({
        id: generateId(),
        email: `${loginId}@company.com`,
        name: loginId,
        loginId,
        role,
      });
      return true;
    }
    return false;
  };

  const signup = async (email: string, password: string, name: string, loginId: string, role: 'inventory_manager' | 'warehouse_staff'): Promise<boolean> => {
    // Mock signup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email && password && name && loginId) {
      setUser({
        id: generateId(),
        email,
        name,
        loginId,
        role,
      });
      return true;
    }
    return false;
  };

  // OTP storage (in real app, this would be in backend/database)
  const otpStore: Record<string, { code: string; expiresAt: number }> = {};

  const generateOTP = async (email: string): Promise<string | null> => {
    // Mock OTP generation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!email) return null;
    
    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    otpStore[email] = { code, expiresAt };
    
    // In production, send OTP via email/SMS
    // For now, return code for testing
    return code;
  };

  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    // Mock OTP verification
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const stored = otpStore[email];
    if (!stored) return false;
    
    if (Date.now() > stored.expiresAt) {
      delete otpStore[email];
      return false;
    }
    
    if (stored.code === otp) {
      // Mark as verified (don't delete yet, needed for password reset)
      return true;
    }
    
    return false;
  };

  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    // Mock password reset
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!email || !newPassword) return false;
    
    // In production, update password in database
    // For now, just clear OTP
    delete otpStore[email];
    
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  // Warehouse actions
  const addWarehouse = (warehouseData: Omit<Warehouse, 'id'>) => {
    // Check for duplicate code
    if (warehouses.some(w => w.code === warehouseData.code)) {
      throw new Error('Warehouse code already exists');
    }
    
    const newWarehouse: Warehouse = {
      ...warehouseData,
      id: generateId(),
    };
    setWarehouses([...warehouses, newWarehouse]);
  };

  const updateWarehouse = (id: string, warehouseData: Partial<Warehouse>) => {
    // Check for duplicate code if code is being updated
    if (warehouseData.code && warehouses.some(w => w.code === warehouseData.code && w.id !== id)) {
      throw new Error('Warehouse code already exists');
    }
    
    setWarehouses(warehouses.map(w => 
      w.id === id ? { ...w, ...warehouseData } : w
    ));
  };

  const deleteWarehouse = (id: string) => {
    // Check if warehouse is used in any receipts, deliveries, or transfers
    const isUsed = receipts.some(r => r.warehouseId === id) ||
                   deliveries.some(d => d.warehouseId === id) ||
                   transfers.some(t => t.fromWarehouseId === id || t.toWarehouseId === id);
    
    if (isUsed) {
      throw new Error('Cannot delete warehouse that is in use');
    }
    
    setWarehouses(warehouses.filter(w => w.id !== id));
    // Also delete associated locations
    setLocations(locations.filter(l => l.warehouseId !== id));
  };

  // Location actions
  const addLocation = (locationData: Omit<Location, 'id'>) => {
    // Check if warehouse exists
    if (!warehouses.some(w => w.id === locationData.warehouseId)) {
      throw new Error('Warehouse not found');
    }
    
    // Check for duplicate code in same warehouse
    if (locations.some(l => l.code === locationData.code && l.warehouseId === locationData.warehouseId)) {
      throw new Error('Location code already exists in this warehouse');
    }
    
    const newLocation: Location = {
      ...locationData,
      id: generateId(),
    };
    setLocations([...locations, newLocation]);
  };

  const updateLocation = (id: string, locationData: Partial<Location>) => {
    // Check for duplicate code if code is being updated
    if (locationData.code) {
      const location = locations.find(l => l.id === id);
      if (location && locations.some(l => l.code === locationData.code && l.warehouseId === (locationData.warehouseId || location.warehouseId) && l.id !== id)) {
        throw new Error('Location code already exists in this warehouse');
      }
    }
    
    setLocations(locations.map(l => 
      l.id === id ? { ...l, ...locationData } : l
    ));
  };

  const deleteLocation = (id: string) => {
    setLocations(locations.filter(l => l.id !== id));
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
    generateOTP,
    verifyOTP,
    resetPassword,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
    locations,
    addLocation,
    updateLocation,
    deleteLocation,
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
