import { useDroppable } from '@dnd-kit/core';
import { useEditorStore } from '../../store/useEditorStore';
import { DraggableCanvasElement } from './DraggableCanvasElement';

export const Canvas = () => {
  const elements = useEditorStore((state) => state.elements);
  const selectElement = useEditorStore((state) => state.selectElement);
  const selectedId = useEditorStore((state) => state.selectedId);

  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-drop-zone',
  });

  const handleBackgroundClick = () => {
    selectElement(null);
  };

  // Calculer les barres de centrage
  const canvasWidth = 800;
  const canvasHeight = 1000;
  const centerXPosition = canvasWidth / 2;
  const centerYPosition = canvasHeight / 2;

  return (
    <div className="canvas-container" onClick={handleBackgroundClick}>
      <div
        ref={setNodeRef}
        className={`page-sheet ${isOver ? 'highlight' : ''}`}
        style={{ position: 'relative' }}
      >
        {/* Barres de centrage visuelles */}
        {selectedId && (
          <>
            {/* Ligne verticale centrale */}
            <div
              style={{
                position: 'absolute',
                left: centerXPosition - 1,
                top: 0,
                width: '2px',
                height: '100%',
                backgroundColor: '#3498db',
                opacity: 0.3,
                pointerEvents: 'none',
                zIndex: 50,
                borderLeft: '1px dashed #3498db',
              }}
            />
            {/* Ligne horizontale centrale */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: centerYPosition - 1,
                width: '100%',
                height: '2px',
                backgroundColor: '#3498db',
                opacity: 0.3,
                pointerEvents: 'none',
                zIndex: 50,
                borderTop: '1px dashed #3498db',
              }}
            />
          </>
        )}

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
