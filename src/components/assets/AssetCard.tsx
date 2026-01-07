import { Server, MapPin, Calendar, Wrench } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Asset } from '@/types/maintenance';
import { AssetStatusIndicator } from './AssetStatusIndicator';
import { cn, getAssetTypeLabel } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface AssetCardProps {
  asset: Asset;
  onClick?: () => void;
}

const typeColors: Record<string, string> = {
  AHU: 'bg-info/20 text-info border-info/30',
  FCU: 'bg-primary/20 text-primary border-primary/30',
  Chiller: 'bg-success/20 text-success border-success/30',
  Pump: 'bg-warning/20 text-warning border-warning/30',
  Compressor: 'bg-accent/20 text-accent-foreground border-accent/30',
  Motor: 'bg-destructive/20 text-destructive border-destructive/30',
};

export function AssetCard({ asset, onClick }: AssetCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/assets/${asset.id}`);
    }
  };

  return (
    <Card
      className={cn(
        'group p-5 cursor-pointer transition-all duration-300',
        'hover:border-primary/50 hover:shadow-glow',
        'bg-card border-border'
      )}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted/50 group-hover:bg-primary/10 transition-colors">
            <Server className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold group-hover:text-primary transition-colors">
              {asset.name}
            </h3>
            <p className="text-sm text-muted-foreground font-mono">{asset.id}</p>
          </div>
        </div>
        <AssetStatusIndicator status={asset.status} showLabel />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{asset.location}</span>
        </div>
        {asset.nextMaintenance && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Bảo trì tiếp theo: {new Date(asset.nextMaintenance).toLocaleDateString('vi-VN')}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <Badge variant="outline" className={cn(typeColors[asset.type])}>
          {getAssetTypeLabel(asset.type)}
        </Badge>
        {asset.manufacturer && (
          <span className="text-xs text-muted-foreground">
            {asset.manufacturer} • {asset.model}
          </span>
        )}
      </div>
    </Card>
  );
}
