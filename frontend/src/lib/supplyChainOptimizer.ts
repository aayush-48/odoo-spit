import { Warehouse, Product, Transfer, Delivery } from '@/types';

export interface RoutePoint {
  id: string;
  name: string;
  type: 'warehouse' | 'customer' | 'supplier';
  coordinates: { x: number; y: number };
  address: string;
}

export interface TruckLoad {
  productId: string;
  productName: string;
  quantity: number;
  weight: number; // in kg
  volume: number; // in cubic meters
  sku: string;
}

export interface OptimizedRoute {
  routeId: string;
  totalDistance: number; // in km
  estimatedTime: number; // in minutes
  waypoints: RoutePoint[];
  route: number[]; // indices of waypoints in optimal order
  totalWeight: number;
  totalVolume: number;
  truckCapacity: {
    maxWeight: number; // kg
    maxVolume: number; // cubic meters
  };
}

export interface OptimizationResult {
  routes: OptimizedRoute[];
  truckLoads: TruckLoad[][];
  totalTrucks: number;
  totalDistance: number;
  totalTime: number;
  efficiency: number; // percentage
}

// Mock warehouse coordinates (in a 1000x1000 grid for visualization)
const WAREHOUSE_COORDINATES: Record<string, { x: number; y: number }> = {
  'wh1': { x: 200, y: 300 }, // Main Warehouse
  'wh2': { x: 700, y: 250 }, // North Distribution Center
  'wh3': { x: 500, y: 700 }, // South Fulfillment Hub
};

// Mock customer/supplier coordinates
const generateRandomCoordinates = (seed: number) => {
  return {
    x: 100 + (seed * 137) % 800,
    y: 100 + (seed * 211) % 800,
  };
};

// Calculate distance between two points (Euclidean distance)
const calculateDistance = (point1: RoutePoint, point2: RoutePoint): number => {
  const dx = point2.coordinates.x - point1.coordinates.x;
  const dy = point2.coordinates.y - point1.coordinates.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Simple TSP approximation using nearest neighbor heuristic
const optimizeRoute = (points: RoutePoint[], startPoint: RoutePoint): number[] => {
  if (points.length <= 1) return [0];
  
  const route: number[] = [];
  const visited = new Set<number>();
  
  // Find start point index
  let currentIndex = points.findIndex(p => p.id === startPoint.id);
  if (currentIndex === -1) currentIndex = 0;
  
  route.push(currentIndex);
  visited.add(currentIndex);
  
  // Nearest neighbor algorithm
  while (visited.size < points.length) {
    let nearestIndex = -1;
    let nearestDistance = Infinity;
    
    for (let i = 0; i < points.length; i++) {
      if (!visited.has(i)) {
        const distance = calculateDistance(points[currentIndex], points[i]);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }
    }
    
    if (nearestIndex !== -1) {
      route.push(nearestIndex);
      visited.add(nearestIndex);
      currentIndex = nearestIndex;
    }
  }
  
  return route;
};

// Calculate total route distance
const calculateRouteDistance = (points: RoutePoint[], route: number[]): number => {
  let totalDistance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += calculateDistance(points[route[i]], points[route[i + 1]]);
  }
  return totalDistance;
};

// Mock product weights and volumes (in real system, these would come from product data)
const getProductWeight = (product: Product): number => {
  // Mock: assume 1-10 kg per unit based on category
  const weights: Record<string, number> = {
    'Hardware': 2,
    'Machinery': 8,
    'Raw Materials': 5,
    'Safety Equipment': 1,
    'Electrical': 3,
    'Chemicals': 4,
    'Consumables': 1,
  };
  return weights[product.category] || 2;
};

const getProductVolume = (product: Product): number => {
  // Mock: assume 0.01-0.1 cubic meters per unit
  const volumes: Record<string, number> = {
    'Hardware': 0.02,
    'Machinery': 0.08,
    'Raw Materials': 0.05,
    'Safety Equipment': 0.01,
    'Electrical': 0.03,
    'Chemicals': 0.04,
    'Consumables': 0.01,
  };
  return volumes[product.category] || 0.02;
};

