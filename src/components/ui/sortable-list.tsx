"use client";

import type { ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SortableListProps<T> {
  id: string; // must be unique per list; keeps SSR/CSR aria ids identical
  items: readonly T[];
  getId: (item: T) => string;
  onMove: (activeId: string, overId: string) => void;
  renderItem: (item: T, index: number, handle: ReactNode) => ReactNode;
  className?: string;
}

export function SortableList<T>({
  id,
  items,
  getId,
  onMove,
  renderItem,
  className,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent): void => {
    if (over && active.id !== over.id)
      onMove(String(active.id), String(over.id));
  };

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(getId)}
        strategy={verticalListSortingStrategy}
      >
        <ul className={className}>
          {items.map((item, index) => (
            <SortableItem key={getId(item)} id={getId(item)}>
              {(handle) => renderItem(item, index, handle)}
            </SortableItem>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

interface SortableItemProps {
  id: string;
  children: (handle: ReactNode) => ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(
      transform ? { ...transform, x: 0 } : null,
    ), // vertical only
    transition,
  };

  // Only the handle starts a drag, so row clicks and touch scrolling still work
  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label="Drag to reorder"
      className="grid size-8 shrink-0 cursor-grab touch-none place-items-center rounded-md text-muted hover:text-fg active:cursor-grabbing"
    >
      <GripVertical className="size-4" aria-hidden />
    </button>
  );

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "list-none",
        isDragging && "relative z-10 rounded-xl bg-surface-2 shadow-xl",
      )}
    >
      {children(handle)}
    </li>
  );
}
