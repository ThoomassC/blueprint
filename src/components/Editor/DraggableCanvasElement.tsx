import { useDraggable } from '@dnd-kit/core';
import type { EditorElement, AnimationType } from '../../types/editor';
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

  const updateStyle = (key: string, value: string) => {
    updateElement(element.id, {
      style: { ...element.style, [key]: value },
    });
  };

  const renderToolbar = () => {
    return (
      <div
        className="element-toolbar"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="toolbar-content">
          <div className="toolbar-section">
            {['image', 'video'].includes(element.type) ? (
              <div style={{ marginBottom: '5px' }}>
                <label style={{ fontSize: '9px', color: '#aaa' }}>
                  {element.type === 'video' ? 'URL YOUTUBE / MP4' : 'URL IMAGE'}
                </label>
                <input
                  type="text"
                  value={element.content}
                  className="toolbar-input"
                  onChange={(e) =>
                    updateElement(element.id, { content: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            ) : element.type === 'card' ? (
              <>
                <input
                  type="text"
                  value={element.content}
                  className="toolbar-input"
                  onChange={(e) =>
                    updateElement(element.id, { content: e.target.value })
                  }
                  placeholder="Titre"
                />
                <textarea
                  value={element.description || ''}
                  className="toolbar-textarea"
                  onChange={(e) =>
                    updateElement(element.id, { description: e.target.value })
                  }
                  placeholder="Description"
                />
              </>
            ) : (
              !['select'].includes(element.type) && (
                <input
                  type="text"
                  value={element.content}
                  className="toolbar-input"
                  onChange={(e) =>
                    updateElement(element.id, { content: e.target.value })
                  }
                />
              )
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
                        const newOpts = [...(element.options || [])];
                        newOpts[i] = e.target.value;
                        updateElement(element.id, { options: newOpts });
                      }}
                    />
                    <button
                      className="btn-mini-delete"
                      onClick={() => {
                        const newOpts = element.options?.filter(
                          (_, idx) => idx !== i
                        );
                        updateElement(element.id, { options: newOpts });
                      }}
                    >
                      x
                    </button>
                  </div>
                ))}
                <button
                  className="btn-add-option"
                  onClick={() => {
                    const newOpts = [
                      ...(element.options || []),
                      `Opt ${element.options ? element.options.length + 1 : 1}`,
                    ];
                    updateElement(element.id, { options: newOpts });
                  }}
                >
                  + Option
                </button>
              </div>
            )}
          </div>

          <div className="toolbar-section">
            <label
              style={{ fontSize: '10px', fontWeight: 'bold', color: '#888' }}
            >
              🎨 STYLE
            </label>
            <div
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                marginBottom: '5px',
              }}
            >
              <div title="Couleur de fond">
                <span style={{ fontSize: '10px' }}>Fond: </span>
                <input
                  type="color"
                  value={element.style?.backgroundColor || '#ffffff'}
                  onChange={(e) =>
                    updateStyle('backgroundColor', e.target.value)
                  }
                  style={{
                    cursor: 'pointer',
                    width: '25px',
                    height: '25px',
                    border: 'none',
                    padding: 0,
                  }}
                />
              </div>
              <div title="Couleur du texte">
                <span style={{ fontSize: '10px' }}>Txt: </span>
                <input
                  type="color"
                  value={element.style?.color || '#000000'}
                  onChange={(e) => updateStyle('color', e.target.value)}
                  style={{
                    cursor: 'pointer',
                    width: '25px',
                    height: '25px',
                    border: 'none',
                    padding: 0,
                  }}
                />
              </div>
            </div>
            <div>
              <label
                style={{ fontSize: '9px', color: '#aaa', display: 'block' }}
              >
                Police
              </label>
              <select
                className="toolbar-input"
                value={element.style?.fontFamily || 'Arial'}
                onChange={(e) => updateStyle('fontFamily', e.target.value)}
              >
                <option value="Arial">Arial</option>
                <option value="Verdana">Verdana</option>
                <option value="Georgia">Georgia</option>
                <option value="Courier New">Courier New</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Impact">Impact</option>
                <option value="Tahoma">Tahoma</option>
              </select>
            </div>
          </div>

          <div className="toolbar-section">
            <label
              style={{ fontSize: '10px', fontWeight: 'bold', color: '#888' }}
            >
              ⚙️ TECH
            </label>
            <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
              <select
                className="toolbar-input"
                value={element.animation.type}
                onChange={(e) =>
                  updateElement(element.id, {
                    animation: {
                      ...element.animation,
                      type: e.target.value as AnimationType,
                    },
                  })
                }
              >
                <option value="none">Anim: Non</option>
                <option value="fade-in">Fade In</option>
                <option value="slide-up">Slide Up</option>
                <option value="zoom-in">Zoom In</option>
                <option value="bounce">Bounce</option>
              </select>
            </div>
            <input
              type="text"
              className="toolbar-input"
              placeholder="Classes CSS"
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

          <div className="toolbar-actions">
            <button
              onClick={() => removeElement(element.id)}
              className="toolbar-delete-btn"
            >
              🗑️ Supprimer
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
