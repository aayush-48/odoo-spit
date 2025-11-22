import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInventory } from '@/context/InventoryContext';
import { optimizeTransfer, optimizeDelivery, OptimizationResult, TruckLoad } from '@/lib/supplyChainOptimizer';
import { Sparkles, Route, Truck, TrendingUp, Clock, MapPin, Package, Weight, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';

// 3D Package Grid Visualization Component
const PackageGridView = ({ truckLoads }: { truckLoads: TruckLoad[][] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const rotationRef = useRef({ x: 0.4, y: 0.3 });
  const mouseRef = useRef({ isDragging: false, lastX: 0, lastY: 0 });
  const [hoveredBox, setHoveredBox] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Mouse interaction
    const handleMouseDown = (e: MouseEvent) => {
      mouseRef.current.isDragging = true;
      mouseRef.current.lastX = e.clientX;
      mouseRef.current.lastY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (mouseRef.current.isDragging) {
        const deltaX = e.clientX - mouseRef.current.lastX;
        const deltaY = e.clientY - mouseRef.current.lastY;
        rotationRef.current.y += deltaX * 0.01;
        rotationRef.current.x += deltaY * 0.01;
        rotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationRef.current.x));
        mouseRef.current.lastX = e.clientX;
        mouseRef.current.lastY = e.clientY;
      }
    };

    const handleMouseUp = () => {
      mouseRef.current.isDragging = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      if (!mouseRef.current.isDragging) {
        rotationRef.current.y += 0.004;
      }

      const centerX = width / 2;
      const centerY = height / 2;
      const scale = 40;

      // Draw ground shadow
      const groundGradient = ctx.createRadialGradient(centerX, height - 60, 0, centerX, height - 60, 350);
      groundGradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
      groundGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = groundGradient;
      ctx.beginPath();
      ctx.ellipse(centerX, height - 60, 320, 70, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3D rotation functions
      const rotateX = (point: number[], angle: number) => {
        const [x, y, z] = point;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return [x, y * cos - z * sin, y * sin + z * cos];
      };

      const rotateY = (point: number[], angle: number) => {
        const [x, y, z] = point;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return [x * cos + z * sin, y, -x * sin + z * cos];
      };

      const project = (point: number[]) => {
        let [x, y, z] = rotateX(point, rotationRef.current.x);
        [x, y, z] = rotateY([x, y, z], rotationRef.current.y);
        const perspective = 500 / (500 + z * 10);
        return [
          centerX + x * scale * perspective,
          centerY + y * scale * perspective,
          z,
          perspective
        ];
      };

      // Draw packages
      if (truckLoads && truckLoads.length > 0) {
        const load = truckLoads[0];
        const cols = 4;
        const rows = 3;
        const layers = 3;
        const packageCount = Math.min(load.length, cols * rows * layers);
        
        const boxSize = 2.2;
        const spacing = 0.5;
        
        const boxes: Array<{
          vertices: Record<string, number[][]>;
          z: number;
          item: TruckLoad;
          index: number;
        }> = [];
        
        for (let i = 0; i < packageCount; i++) {
          const layer = Math.floor(i / (rows * cols));
          const remainder = i % (rows * cols);
          const row = Math.floor(remainder / cols);
          const col = remainder % cols;
          
          const startX = -(cols * (boxSize + spacing)) / 2 + spacing;
          const startY = -(rows * (boxSize + spacing)) / 2 + spacing;
          const startZ = -(layers * (boxSize + spacing)) / 2 + spacing;
          
          const px = startX + col * (boxSize + spacing);
          const py = startY + row * (boxSize + spacing);
          const pz = startZ + layer * (boxSize + spacing);
          
          const item = load[i];
          
          const vertices = {
            front: [
              [px, py, pz + boxSize],
              [px + boxSize, py, pz + boxSize],
              [px + boxSize, py + boxSize, pz + boxSize],
              [px, py + boxSize, pz + boxSize]
            ],
            back: [
              [px, py, pz],
              [px + boxSize, py, pz],
              [px + boxSize, py + boxSize, pz],
              [px, py + boxSize, pz]
            ],
            top: [
              [px, py + boxSize, pz],
              [px + boxSize, py + boxSize, pz],
              [px + boxSize, py + boxSize, pz + boxSize],
              [px, py + boxSize, pz + boxSize]
            ],
            bottom: [
              [px, py, pz],
              [px + boxSize, py, pz],
              [px + boxSize, py, pz + boxSize],
              [px, py, pz + boxSize]
            ],
            left: [
              [px, py, pz],
              [px, py, pz + boxSize],
              [px, py + boxSize, pz + boxSize],
              [px, py + boxSize, pz]
            ],
            right: [
              [px + boxSize, py, pz],
              [px + boxSize, py, pz + boxSize],
              [px + boxSize, py + boxSize, pz + boxSize],
              [px + boxSize, py + boxSize, pz]
            ]
          };
          
          const projectedVertices: Record<string, number[][]> = {};
          Object.keys(vertices).forEach(face => {
            projectedVertices[face] = vertices[face as keyof typeof vertices].map(v => project(v));
          });
          
          const centerZ = projectedVertices.front.reduce((sum, v) => sum + v[2], 0) / 4;
          
          boxes.push({
            vertices: projectedVertices,
            z: centerZ,
            item: item,
            index: i
          });
        }
        
        // Sort by Z for proper rendering
        boxes.sort((a, b) => a.z - b.z);
        
        // Draw each box
        boxes.forEach(box => {
          const { vertices: projVerts, item } = box;
          
          // Determine colors based on product category
          const colors = {
            front: '#fbbf24',
            back: '#d97706',
            top: '#f59e0b',
            bottom: '#b45309',
            left: '#f59e0b',
            right: '#d97706'
          };
          
          // Draw faces
          const drawFace = (faceVerts: number[][], color: string, showText = false) => {
            ctx.fillStyle = color;
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(faceVerts[0][0], faceVerts[0][1]);
            faceVerts.forEach((v, idx) => {
              if (idx > 0) ctx.lineTo(v[0], v[1]);
            });
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Add product info on top face
            if (showText && item) {
              const centerX = faceVerts.reduce((sum, v) => sum + v[0], 0) / 4;
              const centerY = faceVerts.reduce((sum, v) => sum + v[1], 0) / 4;
              const avgPerspective = faceVerts.reduce((sum, v) => sum + v[3], 0) / 4;
              
              ctx.save();
              ctx.translate(centerX, centerY);
              
              // Product name
              ctx.fillStyle = '#78350f';
              ctx.font = `bold ${Math.max(8, 11 * avgPerspective)}px system-ui`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              
              const name = item.productName.length > 15 ? item.productName.substring(0, 13) + '...' : item.productName;
              ctx.fillText(name, 0, -8 * avgPerspective);
              
              // Weight
              ctx.font = `${Math.max(7, 9 * avgPerspective)}px system-ui`;
              ctx.fillStyle = '#92400e';
              ctx.fillText(`${item.weight.toFixed(1)} kg`, 0, 4 * avgPerspective);
              
              // Volume
              ctx.fillText(`${item.volume.toFixed(2)} m³`, 0, 14 * avgPerspective);
              
              ctx.restore();
            }
          };
          
          // Draw in order: back, bottom, left/right, top, front
          drawFace(projVerts.back, colors.back);
          drawFace(projVerts.bottom, colors.bottom);
          
          if (projVerts.left[0][2] < projVerts.right[0][2]) {
            drawFace(projVerts.left, colors.left);
            drawFace(projVerts.right, colors.right);
          } else {
            drawFace(projVerts.right, colors.right);
            drawFace(projVerts.left, colors.left);
          }
          
          drawFace(projVerts.top, colors.top, true);
          drawFace(projVerts.front, colors.front);
        });
      }

      // Title and info
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 18px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('3D Package Grid Visualization', centerX, 30);
      
      ctx.font = '13px system-ui';
      ctx.fillStyle = '#6b7280';
      ctx.fillText('Drag to rotate • Hover to see details', centerX, 52);
      
      if (truckLoads && truckLoads.length > 0) {
        const load = truckLoads[0];
        const totalWeight = load.reduce((sum, item) => sum + item.weight, 0);
        const totalVolume = load.reduce((sum, item) => sum + item.volume, 0);
        
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 14px system-ui';
        ctx.fillText(
          `${load.length} packages • ${totalWeight.toFixed(1)} kg • ${totalVolume.toFixed(2)} m³`,
          centerX,
          height - 20
        );
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [truckLoads]);

  return (
    <div className="bg-gradient-to-br from-slate-50 via-orange-50 to-slate-100 rounded-lg border-2 border-border p-4 shadow-inner">
      <canvas ref={canvasRef} width={900} height={550} className="w-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};

// Enhanced Route Map Component
const EnhancedRouteMap = ({ route, warehouses }: { route: any; warehouses: any[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !route) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background with realistic map colors
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#e8f4f8');
    bgGradient.addColorStop(1, '#f0f9ff');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw subtle grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Map waypoints to realistic coordinates
    const mapPoint = (waypoint: any, index: number, total: number) => {
      const padding = 120;
      const usableWidth = width - 2 * padding;
      const x = padding + (usableWidth * index) / Math.max(1, total - 1);
      const y = height / 2 + Math.sin(index * 0.6) * 100 - 20;
      return { 
        x, 
        y, 
        name: waypoint.name || waypoint.location || `Point ${index + 1}`,
        ...waypoint 
      };
    };

    const points = route.waypoints.map((wp: any, i: number) => mapPoint(wp, i, route.waypoints.length));

    // Draw road base (wider)
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 28;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    points.forEach((point: any, i: number) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        const prevPoint = points[i - 1];
        const cpX = (prevPoint.x + point.x) / 2;
        const cpY = (prevPoint.y + point.y) / 2 + 20;
        ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, cpX, cpY);
        ctx.quadraticCurveTo(cpX, cpY, point.x, point.y);
      }
    });
    ctx.stroke();

    // Road border (darker)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 30;
    ctx.stroke();

    // Inner road surface
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 26;
    ctx.stroke();

    // Center lane markings
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    points.forEach((point: any, i: number) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        const prevPoint = points[i - 1];
        const cpX = (prevPoint.x + point.x) / 2;
        const cpY = (prevPoint.y + point.y) / 2 + 20;
        ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, cpX, cpY);
        ctx.quadraticCurveTo(cpX, cpY, point.x, point.y);
      }
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Optimized route line
    const routeGradient = ctx.createLinearGradient(points[0].x, points[0].y, points[points.length - 1].x, points[points.length - 1].y);
    routeGradient.addColorStop(0, '#10b981');
    routeGradient.addColorStop(0.5, '#3b82f6');
    routeGradient.addColorStop(1, '#8b5cf6');
    
    ctx.strokeStyle = routeGradient;
    ctx.lineWidth = 5;
    ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
    ctx.shadowBlur = 10;
    ctx.setLineDash([]);
    ctx.beginPath();
    points.forEach((point: any, i: number) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        const prevPoint = points[i - 1];
        const cpX = (prevPoint.x + point.x) / 2;
        const cpY = (prevPoint.y + point.y) / 2 + 20;
        ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, cpX, cpY);
        ctx.quadraticCurveTo(cpX, cpY, point.x, point.y);
      }
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw animated truck
    if (points.length > 1) {
      const truckPos = points[1];
      ctx.save();
      ctx.translate(truckPos.x, truckPos.y - 35);
      
      // Truck shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(0, 10, 20, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Truck body
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-15, -8, 25, 12);
      
      // Truck cab
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(-15, -8, 8, 12);
      
      // Windows
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(-14, -6, 3, 4);
      ctx.fillRect(-14, 2, 3, 4);
      
      // Wheels
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(-10, 4, 3, 0, Math.PI * 2);
      ctx.arc(5, 4, 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }

    // Draw waypoint markers
    points.forEach((point: any, index: number) => {
      const isStart = index === 0;
      const isEnd = index === points.length - 1;

      // Marker shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(point.x + 3, point.y + 3, 24, 0, Math.PI * 2);
      ctx.fill();

      // Outer ring
      ctx.fillStyle = 'white';
      ctx.strokeStyle = isStart ? '#10b981' : isEnd ? '#ef4444' : '#3b82f6';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner circle
      ctx.fillStyle = isStart ? '#10b981' : isEnd ? '#ef4444' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 18, 0, Math.PI * 2);
      ctx.fill();

      // Icon/Label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      if (isStart) {
        ctx.fillText('START', point.x, point.y);
      } else if (isEnd) {
        ctx.fillText('END', point.x, point.y);
      } else {
        ctx.fillText(index.toString(), point.x, point.y);
      }

      // Location label with background
      const locText = point.name || `Point ${index + 1}`;
      ctx.font = 'bold 13px system-ui';
      const textWidth = ctx.measureText(locText).width;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      (ctx as any).roundRect(point.x - textWidth/2 - 8, point.y + 32, textWidth + 16, 24, 6);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#1f2937';
      ctx.textBaseline = 'middle';
      ctx.fillText(locText, point.x, point.y + 44);

      // Distance badges between points
      if (index < points.length - 1) {
        const nextPoint = points[index + 1];
        const midX = (point.x + nextPoint.x) / 2;
        const midY = (point.y + nextPoint.y) / 2 + 10;
        const dist = Math.floor(Math.sqrt(Math.pow(nextPoint.x - point.x, 2) + Math.pow(nextPoint.y - point.y, 2)) * 0.1);
        
        ctx.fillStyle = 'white';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        (ctx as any).roundRect(midX - 35, midY - 14, 70, 28, 14);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#1e40af';
        ctx.font = 'bold 13px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${dist} km`, midX, midY);
      }
    });

    // Enhanced legend
    const legendX = 20;
    const legendY = 20;
    const legendWidth = 170;
    const legendHeight = 120;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    (ctx as any).roundRect(legendX, legendY, legendWidth, legendHeight, 10);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Route Legend', legendX + 15, legendY + 25);

    const legendItems = [
      { color: '#10b981', label: 'Start Location', icon: 'S' },
      { color: '#ef4444', label: 'End Location', icon: 'E' },
      { color: '#3b82f6', label: 'Waypoint', icon: '•' }
    ];

    legendItems.forEach((item, i) => {
      const y = legendY + 50 + i * 25;
      
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(legendX + 20, y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(item.icon, legendX + 20, y + 3);

      ctx.fillStyle = '#374151';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, legendX + 35, y + 4);
    });

  }, [route, warehouses]);

  return (
    <div className="bg-card rounded-lg border-2 border-border p-4 shadow-sm">
      <canvas ref={canvasRef} width={1000} height={500} className="w-full" />
    </div>
  );
};

