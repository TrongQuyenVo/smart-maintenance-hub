import { useState, useRef } from 'react';
import { Upload, X, ZoomIn, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

export function ImageUpload({ images, onImagesChange, disabled = false, maxImages = 10 }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast.error(`Đã đạt giới hạn ${maxImages} ảnh`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    filesToProcess.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} không phải là file ảnh`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`${file.name} vượt quá kích thước 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onImagesChange([...images, base64]);
        toast.success('Đã tải ảnh lên thành công');
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    toast.info('Đã xóa ảnh');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Ảnh đính kèm</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {images.length}/{maxImages} ảnh
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={disabled || images.length >= maxImages}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Tải ảnh lên
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <div 
              key={idx} 
              className="relative aspect-square bg-muted rounded-lg overflow-hidden group"
            >
              <img 
                src={img} 
                alt={`Ảnh ${idx + 1}`} 
                className="w-full h-full object-cover"
              />
              {/* Overlay on hover */}
              <div className={cn(
                "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity",
                "flex items-center justify-center gap-2"
              )}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => setPreviewImage(img)}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                {!disabled && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-destructive/80"
                    onClick={() => removeImage(idx)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {/* Image number badge */}
              <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                #{idx + 1}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-muted-foreground/20 rounded-lg">
          <ImageIcon className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground text-sm">Chưa có ảnh đính kèm</p>
          {!disabled && (
            <Button 
              variant="link" 
              size="sm" 
              className="mt-2"
              onClick={() => fileInputRef.current?.click()}
            >
              Nhấn để tải ảnh
            </Button>
          )}
        </div>
      )}

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">Xem ảnh</DialogTitle>
          {previewImage && (
            <img 
              src={previewImage} 
              alt="Preview" 
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
