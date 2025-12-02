import { useDroppable } from '@dnd-kit/core';
import { useEditorStore } from '../../store/useEditorStore';
import { DraggableCanvasElement } from './DraggableCanvasElement';

export const Canvas = () => {
  const elements = useEditorStore((state) => state.elements);
  const selectElement = useEditorStore((state) => state.selectElement);

  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-drop-zone',
  });

  const handleBackgroundClick = () => {
    selectElement(null);
  };

  return (
    <div className="canvas-container" onClick={handleBackgroundClick}>
      <div
        ref={setNodeRef}
        className={`page-sheet ${isOver ? 'highlight' : ''}`}
        style={{ position: 'relative' }}
      >
        {elements.length === 0 && (
          <div className="empty-state">Glissez un élément n'importe où ici</div>
        )}

        {elements.map((el) => (
          <DraggableCanvasElement key={el.id} element={el} />
        ))}
      </div>
    </div>
  );
};
