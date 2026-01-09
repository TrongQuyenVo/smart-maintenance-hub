import { useState, useEffect } from 'react';
import { Filter, Save, X, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AssetType, AssetStatus } from '@/types/maintenance';

export interface FilterState {
  types: AssetType[];
  statuses: AssetStatus[];
  floors: string[];
  systems: string[];
}

export interface SavedView {
  id: string;
  name: string;
  filters: FilterState;
  createdAt: string;
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClear: () => void;
}

const assetTypes: { value: AssetType; label: string }[] = [
  { value: 'AHU', label: 'AHU' },
  { value: 'FCU', label: 'FCU' },
  { value: 'Chiller', label: 'Chiller' },
  { value: 'Pump', label: 'Máy bơm' },
  { value: 'Compressor', label: 'Máy nén' },
  { value: 'Motor', label: 'Motor' },
];

const assetStatuses: { value: AssetStatus; label: string }[] = [
  { value: 'online', label: 'Hoạt động' },
  { value: 'warning', label: 'Cảnh báo' },
  { value: 'critical', label: 'Nghiêm trọng' },
  { value: 'offline', label: 'Ngừng hoạt động' },
];

const floors = [
  'Tầng hầm',
  'Tầng 1',
  'Tầng 2',
  'Tầng 3',
  'Tầng 10',
  'Mái',
];

const systems = [
  'HVAC',
  'Điện',
  'Nước',
  'PCCC',
  'Năng lượng',
];

export function AdvancedFilters({ filters, onFiltersChange, onClear }: AdvancedFiltersProps) {
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [viewName, setViewName] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('savedAssetViews');
    if (stored) {
      try {
        setSavedViews(JSON.parse(stored));
      } catch (e) {
        console.warn('Failed to parse saved views');
      }
    }
  }, []);

  const activeFiltersCount = 
    filters.types.length + 
    filters.statuses.length + 
    filters.floors.length + 
    filters.systems.length;

  const handleTypeChange = (type: AssetType, checked: boolean) => {
    const newTypes = checked 
      ? [...filters.types, type]
      : filters.types.filter(t => t !== type);
    onFiltersChange({ ...filters, types: newTypes });
  };

  const handleStatusChange = (status: AssetStatus, checked: boolean) => {
    const newStatuses = checked 
      ? [...filters.statuses, status]
      : filters.statuses.filter(s => s !== status);
    onFiltersChange({ ...filters, statuses: newStatuses });
  };

  const handleFloorChange = (floor: string, checked: boolean) => {
    const newFloors = checked 
      ? [...filters.floors, floor]
      : filters.floors.filter(f => f !== floor);
    onFiltersChange({ ...filters, floors: newFloors });
  };

  const handleSystemChange = (system: string, checked: boolean) => {
    const newSystems = checked 
      ? [...filters.systems, system]
      : filters.systems.filter(s => s !== system);
    onFiltersChange({ ...filters, systems: newSystems });
  };

  const handleSaveView = () => {
    if (!viewName.trim()) {
      toast.error('Vui lòng nhập tên view');
      return;
    }

    const newView: SavedView = {
      id: `view-${Date.now()}`,
      name: viewName,
      filters: { ...filters },
      createdAt: new Date().toISOString(),
    };

    const updated = [...savedViews, newView];
    setSavedViews(updated);
    localStorage.setItem('savedAssetViews', JSON.stringify(updated));
    setViewName('');
    setIsSaveDialogOpen(false);
    toast.success('Đã lưu view thành công');
  };

  const handleLoadView = (view: SavedView) => {
    onFiltersChange(view.filters);
    setIsOpen(false);
    toast.success(`Đã tải view "${view.name}"`);
  };

  const handleDeleteView = (viewId: string) => {
    const updated = savedViews.filter(v => v.id !== viewId);
    setSavedViews(updated);
    localStorage.setItem('savedAssetViews', JSON.stringify(updated));
    toast.success('Đã xóa view');
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Bộ lọc nâng cao</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Bộ lọc nâng cao</h4>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={onClear}>
                  <X className="w-3 h-3 mr-1" />
                  Xóa tất cả
                </Button>
              )}
            </div>

            {/* Asset Types */}
            <div>
              <Label className="text-sm font-medium">Loại thiết bị</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {assetTypes.map(type => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`type-${type.value}`}
                      checked={filters.types.includes(type.value)}
                      onCheckedChange={(checked) => handleTypeChange(type.value, !!checked)}
                    />
                    <Label htmlFor={`type-${type.value}`} className="text-sm">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <Label className="text-sm font-medium">Trạng thái</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {assetStatuses.map(status => (
                  <div key={status.value} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`status-${status.value}`}
                      checked={filters.statuses.includes(status.value)}
                      onCheckedChange={(checked) => handleStatusChange(status.value, !!checked)}
                    />
                    <Label htmlFor={`status-${status.value}`} className="text-sm">
                      {status.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Floors */}
            <div>
              <Label className="text-sm font-medium">Tầng</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {floors.map(floor => (
                  <div key={floor} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`floor-${floor}`}
                      checked={filters.floors.includes(floor)}
                      onCheckedChange={(checked) => handleFloorChange(floor, !!checked)}
                    />
                    <Label htmlFor={`floor-${floor}`} className="text-sm">
                      {floor}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Systems */}
            <div>
              <Label className="text-sm font-medium">Hệ thống</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {systems.map(system => (
                  <div key={system} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`system-${system}`}
                      checked={filters.systems.includes(system)}
                      onCheckedChange={(checked) => handleSystemChange(system, !!checked)}
                    />
                    <Label htmlFor={`system-${system}`} className="text-sm">
                      {system}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={activeFiltersCount === 0}>
                    <Save className="w-3 h-3 mr-1" />
                    Lưu view
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Lưu bộ lọc</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Tên view</Label>
                      <Input 
                        value={viewName}
                        onChange={(e) => setViewName(e.target.value)}
                        placeholder="VD: Thiết bị HVAC tầng 1"
                      />
                    </div>
                    <Button onClick={handleSaveView} className="w-full">
                      Lưu
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {savedViews.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Bookmark className="w-3 h-3 mr-1" />
                      Views đã lưu ({savedViews.length})
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-2">
                    <div className="space-y-1">
                      {savedViews.map(view => (
                        <div 
                          key={view.id} 
                          className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer group"
                        >
                          <span 
                            className="text-sm truncate flex-1"
                            onClick={() => handleLoadView(view)}
                          >
                            {view.name}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={() => handleDeleteView(view.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