// Bin packing algorithm for truck loading
const packTrucks = (
  loads: TruckLoad[],
  maxWeight: number = 20000, // 20 tons
  maxVolume: number = 80 // 80 cubic meters
): TruckLoad[][] => {
  const trucks: TruckLoad[][] = [];
  
  // Sort by volume (largest first) for better packing
  const sortedLoads = [...loads].sort((a, b) => b.volume - a.volume);
  
  for (const load of sortedLoads) {
    let placed = false;
    
    // Try to fit in existing truck
    for (const truck of trucks) {
      const currentWeight = truck.reduce((sum, l) => sum + l.weight, 0);
      const currentVolume = truck.reduce((sum, l) => sum + l.volume, 0);
      
      if (currentWeight + load.weight <= maxWeight && currentVolume + load.volume <= maxVolume) {
        truck.push(load);
        placed = true;
        break;
      }
    }
    
    // Create new truck if doesn't fit
    if (!placed) {
      trucks.push([load]);
    }
  }
  
  return trucks;
};

// Main optimization function for transfers
export const optimizeTransfer = (
  transfer: Transfer,
  warehouses: Warehouse[],
  products: Product[]
): OptimizationResult => {
  const fromWarehouse = warehouses.find(w => w.id === transfer.fromWarehouseId);
  const toWarehouse = warehouses.find(w => w.id === transfer.toWarehouseId);
  
  if (!fromWarehouse || !toWarehouse) {
    throw new Error('Warehouses not found');
  }
  
  // Create route points
  const fromCoords = WAREHOUSE_COORDINATES[transfer.fromWarehouseId] || generateRandomCoordinates(1);
  const toCoords = WAREHOUSE_COORDINATES[transfer.toWarehouseId] || generateRandomCoordinates(2);
  
  const waypoints: RoutePoint[] = [
    {
      id: transfer.fromWarehouseId,
      name: fromWarehouse.name,
      type: 'warehouse',
      coordinates: fromCoords,
      address: fromWarehouse.address,
    },
    {
      id: transfer.toWarehouseId,
      name: toWarehouse.name,
      type: 'warehouse',
      coordinates: toCoords,
      address: toWarehouse.address,
    },
  ];
  
  // Create truck loads
  const loads: TruckLoad[] = transfer.lines.map(line => {
    const product = products.find(p => p.id === line.productId);
    if (!product) throw new Error(`Product ${line.productId} not found`);
    
    const unitWeight = getProductWeight(product);
    const unitVolume = getProductVolume(product);
    
    return {
      productId: product.id,
      productName: product.name,
      quantity: line.quantity,
      weight: unitWeight * line.quantity,
      volume: unitVolume * line.quantity,
      sku: product.sku,
    };
  });
  
  // Pack trucks
  const truckLoads = packTrucks(loads);
  
  // Optimize route (simple for 2 points, but extensible)
  const route = optimizeRoute(waypoints, waypoints[0]);
  const totalDistance = calculateRouteDistance(waypoints, route);
  const estimatedTime = Math.round(totalDistance * 2); // Assume 2 minutes per unit distance
  
  const optimizedRoute: OptimizedRoute = {
    routeId: transfer.id,
    totalDistance: Math.round(totalDistance * 0.1), // Convert to km (scale factor)
    estimatedTime,
    waypoints,
    route,
    totalWeight: loads.reduce((sum, l) => sum + l.weight, 0),
    totalVolume: loads.reduce((sum, l) => sum + l.volume, 0),
    truckCapacity: {
      maxWeight: 20000,
      maxVolume: 80,
    },
  };
  
  const totalTrucks = truckLoads.length;
  const efficiency = Math.round(
    ((optimizedRoute.totalWeight / (totalTrucks * optimizedRoute.truckCapacity.maxWeight)) +
     (optimizedRoute.totalVolume / (totalTrucks * optimizedRoute.truckCapacity.maxVolume))) / 2 * 100
  );
  
  return {
    routes: [optimizedRoute],
    truckLoads,
    totalTrucks,
    totalDistance: optimizedRoute.totalDistance,
    totalTime: estimatedTime,
    efficiency: Math.min(100, efficiency),
  };
};

