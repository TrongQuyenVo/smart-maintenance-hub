import { useState } from 'react';
import { Check, Camera, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ChecklistItem } from '@/types/maintenance';

interface ChecklistComponentProps {
  items: ChecklistItem[];
  onUpdate: (items: ChecklistItem[]) => void;
  readonly?: boolean;
}

export function ChecklistComponent({ items, onUpdate, readonly = false }: ChecklistComponentProps) {
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    if (readonly) return;
    const updated = items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onUpdate(updated);
  };

  const updateNote = (id: string, note: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, note } : item
    );
    onUpdate(updated);
  };

  const completedCount = items.filter(i => i.completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Tiến độ Checklist: {completedCount}/{items.length}
        </span>
        <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-info transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Items */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              'p-4 rounded-lg border transition-all duration-200',
              item.completed
                ? 'bg-success/5 border-success/20'
                : 'bg-card border-border hover:border-primary/30'
            )}
          >
            <div className="flex items-start gap-4">
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => toggleItem(item.id)}
                disabled={readonly}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">
                    #{index + 1}
                  </span>
                  <span className={cn(
                    'font-medium',
                    item.completed && 'line-through text-muted-foreground'
                  )}>
                    {item.title}
                  </span>
                </div>

                {/* Note Section */}
                {expandedNote === item.id ? (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      placeholder="Thêm ghi chú..."
                      value={item.note || ''}
                      onChange={(e) => updateNote(item.id, e.target.value)}
                      className="min-h-[80px] bg-muted/50"
                      disabled={readonly}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedNote(null)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Đóng
                    </Button>
                  </div>
                ) : item.note ? (
                  <p
                    className="mt-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => setExpandedNote(item.id)}
                  >
                    {item.note}
                  </p>
                ) : null}

                {/* Image Preview */}
                {item.imageUrl && (
                  <div className="mt-3">
                    <img
                      src={item.imageUrl}
                      alt="Bằng chứng"
                      className="max-w-[200px] rounded-lg border border-border"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              {!readonly && (
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => setExpandedNote(expandedNote === item.id ? null : item.id)}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {item.completed && (
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-success/20">
                  <Check className="w-4 h-4 text-success" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
