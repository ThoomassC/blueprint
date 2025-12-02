import { useDraggable } from '@dnd-kit/core';
import type { EditorElement } from '../../types/editor';
import { RenderNode } from './RenderNode';
import { useEditorStore } from '../../store/useEditorStore';

interface Props {
  element: EditorElement;
}

export const DraggableCanvasElement = ({ element }: Props) => {
  const selectElement = useEditorStore((state) => state.selectElement);
  const selectedId = useEditorStore((state) => state.selectedId);
  const updateElement = useEditorStore((state) => state.updateElement);
  const removeElement = useEditorStore((state) => state.removeElement);
  const isPreviewMode = useEditorStore((state) => state.isPreviewMode);
  const isSelected = !isPreviewMode && selectedId === element.id;

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: element.id,
      data: { type: element.type, isCanvasElement: true, id: element.id },
      disabled: isPreviewMode,
    });

  const style: React.CSSProperties = {
    position: 'absolute',
    left: element.x + (transform ? transform.x : 0),
    top: element.y + (transform ? transform.y : 0),
    cursor: isPreviewMode ? 'default' : isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging ? 1000 : isSelected ? 100 : 1,
    outline: isSelected ? '2px solid #3498db' : 'none',
  };

  const updateStyle = (key: string, value: string) =>
    updateElement(element.id, { style: { ...element.style, [key]: value } });

  const updateCurrentSlide = (
    key: 'title' | 'description' | 'imageUrl',
    value: string
  ) => {
    const currentIndex = parseInt(element.content) || 0;
    const newSlides = [...(element.slides || [])];
    if (newSlides[currentIndex]) {
      newSlides[currentIndex] = { ...newSlides[currentIndex], [key]: value };
      updateElement(element.id, { slides: newSlides });
    }
  };

  const renderToolbar = () => {
    const currentIndex = parseInt(element.content) || 0;
    return (
      <div
        className="element-toolbar"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="toolbar-content">
          <div className="toolbar-section">
            {element.type === 'carousel' && (
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}
              >
                <label style={{ fontSize: '9px', color: '#aaa' }}>
                  SLIDE {currentIndex + 1}
                </label>
                <input
                  type="text"
                  placeholder="Titre"
                  className="toolbar-input"
                  value={element.slides?.[currentIndex]?.title || ''}
                  onChange={(e) => updateCurrentSlide('title', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="URL Image"
                  className="toolbar-input"
                  value={element.slides?.[currentIndex]?.imageUrl || ''}
                  onChange={(e) =>
                    updateCurrentSlide('imageUrl', e.target.value)
                  }
                />
                <textarea
                  placeholder="Desc"
                  className="toolbar-textarea"
                  value={element.slides?.[currentIndex]?.description || ''}
                  onChange={(e) =>
                    updateCurrentSlide('description', e.target.value)
                  }
                />
                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                  <button
                    className="btn-add-option"
                    onClick={() =>
                      updateElement(element.id, {
                        slides: [
                          ...(element.slides || []),
                          { title: 'New', description: '', imageUrl: '' },
                        ],
                      })
                    }
                  >
                    + Slide
                  </button>
                  <button
                    className="btn-mini-delete"
                    onClick={() =>
                      updateElement(element.id, {
                        slides: element.slides?.filter(
                          (_, i) => i !== currentIndex
                        ),
                        content: '0',
                      })
                    }
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}

            {['image', 'video'].includes(element.type) && (
              <>
                <label style={{ fontSize: '9px', color: '#aaa' }}>URL</label>
                <input
                  className="toolbar-input"
                  value={element.content}
                  onChange={(e) =>
                    updateElement(element.id, { content: e.target.value })
                  }
                />
              </>
            )}

            {element.type === 'card' && (
              <>
                <input
                  className="toolbar-input"
                  value={element.content}
                  onChange={(e) =>
                    updateElement(element.id, { content: e.target.value })
                  }
                />
                <textarea
                  className="toolbar-textarea"
                  value={element.description}
                  onChange={(e) =>
                    updateElement(element.id, { description: e.target.value })
                  }
                />
              </>
            )}

            {element.type === 'select' && (
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}
              >
                {element.options?.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', gap: '5px' }}>
                    <input
                      value={opt}
                      className="toolbar-input-small"
                      onChange={(e) => {
                        const n = [...(element.options || [])];
                        n[i] = e.target.value;
                        updateElement(element.id, { options: n });
                      }}
                    />
                    <button
                      className="btn-mini-delete"
                      onClick={() =>
                        updateElement(element.id, {
                          options: element.options?.filter(
                            (_, idx) => idx !== i
                          ),
                        })
                      }
                    >
                      x
                    </button>
                  </div>
                ))}
                <button
                  className="btn-add-option"
                  onClick={() =>
                    updateElement(element.id, {
                      options: [
                        ...(element.options || []),
                        `Opt ${element.options?.length}`,
                      ],
                    })
                  }
                >
                  + Option
                </button>
              </div>
            )}

            {!['select', 'card', 'image', 'video', 'carousel'].includes(
              element.type
            ) && (
              <input
                className="toolbar-input"
                value={element.content}
                onChange={(e) =>
                  updateElement(element.id, { content: e.target.value })
                }
              />
            )}
          </div>

          <div className="toolbar-section">
            <label
              style={{ fontSize: '10px', fontWeight: 'bold', color: '#888' }}
            >
              🎨 STYLE
            </label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
              <input
                type="color"
                value={element.style?.backgroundColor || '#ffffff'}
                onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                style={{ width: '20px', height: '20px', border: 'none' }}
              />
              <input
                type="color"
                value={element.style?.color || '#000000'}
                onChange={(e) => updateStyle('color', e.target.value)}
                style={{ width: '20px', height: '20px', border: 'none' }}
              />
            </div>
            <select
              className="toolbar-input"
              value={element.style?.fontFamily || 'Arial'}
              onChange={(e) => updateStyle('fontFamily', e.target.value)}
            >
              <option value="Arial">Arial</option>
              <option value="Courier New">Courier</option>
              <option value="Times New Roman">Times</option>
              <option value="Impact">Impact</option>
            </select>
          </div>

          <div className="toolbar-section">
            <label
              style={{ fontSize: '10px', fontWeight: 'bold', color: '#888' }}
            >
              ⚙️ CONFIG TECH
            </label>

            <div style={{ marginBottom: '5px' }}>
              <label
                style={{
                  fontSize: '9px',
                  color: '#aaa',
                  display: 'block',
                  marginBottom: '2px',
                }}
              >
                ID Unique (JS)
              </label>
              <input
                type="text"
                className="toolbar-input"
                placeholder="ex: mon-bouton-1"
                value={element.attributes.htmlId || ''}
                onChange={(e) =>
                  updateElement(element.id, {
                    attributes: {
                      ...element.attributes,
                      htmlId: e.target.value,
                    },
                  })
                }
              />
            </div>

            {/* CLASSES CSS */}
            <div>
              <label
                style={{
                  fontSize: '9px',
                  color: '#aaa',
                  display: 'block',
                  marginBottom: '2px',
                }}
              >
                Classes CSS
              </label>
              <input
                type="text"
                className="toolbar-input"
                placeholder="ex: btn-lg shadow-md"
                value={element.attributes.className || ''}
                onChange={(e) =>
                  updateElement(element.id, {
                    attributes: {
                      ...element.attributes,
                      className: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>

          <div className="toolbar-actions">
            <button
              onClick={() => removeElement(element.id)}
              className="toolbar-delete-btn"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(!isPreviewMode ? listeners : {})}
      {...attributes}
      onClick={(e) => {
        if (!isPreviewMode) {
          e.stopPropagation();
          selectElement(element.id);
        }
      }}
    >
      {isSelected && !isDragging && renderToolbar()}
      <RenderNode element={element} />
    </div>
  );
};
