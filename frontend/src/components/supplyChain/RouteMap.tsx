import { useEffect, useRef } from 'react';
import { OptimizedRoute } from '@/lib/supplyChainOptimizer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Warehouse, MapPin, Navigation, Route as RouteIcon } from 'lucide-react';

interface RouteMapProps {
  route: OptimizedRoute;
  height?: number;
}

const RouteMap = ({ route, height = 500 }: RouteMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid background
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (canvas.width / 10) * i;
      const y = (canvas.height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Scale coordinates to canvas size
    const scaleX = canvas.width / 1000;
    const scaleY = canvas.height / 1000;

    // Draw route lines
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();

    for (let i = 0; i < route.route.length - 1; i++) {
      const point1 = route.waypoints[route.route[i]];
      const point2 = route.waypoints[route.route[i + 1]];

      const x1 = point1.coordinates.x * scaleX;
      const y1 = point1.coordinates.y * scaleY;
      const x2 = point2.coordinates.x * scaleX;
      const y2 = point2.coordinates.y * scaleY;

      if (i === 0) {
        ctx.moveTo(x1, y1);
      }
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw waypoints
    route.waypoints.forEach((point, index) => {
      const x = point.coordinates.x * scaleX;
      const y = point.coordinates.y * scaleY;
      const routeIndex = route.route.indexOf(index);

      // Draw connection point
      ctx.fillStyle = point.type === 'warehouse' ? '#10b981' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw outer ring
      ctx.strokeStyle = point.type === 'warehouse' ? '#059669' : '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.stroke();

      // Draw route number
      if (routeIndex !== -1) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((routeIndex + 1).toString(), x, y);
      }

      // Draw label
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(point.name, x, y + 20);
    });

    // Draw start marker
    if (route.waypoints.length > 0) {
      const startPoint = route.waypoints[route.route[0]];
      const x = startPoint.coordinates.x * scaleX;
      const y = startPoint.coordinates.y * scaleY;

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(x, y - 20);
      ctx.lineTo(x - 10, y - 5);
      ctx.lineTo(x + 10, y - 5);
      ctx.closePath();
      ctx.fill();
    }

    // Draw end marker
    if (route.waypoints.length > 1) {
      const endPoint = route.waypoints[route.route[route.route.length - 1]];
      const x = endPoint.coordinates.x * scaleX;
      const y = endPoint.coordinates.y * scaleY;

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(x, y - 20);
      ctx.lineTo(x - 10, y - 5);
      ctx.lineTo(x + 10, y - 5);
      ctx.closePath();
      ctx.fill();
    }
  }, [route, height]);

  return (
    <Card className="p-4 bg-card border border-border">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RouteIcon className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-foreground">Route Visualization</h3>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span className="text-muted-foreground">Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span className="text-muted-foreground">Waypoint</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive"></div>
            <span className="text-muted-foreground">End</span>
          </div>
        </div>
      </div>
      <div className="relative border border-border rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ height: `${height}px` }}
        />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Total Distance</p>
          <p className="font-semibold text-foreground">{route.totalDistance} km</p>
        </div>
        <div>
          <p className="text-muted-foreground">Estimated Time</p>
          <p className="font-semibold text-foreground">{route.estimatedTime} min</p>
        </div>
        <div>
          <p className="text-muted-foreground">Waypoints</p>
          <p className="font-semibold text-foreground">{route.waypoints.length}</p>
        </div>
      </div>
    </Card>
  );
};

export default RouteMap;

