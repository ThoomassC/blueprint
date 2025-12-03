import { useDraggable } from '@dnd-kit/core';
import type { ElementType } from '../../types/editor';
import React from "react";

interface Props {
  type: ElementType;
  icon: React.ReactNode;
  title: string;
}

export const SidebarItem = ({ type, icon, title }: Props) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `sidebar-item-${type}`,
    data: { type },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        cursor: 'grabbing',
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="sidebar-item group"
    >
      <div className="icon-container">
        {icon}
      </div>
      <span className="tooltip-text">{title}</span>
    </div>
  );
};
