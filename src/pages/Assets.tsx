import { useEffect, useState } from 'react';
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
import { Modal, Form, Input as AntInput, Select as AntSelect } from 'antd';
import { AssetCard } from '@/components/assets/AssetCard';
import { AdvancedFilters, FilterState } from '@/components/assets/AdvancedFilters';
import { mockAssets } from '@/data/mockData';
import { Asset, AssetType, AssetStatus } from '@/types/maintenance';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Assets() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Advanced filters
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    types: [],
    statuses: [],
    floors: [],
    systems: [],
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    const raw = localStorage.getItem('assets');
    if (raw) {
      try { setAssets(JSON.parse(raw)); } catch (e) { console.warn('Failed to parse assets from localStorage', e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('assets', JSON.stringify(assets));
  }, [assets]);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.id.toLowerCase().includes(search.toLowerCase()) ||
      asset.location.toLowerCase().includes(search.toLowerCase());

    // Advanced filters
    const matchesType = advancedFilters.types.length === 0 || advancedFilters.types.includes(asset.type);
    const matchesStatus = advancedFilters.statuses.length === 0 || advancedFilters.statuses.includes(asset.status);
    
    // Floor filter - check if location contains floor
    const matchesFloor = advancedFilters.floors.length === 0 || 
      advancedFilters.floors.some(floor => asset.location.toLowerCase().includes(floor.toLowerCase()));
    
    // System filter - map asset types to systems
    const assetSystem = getAssetSystem(asset.type);
    const matchesSystem = advancedFilters.systems.length === 0 || 
      advancedFilters.systems.includes(assetSystem);

    return matchesSearch && matchesType && matchesStatus && matchesFloor && matchesSystem;
  });

  // Map asset type to system
  const getAssetSystem = (type: AssetType): string => {
    const systemMap: Record<AssetType, string> = {
      'AHU': 'HVAC',
      'FCU': 'HVAC',
      'Chiller': 'HVAC',
      'Pump': 'Nước',
      'Compressor': 'Năng lượng',
      'Motor': 'Điện',
    };
    return systemMap[type] || 'Khác';
  };

  const handleClearFilters = () => {
    setAdvancedFilters({
      types: [],
      statuses: [],
      floors: [],
      systems: [],
    });
  };

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      const newAsset: Asset = {
        id: `AST-${Date.now().toString(36).toUpperCase()}`,
        name: values.name,
        type: values.type,
        location: values.location,
        status: values.status || 'online',
        specifications: {},
        installDate: new Date().toISOString(),
      };
      setAssets(prev => [newAsset, ...prev]);
      setIsCreateOpen(false);
      createForm.resetFields();
      toast.success('Tạo thiết bị thành công');
    } catch (err) {
      console.warn('Create asset failed', err);
    }
  };

  const handleEdit = async () => {
    if (!selectedAsset) return;
    try {
      const values = await editForm.validateFields();
      setAssets(prev => prev.map(a =>
        a.id === selectedAsset.id
          ? { ...a, name: values.name, type: values.type, location: values.location, status: values.status || a.status }
          : a
      ));
      setIsEditOpen(false);
      setSelectedAsset(null);
      editForm.resetFields();
      toast.success('Cập nhật thiết bị thành công');
    } catch (err) {
      console.warn('Edit asset failed', err);
    }
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
    editForm.setFieldsValue({
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
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xl sm:text-2xl font-bold">Quản lý thiết bị</span>
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
          <AdvancedFilters 
            filters={advancedFilters}
            onFiltersChange={setAdvancedFilters}
            onClear={handleClearFilters}
          />

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
              transition={{ duration: 0.3 }}
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
      <Modal
        title="Thêm thiết bị mới"
        open={isCreateOpen}
        centered
        onCancel={() => { setIsCreateOpen(false); createForm.resetFields(); }}
        footer={[
          <Button key="cancel" variant="ghost" onClick={() => { setIsCreateOpen(false); createForm.resetFields(); }}>Hủy</Button>,
          <Button key="save" onClick={handleCreate}>Tạo thiết bị</Button>
        ]}
      >
        <Form form={createForm} layout="vertical" initialValues={{ type: 'AHU', status: 'online' }}>
          <Form.Item name="name" label="Tên thiết bị" rules={[{ required: true, message: 'Nhập tên thiết bị' }]}>
            <AntInput placeholder="VD: AHU-02 Tòa nhà B" />
          </Form.Item>
          <Form.Item name="type" label="Loại thiết bị" rules={[{ required: true }]}>
            <AntSelect>
              <AntSelect.Option value="AHU">AHU</AntSelect.Option>
              <AntSelect.Option value="FCU">FCU</AntSelect.Option>
              <AntSelect.Option value="Chiller">Chiller</AntSelect.Option>
              <AntSelect.Option value="Pump">Máy bơm</AntSelect.Option>
              <AntSelect.Option value="Compressor">Máy nén</AntSelect.Option>
              <AntSelect.Option value="Motor">Motor</AntSelect.Option>
            </AntSelect>
          </Form.Item>
          <Form.Item name="location" label="Vị trí" rules={[{ required: true, message: 'Nhập vị trí' }]}>
            <AntInput placeholder="VD: Tòa nhà A - Tầng 1" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa thiết bị"
        open={isEditOpen}
        centered
        onCancel={() => { setIsEditOpen(false); setSelectedAsset(null); editForm.resetFields(); }}
        footer={[
          <Button key="cancel" variant="ghost" onClick={() => { setIsEditOpen(false); setSelectedAsset(null); editForm.resetFields(); }}>Hủy</Button>,
          <Button key="save" onClick={handleEdit}>Lưu thay đổi</Button>
        ]}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="name" label="Tên thiết bị" rules={[{ required: true, message: 'Nhập tên thiết bị' }]}>
            <AntInput />
          </Form.Item>
          <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
            <AntSelect>
              <AntSelect.Option value="AHU">AHU</AntSelect.Option>
              <AntSelect.Option value="FCU">FCU</AntSelect.Option>
              <AntSelect.Option value="Chiller">Chiller</AntSelect.Option>
              <AntSelect.Option value="Pump">Máy bơm</AntSelect.Option>
              <AntSelect.Option value="Compressor">Máy nén</AntSelect.Option>
              <AntSelect.Option value="Motor">Motor</AntSelect.Option>
            </AntSelect>
          </Form.Item>
          <Form.Item name="location" label="Vị trí" rules={[{ required: true, message: 'Nhập vị trí' }]}>
            <AntInput />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <AntSelect>
              <AntSelect.Option value="online">Hoạt động</AntSelect.Option>
              <AntSelect.Option value="warning">Cảnh báo</AntSelect.Option>
              <AntSelect.Option value="critical">Nghiêm trọng</AntSelect.Option>
              <AntSelect.Option value="offline">Ngừng hoạt động</AntSelect.Option>
            </AntSelect>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        title="Xóa thiết bị"
        open={isDeleteOpen}
        centered
        maskStyle={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
        onCancel={() => setIsDeleteOpen(false)}
        footer={[
          <Button key="cancel" variant="ghost" onClick={() => setIsDeleteOpen(false)}>Hủy</Button>,
          <Button key="delete" variant="destructive" onClick={handleDelete}>Xóa</Button>
        ]}
      >
        <p>Bạn có chắc muốn xóa "{selectedAsset?.name}"? Hành động này không thể hoàn tác.</p>
      </Modal>
    </motion.div>
  );
}
