import { useState, useEffect } from 'react';
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import { Sidebar } from './components/Editor/Sidebar';
import { Canvas } from './components/Editor/Canvas';
import { useEditorStore } from './store/useEditorStore';
import { audioDescription } from './services/audioDescription';
import type { ElementType } from './types/editor';
import './App.css';

function App() {
  const addElement = useEditorStore((state) => state.addElement);
  const updatePosition = useEditorStore((state) => state.updatePosition);
  const getJSON = useEditorStore((state) => state.getJSON);
  const isPreviewMode = useEditorStore((state) => state.isPreviewMode);
  const togglePreviewMode = useEditorStore((state) => state.togglePreviewMode);
  const removeElement = useEditorStore((state) => state.removeElement);

  const [activeDragType, setActiveDragType] = useState<ElementType | null>(
    null
  );
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  useEffect(() => {
    audioDescription.setEnabled(isAudioEnabled);
  }, [isAudioEnabled]);

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (!isAudioEnabled) {
      audioDescription.announceSuccess('Audio description activée');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (useEditorStore.getState().isPreviewMode) return;
      const currentSelectedId = useEditorStore.getState().selectedId;
      if (!currentSelectedId) return;
      const activeElement = document.activeElement?.tagName;
      const isTyping =
        activeElement === 'INPUT' || activeElement === 'TEXTAREA';

      if (isTyping) return;

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        removeElement(currentSelectedId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [removeElement]);

  const handleDragStart = (event: DragStartEvent) => {
    const type = event.active.data.current?.type as ElementType;
    if (type) setActiveDragType(type);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    setActiveDragType(null);

    if (!over || over.id !== 'canvas-drop-zone') return;

    const type = active.data.current?.type as ElementType;
    const isCanvasElement = active.data.current?.isCanvasElement;
    const elementId = active.id as string;

    if (isCanvasElement) {
      const currentElement = useEditorStore
        .getState()
        .elements.find((e) => e.id === elementId);
      if (currentElement) {
        updatePosition(
          elementId,
          currentElement.x + delta.x,
          currentElement.y + delta.y
        );
      }
    } else {
      const canvasRect = document
        .querySelector('.page-sheet')
        ?.getBoundingClientRect();
      const dropX = active.rect.current?.translated
        ? active.rect.current.translated.left - (canvasRect?.left ?? 0)
        : 0;
      const dropY = active.rect.current?.translated
        ? active.rect.current.translated.top - (canvasRect?.top ?? 0)
        : 0;

      addElement(type, dropX, dropY);
    }
  };

  const handleExport = () => {
    const fileNameInput = window.prompt(
      'Entrez le nom de votre fichier (ex: ma-page) :',
      `blueprint-${new Date().toISOString().slice(0, 10)}`
    );

    if (fileNameInput === null) return;

    let fileName = fileNameInput.trim();
    if (!fileName) fileName = 'export-sans-nom';
    if (!fileName.endsWith('.json')) fileName += '.json';

    const jsonString = getJSON();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getOverlayLabel = (type: ElementType) => {
    switch (type) {
      case 'header':
        return 'En-tête';
      case 'footer':
        return 'Pied de page';
      case 'button':
        return 'Bouton';
      case 'text':
        return 'Texte';
      case 'card':
        return 'Carte';
      default:
        return 'Elément';
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="app-layout">
        <header className="top-bar">
          <div className="logo-area">
            <h1>Blueprint Builder</h1>
          </div>

          <div className="header-center">
            <div className="mode-toggle">
              <button
                className={`toggle-btn ${!isPreviewMode ? 'active' : ''}`}
                onClick={() => isPreviewMode && togglePreviewMode()}
              >
                ✏️ Édition
              </button>
              <button
                className={`toggle-btn ${isPreviewMode ? 'active' : ''}`}
                onClick={() => !isPreviewMode && togglePreviewMode()}
              >
                👁️ Aperçu
              </button>
            </div>
          </div>

          <div className="header-actions">
            <button
              onClick={toggleAudio}
              className="btn-audio"
              title={
                isAudioEnabled
                  ? "Désactiver l'audio description"
                  : "Activer l'audio description"
              }
            >
              {isAudioEnabled ? '🔊' : '🔇'} Audio
            </button>
            <button onClick={handleExport} className="btn-export">
              📥 Télécharger JSON
            </button>
          </div>
        </header>

        <main className="editor-workspace">
          {!isPreviewMode && <Sidebar />}
          <Canvas />
        </main>
      </div>

      <DragOverlay>
        {activeDragType ? (
          <div className="drag-overlay-item">
            {getOverlayLabel(activeDragType)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