// Main optimization function for deliveries
export const optimizeDelivery = (
  delivery: Delivery,
  warehouses: Warehouse[],
  products: Product[]
): OptimizationResult => {
  const warehouse = warehouses.find(w => w.id === delivery.warehouseId);
  
  if (!warehouse) {
    throw new Error('Warehouse not found');
  }
  
  // Create route points
  const warehouseCoords = WAREHOUSE_COORDINATES[delivery.warehouseId] || generateRandomCoordinates(1);
  
  const waypoints: RoutePoint[] = [
    {
      id: delivery.warehouseId,
      name: warehouse.name,
      type: 'warehouse',
      coordinates: warehouseCoords,
      address: warehouse.address,
    },
    {
      id: `customer-${delivery.id}`,
      name: delivery.customerName || 'Customer',
      type: 'customer',
      coordinates: generateRandomCoordinates(delivery.id.charCodeAt(0)),
      address: 'Customer Address',
    },
  ];
  
  // Create truck loads
  const loads: TruckLoad[] = delivery.lines.map(line => {
    const product = products.find(p => p.id === line.productId);
    if (!product) throw new Error(`Product ${line.productId} not found`);
    
    const unitWeight = getProductWeight(product);
    const unitVolume = getProductVolume(product);
    
    return {
      productId: product.id,
      productName: product.name,
      quantity: line.quantity,
      weight: unitWeight * line.quantity,
      volume: unitVolume * line.quantity,
      sku: product.sku,
    };
  });
  
  // Pack trucks
  const truckLoads = packTrucks(loads);
  
  // Optimize route
  const route = optimizeRoute(waypoints, waypoints[0]);
  const totalDistance = calculateRouteDistance(waypoints, route);
  const estimatedTime = Math.round(totalDistance * 2);
  
  const optimizedRoute: OptimizedRoute = {
    routeId: delivery.id,
    totalDistance: Math.round(totalDistance * 0.1),
    estimatedTime,
    waypoints,
    route,
    totalWeight: loads.reduce((sum, l) => sum + l.weight, 0),
    totalVolume: loads.reduce((sum, l) => sum + l.volume, 0),
    truckCapacity: {
      maxWeight: 20000,
      maxVolume: 80,
    },
  };
  
  const totalTrucks = truckLoads.length;
  const efficiency = Math.round(
    ((optimizedRoute.totalWeight / (totalTrucks * optimizedRoute.truckCapacity.maxWeight)) +
     (optimizedRoute.totalVolume / (totalTrucks * optimizedRoute.truckCapacity.maxVolume))) / 2 * 100
  );
  
  return {
    routes: [optimizedRoute],
    truckLoads,
    totalTrucks,
    totalDistance: optimizedRoute.totalDistance,
    totalTime: estimatedTime,
    efficiency: Math.min(100, efficiency),
  };
};

// Multi-stop optimization (for multiple deliveries/transfers)
export const optimizeMultiStop = (
  items: Array<{ id: string; from: RoutePoint; to: RoutePoint; loads: TruckLoad[] }>,
  startPoint: RoutePoint
): OptimizationResult => {
  // Collect all unique waypoints
  const waypointMap = new Map<string, RoutePoint>();
  waypointMap.set(startPoint.id, startPoint);
  
  items.forEach(item => {
    waypointMap.set(item.from.id, item.from);
    waypointMap.set(item.to.id, item.to);
  });
  
  const waypoints = Array.from(waypointMap.values());
  
  // Combine all loads
  const allLoads: TruckLoad[] = [];
  items.forEach(item => {
    allLoads.push(...item.loads);
  });
  
  // Pack trucks
  const truckLoads = packTrucks(allLoads);
  
  // Optimize route
  const route = optimizeRoute(waypoints, startPoint);
  const totalDistance = calculateRouteDistance(waypoints, route);
  const estimatedTime = Math.round(totalDistance * 2);
  
  const optimizedRoute: OptimizedRoute = {
    routeId: 'multi-stop',
    totalDistance: Math.round(totalDistance * 0.1),
    estimatedTime,
    waypoints,
    route,
    totalWeight: allLoads.reduce((sum, l) => sum + l.weight, 0),
    totalVolume: allLoads.reduce((sum, l) => sum + l.volume, 0),
    truckCapacity: {
      maxWeight: 20000,
      maxVolume: 80,
    },
  };
  
  const totalTrucks = truckLoads.length;
  const efficiency = Math.round(
    ((optimizedRoute.totalWeight / (totalTrucks * optimizedRoute.truckCapacity.maxWeight)) +
     (optimizedRoute.totalVolume / (totalTrucks * optimizedRoute.truckCapacity.maxVolume))) / 2 * 100
  );
  
  return {
    routes: [optimizedRoute],
    truckLoads,
    totalTrucks,
    totalDistance: optimizedRoute.totalDistance,
    totalTime: estimatedTime,
    efficiency: Math.min(100, efficiency),
  };
};

