import { useDraggable } from '@dnd-kit/core';
import type { ElementType } from '../../types/editor';

interface Props {
  type: ElementType;
  label: string;
  title: string;
}

export const SidebarItem = ({ type, label, title }: Props) => {
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
      {label}
      <span className="tooltip-text">{title}</span>
    </div>
  );
};
