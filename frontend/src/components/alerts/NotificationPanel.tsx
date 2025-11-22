import { useAlerts } from '@/hooks/useAlerts';
import { Alert } from '@/types/alerts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, AlertCircle, AlertTriangle, Info, CheckCircle2, Package, ClipboardList, Truck, ArrowRightLeft, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface NotificationPanelProps {
  onClose: () => void;
}

const NotificationPanel = ({ onClose }: NotificationPanelProps) => {
  const { alerts } = useAlerts();
  const navigate = useNavigate();
  const [readAlerts, setReadAlerts] = useState<Set<string>>(new Set());

  const getIcon = (type: Alert['type'], severity: Alert['severity']) => {
    if (severity === 'error') return <AlertCircle className="w-4 h-4 text-destructive" />;
    if (severity === 'warning') return <AlertTriangle className="w-4 h-4 text-warning" />;
    if (severity === 'info') return <Info className="w-4 h-4 text-accent" />;
    return <CheckCircle2 className="w-4 h-4 text-success" />;
  };

  const getTypeIcon = (type: Alert['type']) => {
    switch (type) {
      case 'low_stock':
      case 'overstock':
      case 'reorder_needed':
        return <Package className="w-4 h-4" />;
      case 'pending_receipt':
        return <ClipboardList className="w-4 h-4" />;
      case 'pending_delivery':
        return <Truck className="w-4 h-4" />;
      case 'pending_transfer':
        return <ArrowRightLeft className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const handleAlertClick = (alert: Alert) => {
    setReadAlerts(prev => new Set(prev).add(alert.id));
    if (alert.actionUrl) {
      navigate(alert.actionUrl);
      onClose();
    }
  };

  const isRead = (alertId: string) => readAlerts.has(alertId);

  const unreadAlerts = alerts.filter(a => !isRead(a.id));
  const readAlertsList = alerts.filter(a => isRead(a.id));

  return (
    <Card className="absolute right-0 top-12 w-96 max-h-[600px] shadow-2xl z-50 border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-border">
        <CardTitle className="text-lg">Notifications</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {alerts.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {unreadAlerts.length > 0 && (
                <>
                  {unreadAlerts.map((alert) => (
                    <AlertItem
                      key={alert.id}
                      alert={alert}
                      onClick={() => handleAlertClick(alert)}
                      isRead={false}
                      getIcon={getIcon}
                      getTypeIcon={getTypeIcon}
                    />
                  ))}
                </>
              )}
              {readAlertsList.length > 0 && (
                <>
                  {readAlertsList.map((alert) => (
                    <AlertItem
                      key={alert.id}
                      alert={alert}
                      onClick={() => handleAlertClick(alert)}
                      isRead={true}
                      getIcon={getIcon}
                      getTypeIcon={getTypeIcon}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

interface AlertItemProps {
  alert: Alert;
  onClick: () => void;
  isRead: boolean;
  getIcon: (type: Alert['type'], severity: Alert['severity']) => React.ReactNode;
  getTypeIcon: (type: Alert['type']) => React.ReactNode;
}

const AlertItem = ({ alert, onClick, isRead, getIcon, getTypeIcon }: AlertItemProps) => {
  return (
    <div
      className={cn(
        'p-4 hover:bg-muted/50 transition-colors cursor-pointer',
        !isRead && 'bg-accent/5'
      )}
      onClick={onClick}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          {getTypeIcon(alert.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={cn('font-semibold text-sm', !isRead && 'font-bold')}>
              {alert.title}
            </h4>
            {getIcon(alert.type, alert.severity)}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {format(alert.timestamp, 'MMM dd, HH:mm')}
            </span>
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                alert.severity === 'error' && 'border-destructive text-destructive',
                alert.severity === 'warning' && 'border-warning text-warning',
                alert.severity === 'info' && 'border-accent text-accent',
                alert.severity === 'success' && 'border-success text-success'
              )}
            >
              {alert.severity}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;

