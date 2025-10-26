import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DraggableElementProps {
  id: string;
  position: { x: number; y: number };
  children: React.ReactNode;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const DraggableElement: React.FC<DraggableElementProps> = ({
  id,
  position,
  children,
  isSelected,
  onSelect,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  });

  const style = {
    position: 'absolute' as const,
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    cursor: isDragging ? 'grabbing' : 'grab',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isSelected ? 10 : 1,
    border: isSelected ? '2px solid hsl(var(--primary))' : '2px solid transparent',
    borderRadius: '8px',
    padding: '4px',
    transition: isDragging ? 'none' : 'all 0.2s ease',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onSelect}
      className="hover:ring-2 hover:ring-primary/30"
    >
      {children}
    </div>
  );
};
