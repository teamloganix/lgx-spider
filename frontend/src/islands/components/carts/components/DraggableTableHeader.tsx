import React, { useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { TableHead } from '@islands/components/ui/table';
import { Button } from '@islands/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import type { CartColumn } from '../config';

interface DragItem {
  columnId: string;
  type: string;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface DraggableTableHeaderProps {
  column: CartColumn;
  sortConfig: SortConfig | null;
  onSort: (_columnId: string) => void;
  moveColumn: (_dragId: string, _targetId: string, _position: 'before' | 'after') => void;
  dropIndicator: 'left' | 'right' | null;
  onDropIndicatorChange: (_columnId: string, _position: 'left' | 'right' | null) => void;
  isDraggingAny: boolean;
}

export function DraggableTableHeader({
  column,
  sortConfig,
  onSort,
  moveColumn,
  dropIndicator,
  onDropIndicatorChange,
  isDraggingAny,
}: DraggableTableHeaderProps) {
  const ref = useRef<HTMLTableCellElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const canDragDrop = column.id !== 'actions';

  const [{ isDragging }, drag, preview] = useDrag<DragItem, unknown, { isDragging: boolean }>({
    type: 'CART_COLUMN',
    item: () => ({ columnId: column.id, type: 'CART_COLUMN' }),
    canDrag: canDragDrop,
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      onDropIndicatorChange('', null);
    },
  });

  const [{ isOver }, drop] = useDrop<DragItem, unknown, { isOver: boolean }>({
    accept: 'CART_COLUMN',
    canDrop: () => canDragDrop,
    collect: monitor => ({
      isOver: monitor.isOver() && monitor.canDrop(),
    }),
    hover: (item, monitor) => {
      if (!ref.current || !canDragDrop) return;
      if (item.columnId === column.id) {
        onDropIndicatorChange(column.id, null);
        return;
      }
      const rect = ref.current.getBoundingClientRect();
      const midX = (rect.right - rect.left) / 2;
      const offset = monitor.getClientOffset();
      if (!offset) return;
      const x = offset.x - rect.left;
      onDropIndicatorChange(column.id, x < midX ? 'left' : 'right');
    },
    drop: (item, monitor) => {
      if (!canDragDrop || !ref.current) return;
      if (item.columnId === column.id) return;
      const rect = ref.current.getBoundingClientRect();
      const midX = (rect.right - rect.left) / 2;
      const offset = monitor.getClientOffset();
      if (!offset) return;
      const x = offset.x - rect.left;
      moveColumn(item.columnId, column.id, x < midX ? 'before' : 'after');
      onDropIndicatorChange('', null);
    },
  });

  preview(drop(ref));

  useEffect(() => {
    if (dragHandleRef.current && canDragDrop) {
      drag(dragHandleRef.current);
    }
  }, [drag, canDragDrop]);

  return (
    <TableHead
      ref={ref}
      className={
        'bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-900 whitespace-nowrap ' +
        `${isDragging ? 'opacity-30 bg-violet-200' : ''} ` +
        `${isOver && canDragDrop && !isDragging ? 'bg-violet-100' : ''}`
      }
    >
      {dropIndicator === 'left' && isDraggingAny && (
        <div
          className="absolute left-0 top-1 bottom-1 w-1 bg-violet-500 rounded-full z-30"
          style={{ transform: 'translateX(-50%)' }}
        />
      )}
      {dropIndicator === 'right' && isDraggingAny && (
        <div
          className="absolute right-0 top-1 bottom-1 w-1 bg-violet-500 rounded-full z-30"
          style={{ transform: 'translateX(50%)' }}
        />
      )}
      <div className="flex items-center gap-2 group">
        {canDragDrop && (
          <div
            ref={dragHandleRef}
            className={
              'flex-shrink-0 cursor-grab active:cursor-grabbing ' +
              'text-violet-400 hover:text-violet-600 opacity-0 group-hover:opacity-100'
            }
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}
        <span className="font-semibold">{column.label}</span>
        {column.sortable && (
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 w-6 p-0 ${
              sortConfig?.key === column.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            onClick={e => {
              e.stopPropagation();
              onSort(column.id);
            }}
          >
            {sortConfig?.key === column.id ? (
              sortConfig.direction === 'asc' ? (
                <ArrowUp className="h-3 w-3 text-violet-600" />
              ) : (
                <ArrowDown className="h-3 w-3 text-violet-600" />
              )
            ) : (
              <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>
    </TableHead>
  );
}
