import React, { useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { TableHead } from '@islands/components/ui/table';
import { Button } from '@islands/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import type { EmailColumnConfig, EmailColumnId } from '../config';
import { ORDER_FIELD_MAP } from '../config';

interface DragItem {
  columnId: EmailColumnId;
  type: string;
}

interface EmailsDraggableTableHeaderProps {
  column: EmailColumnConfig;
  sortField: string;
  sortDir: 'ASC' | 'DESC';
  onSort: (_columnId: string) => void;
  moveColumn: (
    _dragId: EmailColumnId,
    _targetId: EmailColumnId,
    _position: 'before' | 'after'
  ) => void;
  dropIndicator: 'left' | 'right' | null;
  onDropIndicatorChange: (_columnId: string, _position: 'left' | 'right' | null) => void;
  isDraggingAny: boolean;
}

export function DraggableTableHeader({
  column,
  sortField,
  sortDir,
  onSort,
  moveColumn,
  dropIndicator,
  onDropIndicatorChange,
  isDraggingAny,
}: EmailsDraggableTableHeaderProps) {
  const ref = useRef<HTMLTableCellElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const canDragDrop = column.id !== 'domain' && column.id !== 'actions';
  const fieldForSort = ORDER_FIELD_MAP[column.id] ?? column.id;
  const isSorted = sortField === fieldForSort;

  const [{ isDragging }, drag, preview] = useDrag<DragItem, unknown, { isDragging: boolean }>({
    type: 'EMAIL_COLUMN',
    item: () => ({ columnId: column.id, type: 'EMAIL_COLUMN' }),
    canDrag: canDragDrop,
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      onDropIndicatorChange('', null);
    },
  });

  const [{ isOver }, drop] = useDrop<DragItem, unknown, { isOver: boolean }>({
    accept: 'EMAIL_COLUMN',
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

  const domainSticky =
    'sticky left-0 z-10 bg-gradient-to-r from-violet-50 to-indigo-50 ' +
    'shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]';
  const actionsSticky =
    'sticky right-0 z-10 bg-gradient-to-r from-violet-50 to-indigo-50 ' +
    'shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.08)]';
  const stickyClass =
    column.frozen && column.id === 'domain'
      ? domainSticky
      : column.id === 'actions'
        ? actionsSticky
        : '';

  return (
    <TableHead
      ref={ref}
      className={
        'relative bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-900 whitespace-nowrap ' +
        `${stickyClass} ` +
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
              isSorted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            onClick={e => {
              e.stopPropagation();
              onSort(column.id);
            }}
          >
            {isSorted ? (
              sortDir === 'ASC' ? (
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
