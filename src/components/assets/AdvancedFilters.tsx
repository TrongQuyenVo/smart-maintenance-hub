import { useState, useEffect } from 'react';
import { Filter, Save, X, ChevronDown, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AssetType, AssetStatus } from '@/types/maintenance';

export interface FilterConfig {
  types: AssetType[];
  statuses: AssetStatus[];
  floors: string[];
  systems: string[];
}

export interface SavedView {
  id: string;
  name: string;
  filters: FilterConfig;
}

interface AdvancedFiltersProps {
  filters: FilterConfig;
  onFiltersChange: (filters: FilterConfig) => void;
  availableFloors: string[];
  availableSystems: string[];
}

const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: 'AHU', label: 'AHU' },
  { value: 'FCU', label: 'FCU' },
  { value: 'Chiller', label: 'Chiller' },
  { value: 'Pump', label: 'Máy bơm' },
  { value: 'Compressor', label: 'Máy nén' },
  { value: 'Motor', label: 'Motor' },
];

const ASSET_STATUSES: { value: AssetStatus; label: string }[] = [
  { value: 'online', label: 'Hoạt động' },
  { value: 'warning', label: 'Cảnh báo' },
  { value: 'critical', label: 'Nghiêm trọng' },
  { value: 'offline', label: 'Ngừng hoạt động' },
];

const STORAGE_KEY = 'asset-saved-views';

export function AdvancedFilters({
  filters,
  onFiltersChange,
  availableFloors,
  availableSystems,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [newViewName, setNewViewName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedViews(JSON.parse(stored));
      } catch (e) {
        console.warn('Failed to parse saved views', e);
      }
    }
  }, []);

  const activeFilterCount =
    filters.types.length +
    filters.statuses.length +
    filters.floors.length +
    filters.systems.length;

  const toggleType = (type: AssetType) => {
    const updated = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onFiltersChange({ ...filters, types: updated });
  };

  const toggleStatus = (status: AssetStatus) => {
    const updated = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: updated });
  };

  const toggleFloor = (floor: string) => {
    const updated = filters.floors.includes(floor)
      ? filters.floors.filter((f) => f !== floor)
      : [...filters.floors, floor];
    onFiltersChange({ ...filters, floors: updated });
  };

  const toggleSystem = (system: string) => {
    const updated = filters.systems.includes(system)
      ? filters.systems.filter((s) => s !== system)
      : [...filters.systems, system];
    onFiltersChange({ ...filters, systems: updated });
  };

  const clearFilters = () => {
    onFiltersChange({ types: [], statuses: [], floors: [], systems: [] });
  };

  const saveCurrentView = () => {
    if (!newViewName.trim()) {
      toast.error('Vui lòng nhập tên cho bộ lọc');
      return;
    }

    const newView: SavedView = {
      id: Date.now().toString(),
      name: newViewName.trim(),
      filters: { ...filters },
    };

    const updated = [...savedViews, newView];
    setSavedViews(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setNewViewName('');
    setShowSaveInput(false);
    toast.success('Đã lưu bộ lọc');
  };

  const loadView = (view: SavedView) => {
    onFiltersChange(view.filters);
    toast.success(`Đã tải bộ lọc "${view.name}"`);
  };

  const deleteView = (viewId: string) => {
    const updated = savedViews.filter((v) => v.id !== viewId);
    setSavedViews(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    toast.success('Đã xóa bộ lọc');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Bộ lọc nâng cao</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Bộ lọc nâng cao</h4>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Xóa tất cả
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {/* Saved Views */}
          {savedViews.length > 0 && (
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Bookmark className="w-4 h-4" />
                  Bộ lọc đã lưu ({savedViews.length})
                </span>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                <div className="space-y-2">
                  {savedViews.map((view) => (
                    <div
                      key={view.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50"
                    >
                      <button
                        className="text-sm text-left flex-1"
                        onClick={() => loadView(view)}
                      >
                        {view.name}
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => deleteView(view.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Asset Types */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 border-t">
              <span className="text-sm font-medium">Loại thiết bị</span>
              <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <div className="space-y-2">
                {ASSET_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={filters.types.includes(type.value)}
                      onCheckedChange={() => toggleType(type.value)}
                    />
                    <span className="text-sm">{type.label}</span>
                  </label>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Status */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 border-t">
              <span className="text-sm font-medium">Trạng thái</span>
              <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <div className="space-y-2">
                {ASSET_STATUSES.map((status) => (
                  <label
                    key={status.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={filters.statuses.includes(status.value)}
                      onCheckedChange={() => toggleStatus(status.value)}
                    />
                    <span className="text-sm">{status.label}</span>
                  </label>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Floors */}
          {availableFloors.length > 0 && (
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 border-t">
                <span className="text-sm font-medium">Tầng</span>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                <div className="space-y-2">
                  {availableFloors.map((floor) => (
                    <label
                      key={floor}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={filters.floors.includes(floor)}
                        onCheckedChange={() => toggleFloor(floor)}
                      />
                      <span className="text-sm">{floor}</span>
                    </label>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Systems */}
          {availableSystems.length > 0 && (
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 border-t">
                <span className="text-sm font-medium">Hệ thống</span>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                <div className="space-y-2">
                  {availableSystems.map((system) => (
                    <label
                      key={system}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={filters.systems.includes(system)}
                        onCheckedChange={() => toggleSystem(system)}
                      />
                      <span className="text-sm">{system}</span>
                    </label>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        {/* Save View */}
        <div className="p-4 border-t">
          {showSaveInput ? (
            <div className="flex gap-2">
              <Input
                placeholder="Tên bộ lọc..."
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveCurrentView()}
                autoFocus
              />
              <Button size="sm" onClick={saveCurrentView}>
                Lưu
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowSaveInput(false);
                  setNewViewName('');
                }}
              >
                Hủy
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setShowSaveInput(true)}
              disabled={activeFilterCount === 0}
            >
              <Save className="w-4 h-4" />
              Lưu bộ lọc hiện tại
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