// Main Component
const SupplyChainOptimization = () => {
  const [searchParams] = useSearchParams();
  const { transfers, deliveries, warehouses, products } = useInventory();
  const [optimizationType, setOptimizationType] = useState<'transfer' | 'delivery'>('transfer');
  const [selectedId, setSelectedId] = useState<string>('');
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);

  // Handle URL parameters for direct navigation
  useEffect(() => {
    const type = searchParams.get('type') as 'transfer' | 'delivery' | null;
    const id = searchParams.get('id');
    
    if (type && (type === 'transfer' || type === 'delivery')) {
      setOptimizationType(type);
    }
    if (id) {
      setSelectedId(id);
      // Auto-optimize if ID is provided
      setTimeout(() => {
        const item = type === 'transfer' 
          ? transfers.find(t => t.id === id)
          : deliveries.find(d => d.id === id);
        if (item) {
          handleOptimizeDirect(id, type || 'transfer');
        }
      }, 100);
    }
  }, [searchParams, transfers, deliveries]);

  const availableItems = useMemo(() => {
    if (optimizationType === 'transfer') {
      return transfers.filter(t => t.status !== 'done' && t.status !== 'canceled');
    } else {
      return deliveries.filter(d => d.status !== 'done' && d.status !== 'canceled');
    }
  }, [optimizationType, transfers, deliveries]);

  const handleOptimizeDirect = (id: string, type: 'transfer' | 'delivery') => {
    try {
      let result: OptimizationResult;

      if (type === 'transfer') {
        const transfer = transfers.find(t => t.id === id);
        if (!transfer) {
          toast.error('Transfer not found');
          return;
        }
        result = optimizeTransfer(transfer, warehouses, products);
      } else {
        const delivery = deliveries.find(d => d.id === id);
        if (!delivery) {
          toast.error('Delivery not found');
          return;
        }
        result = optimizeDelivery(delivery, warehouses, products);
      }

      setOptimizationResult(result);
      toast.success('Route optimized successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Optimization failed');
    }
  };

  const handleOptimize = () => {
    if (!selectedId) {
      toast.error('Please select an item to optimize');
      return;
    }
    handleOptimizeDirect(selectedId, optimizationType);
  };

  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    if (optimizationType === 'transfer') {
      return transfers.find(t => t.id === selectedId);
    } else {
      return deliveries.find(d => d.id === selectedId);
    }
  }, [selectedId, optimizationType, transfers, deliveries]);

  return (
    <MainLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-accent" />
              Supply Chain Optimization
            </h1>
            <p className="text-muted-foreground">
              Optimize routes and truck loading for efficient logistics
            </p>
          </div>
        </div>

        <Card className="p-6 bg-card border border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Optimization Type</label>
              <Select
                value={optimizationType}
                onValueChange={(value: 'transfer' | 'delivery') => {
                  setOptimizationType(value);
                  setSelectedId('');
                  setOptimizationResult(null);
                }}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="transfer">Internal Transfer</SelectItem>
                  <SelectItem value="delivery">Delivery Order</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Select {optimizationType === 'transfer' ? 'Transfer' : 'Delivery'}
              </label>
              <Select
                value={selectedId}
                onValueChange={(value) => {
                  setSelectedId(value);
                  setOptimizationResult(null);
                }}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder={`Select ${optimizationType}`} />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {availableItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.id} {optimizationType === 'delivery' && (item as any).customerName && `- ${(item as any).customerName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleOptimize}
                disabled={!selectedId}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Optimize Route
              </Button>
            </div>
          </div>

          {selectedItem && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Selected Item Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">ID</p>
                  <p className="font-mono font-semibold">{selectedItem.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="outline">{selectedItem.status}</Badge>
                </div>
                {optimizationType === 'transfer' && (
                  <>
                    <div>
                      <p className="text-muted-foreground">From</p>
                      <p className="font-semibold">
                        {warehouses.find(w => w.id === (selectedItem as any).fromWarehouseId)?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">To</p>
                      <p className="font-semibold">
                        {warehouses.find(w => w.id === (selectedItem as any).toWarehouseId)?.name}
                      </p>
                    </div>
                  </>
                )}
                {optimizationType === 'delivery' && (
                  <>
                    <div>
                      <p className="text-muted-foreground">Customer</p>
                      <p className="font-semibold">{(selectedItem as any).customerName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Warehouse</p>
                      <p className="font-semibold">
                        {warehouses.find(w => w.id === (selectedItem as any).warehouseId)?.name}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </Card>

        {optimizationResult && optimizationResult.routes.length > 0 && (
          <div className="space-y-6">
            {/* Optimization Summary */}
            <Card className="p-6 bg-card border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Optimization Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Trucks Required</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{optimizationResult.totalTrucks}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Route className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Total Distance</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{optimizationResult.totalDistance} <span className="text-lg">km</span></p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Est. Time</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{optimizationResult.totalTime} <span className="text-lg">min</span></p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Efficiency</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{optimizationResult.efficiency}<span className="text-lg">%</span></p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Waypoints</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {optimizationResult.routes[0].waypoints.length}
                  </p>
                </div>
              </div>
            </Card>

            {/* Enhanced Route Map */}
            <Card className="p-6 bg-card border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent" />
                Optimized Route Map
              </h3>
              <EnhancedRouteMap route={optimizationResult.routes[0]} warehouses={warehouses} />
            </Card>

            {/* 3D Package Grid Visualization */}
            <Card className="p-6 bg-card border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-accent" />
                3D Package Grid with Product Details
              </h3>
              <PackageGridView truckLoads={optimizationResult.truckLoads} />
              
              {/* Load Details */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {optimizationResult.truckLoads.map((load, index) => {
                  const totalWeight = load.reduce((sum, item) => sum + item.weight, 0);
                  const totalVolume = load.reduce((sum, item) => sum + item.volume, 0);
                  return (
                    <div key={index} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Truck #{index + 1}</p>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Items</p>
                          <p className="text-xl font-bold text-foreground">{load.length}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Weight</p>
                          <p className="text-xl font-bold text-foreground">{totalWeight.toFixed(1)} kg</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Volume</p>
                          <p className="text-xl font-bold text-foreground">{totalVolume.toFixed(2)} m³</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {!optimizationResult && selectedId && (
          <Card className="p-12 text-center bg-card border border-border">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Ready to Optimize
            </h3>
            <p className="text-muted-foreground">
              Click the "Optimize Route" button to generate the optimal route and truck loading plan.
            </p>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default SupplyChainOptimization;
