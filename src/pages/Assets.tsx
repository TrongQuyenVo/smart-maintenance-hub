import { useState } from 'react';
import { Search, Plus, Grid, List, MoreVertical, Pencil, Trash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AssetCard } from '@/components/assets/AssetCard';
import { mockAssets } from '@/data/mockData';
import { Asset, AssetType, AssetStatus } from '@/types/maintenance';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Assets() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AssetStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'AHU' as AssetType,
    location: '',
    status: 'online' as AssetStatus,
  });

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.id.toLowerCase().includes(search.toLowerCase()) ||
      asset.location.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreate = () => {
    const newAsset: Asset = {
      id: `AST-${String(assets.length + 1).padStart(3, '0')}`,
      name: formData.name,
      type: formData.type,
      location: formData.location,
      status: formData.status,
      specifications: {},
      installDate: new Date().toISOString(),
    };
    setAssets([...assets, newAsset]);
    setIsCreateOpen(false);
    setFormData({ name: '', type: 'AHU', location: '', status: 'online' });
    toast.success('Tạo thiết bị thành công');
  };

  const handleEdit = () => {
    if (!selectedAsset) return;
    setAssets(assets.map(a => 
      a.id === selectedAsset.id 
        ? { ...a, name: formData.name, type: formData.type, location: formData.location, status: formData.status }
        : a
    ));
    setIsEditOpen(false);
    setSelectedAsset(null);
    toast.success('Cập nhật thiết bị thành công');
  };

  const handleDelete = () => {
    if (!selectedAsset) return;
    setAssets(assets.filter(a => a.id !== selectedAsset.id));
    setIsDeleteOpen(false);
    setSelectedAsset(null);
    toast.success('Xóa thiết bị thành công');
  };

  const openEditModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setFormData({
      name: asset.name,
      type: asset.type,
      location: asset.location,
      status: asset.status,
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDeleteOpen(true);
  };

  const statusLabels: Record<AssetStatus, string> = {
    online: 'Hoạt động',
    warning: 'Cảnh báo',
    critical: 'Nghiêm trọng',
    offline: 'Ngừng hoạt động',
  };

  return (
    <motion.div 
      className="space-y-4 sm:space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Quản lý thiết bị</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {assets.length} thiết bị đã đăng ký
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Thêm thiết bị
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1 min-w-0 sm:min-w-[250px] sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên, ID hoặc vị trí..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-muted/50"
          />
        </div>

        <div className="flex gap-2 sm:gap-4">
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as AssetType | 'all')}>
            <SelectTrigger className="w-[120px] sm:w-[150px] bg-muted/50">
              <SelectValue placeholder="Loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="AHU">AHU</SelectItem>
              <SelectItem value="FCU">FCU</SelectItem>
              <SelectItem value="Chiller">Chiller</SelectItem>
              <SelectItem value="Pump">Máy bơm</SelectItem>
              <SelectItem value="Compressor">Máy nén</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AssetStatus | 'all')}>
            <SelectTrigger className="w-[120px] sm:w-[150px] bg-muted/50">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="online">Hoạt động</SelectItem>
              <SelectItem value="warning">Cảnh báo</SelectItem>
              <SelectItem value="critical">Nghiêm trọng</SelectItem>
              <SelectItem value="offline">Ngừng</SelectItem>
            </SelectContent>
          </Select>

          <div className="hidden sm:flex items-center border border-border rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', viewMode === 'grid' && 'bg-muted')}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', viewMode === 'list' && 'bg-muted')}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Assets Grid/List */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={viewMode}
          className={cn(
            'grid gap-3 sm:gap-4',
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {filteredAssets.map((asset, index) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <AssetCard 
                asset={asset} 
                onClick={() => navigate(`/assets/${asset.id}`)}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => openEditModal(asset)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => openDeleteModal(asset)}
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy thiết bị phù hợp</p>
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm thiết bị mới</DialogTitle>
            <DialogDescription>
              Tạo thiết bị mới trong hệ thống
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên thiết bị</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: AHU-02 Tòa nhà B"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Loại thiết bị</Label>
              <Select 
                value={formData.type} 
                onValueChange={(v) => setFormData({ ...formData, type: v as AssetType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AHU">AHU</SelectItem>
                  <SelectItem value="FCU">FCU</SelectItem>
                  <SelectItem value="Chiller">Chiller</SelectItem>
                  <SelectItem value="Pump">Máy bơm</SelectItem>
                  <SelectItem value="Compressor">Máy nén</SelectItem>
                  <SelectItem value="Motor">Motor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Vị trí</Label>
              <Input 
                id="location" 
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="VD: Tòa nhà A - Tầng 1"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="w-full sm:w-auto">Hủy</Button>
            <Button onClick={handleCreate} disabled={!formData.name || !formData.location} className="w-full sm:w-auto">
              Tạo thiết bị
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thiết bị</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin thiết bị
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên thiết bị</Label>
              <Input 
                id="edit-name" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Loại</Label>
              <Select 
                value={formData.type} 
                onValueChange={(v) => setFormData({ ...formData, type: v as AssetType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AHU">AHU</SelectItem>
                  <SelectItem value="FCU">FCU</SelectItem>
                  <SelectItem value="Chiller">Chiller</SelectItem>
                  <SelectItem value="Pump">Máy bơm</SelectItem>
                  <SelectItem value="Compressor">Máy nén</SelectItem>
                  <SelectItem value="Motor">Motor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Vị trí</Label>
              <Input 
                id="edit-location" 
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Trạng thái</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v) => setFormData({ ...formData, status: v as AssetStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Hoạt động</SelectItem>
                  <SelectItem value="warning">Cảnh báo</SelectItem>
                  <SelectItem value="critical">Nghiêm trọng</SelectItem>
                  <SelectItem value="offline">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="w-full sm:w-auto">Hủy</Button>
            <Button onClick={handleEdit} className="w-full sm:w-auto">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa thiết bị</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa "{selectedAsset?.name}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="w-full sm:w-auto">Hủy</Button>
            <Button variant="destructive" onClick={handleDelete} className="w-full sm:w-auto">Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
