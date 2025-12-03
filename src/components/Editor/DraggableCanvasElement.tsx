import { useDraggable } from '@dnd-kit/core';
import type { EditorElement } from '../../types/editor';
import { RenderNode } from './RenderNode';
import { useEditorStore } from '../../store/useEditorStore';
import React from 'react';

interface Props {
  element: EditorElement;
}

// Configuration des fonctionnalités par type de composant
const TOOLBAR_CONFIG: Record<
  string,
  {
    showContent: boolean;
    showStyle: boolean;
    showColors: boolean;
    showFont: boolean;
    showTechConfig: boolean;
    customFields?: string[];
  }
> = {
  text: {
    showContent: true,
    showStyle: true,
    showColors: true,
    showFont: true,
    showTechConfig: true,
  },
  heading: {
    showContent: true,
    showStyle: true,
    showColors: true,
    showFont: true,
    showTechConfig: true,
  },
  button: {
    showContent: true,
    showStyle: true,
    showColors: true,
    showFont: true,
    showTechConfig: true,
  },
  input: {
    showContent: true,
    showStyle: true,
    showColors: true,
    showFont: true,
    showTechConfig: true,
  },
  textarea: {
    showContent: true,
    showStyle: true,
    showColors: true,
    showFont: true,
    showTechConfig: true,
  },
  image: {
    showContent: false, // On utilise un champ URL personnalisé
    showStyle: false,
    showColors: false,
    showFont: false,
    showTechConfig: true,
    customFields: ['url'],
  },
  video: {
    showContent: false, // On utilise un champ URL personnalisé
    showStyle: false,
    showColors: false,
    showFont: false,
    showTechConfig: true,
    customFields: ['url'],
  },
  card: {
    showContent: false, // Champs personnalisés
    showStyle: true,
    showColors: true,
    showFont: true,
    showTechConfig: true,
    customFields: ['card'],
  },
  select: {
    showContent: false, // Gestion des options
    showStyle: true,
    showColors: true,
    showFont: true,
    showTechConfig: true,
    customFields: ['options'],
  },
  carousel: {
    showContent: false, // Gestion des slides
    showStyle: true,
    showColors: true,
    showFont: false,
    showTechConfig: true,
    customFields: ['slides'],
  },
};

export const DraggableCanvasElement = ({ element }: Props) => {
  const selectElement = useEditorStore((state) => state.selectElement);
  const selectedId = useEditorStore((state) => state.selectedId);
  const updateElement = useEditorStore((state) => state.updateElement);
  const removeElement = useEditorStore((state) => state.removeElement);
  const centerElement = useEditorStore((state) => state.centerElement);
  const isPreviewMode = useEditorStore((state) => state.isPreviewMode);
  const isSelected = !isPreviewMode && selectedId === element.id;
  const [isResizing, setIsResizing] = React.useState(false);
  const [resizePreview, setResizePreview] = React.useState<{
    width: number;
    height: number;
  } | null>(null);

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

  const config = TOOLBAR_CONFIG[element.type] || TOOLBAR_CONFIG.text;

  const updateStyle = (key: string, value: string | number) => {
    const finalValue = typeof value === 'number' ? `${value}px` : value;
    updateElement(element.id, {
      style: { ...element.style, [key]: finalValue },
    });
  };

  const extractNumericValue = (value?: string): number => {
    if (!value) return 100;
    const numeric = parseFloat(value);
    return isNaN(numeric) ? 100 : numeric;
  };

  const startResize = (direction: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const initialWidth = extractNumericValue(element.style?.width);
    const initialHeight = extractNumericValue(element.style?.height);
    const initialX = element.x;
    const initialY = element.y;

    const MIN_SIZE = 40;
    const MAX_SIZE = 1000;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = initialWidth;
      let newHeight = initialHeight;
      let newX = initialX;
      let newY = initialY;

      // Redimensionner depuis la droite/gauche
      if (direction.includes('e')) {
        newWidth = initialWidth + deltaX;
      }
      if (direction.includes('w')) {
        newWidth = initialWidth - deltaX;
        newX = initialX + deltaX; // Ajuster X pour que l'élément grandisse vers la gauche
      }

      // Redimensionner depuis le bas/haut
      if (direction.includes('s')) {
        newHeight = initialHeight + deltaY;
      }
      if (direction.includes('n')) {
        newHeight = initialHeight - deltaY;
        newY = initialY + deltaY; // Ajuster Y pour que l'élément grandisse vers le haut
      }

      newWidth = Math.max(MIN_SIZE, Math.min(MAX_SIZE, newWidth));
      newHeight = Math.max(MIN_SIZE, Math.min(MAX_SIZE, newHeight));

      setResizePreview({ width: newWidth, height: newHeight });
      updateStyle('width', newWidth);
      updateStyle('height', newHeight);
      
      // Mettre à jour la position uniquement si on redimensionne depuis l'ouest ou le nord
      if (direction.includes('w') || direction.includes('n')) {
        updateElement(element.id, { x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizePreview(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

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

  const renderCustomFields = () => {
    const currentIndex = parseInt(element.content) || 0;

    if (config.customFields?.includes('slides')) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
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
            onChange={(e) => updateCurrentSlide('imageUrl', e.target.value)}
          />
          <textarea
            placeholder="Description"
            className="toolbar-textarea"
            value={element.slides?.[currentIndex]?.description || ''}
            onChange={(e) => updateCurrentSlide('description', e.target.value)}
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
                  slides: element.slides?.filter((_, i) => i !== currentIndex),
                  content: '0',
                })
              }
            >
              🗑️
            </button>
          </div>
        </div>
      );
    }

    if (config.customFields?.includes('url')) {
      return (
        <>
          <label style={{ fontSize: '9px', color: '#aaa' }}>
            URL {element.type === 'image' ? 'Image' : 'Vidéo'}
          </label>
          <input
            className="toolbar-input"
            placeholder={`https://example.com/${element.type}.${
              element.type === 'image' ? 'jpg' : 'mp4'
            }`}
            value={element.content}
            onChange={(e) =>
              updateElement(element.id, { content: e.target.value })
            }
          />
        </>
      );
    }

    if (config.customFields?.includes('card')) {
      return (
        <>
          <label style={{ fontSize: '9px', color: '#aaa' }}>Titre</label>
          <input
            className="toolbar-input"
            placeholder="Titre de la carte"
            value={element.content}
            onChange={(e) =>
              updateElement(element.id, { content: e.target.value })
            }
          />
          <label style={{ fontSize: '9px', color: '#aaa', marginTop: '5px' }}>
            Description
          </label>
          <textarea
            className="toolbar-textarea"
            placeholder="Description de la carte"
            value={element.description}
            onChange={(e) =>
              updateElement(element.id, { description: e.target.value })
            }
          />
        </>
      );
    }

    if (config.customFields?.includes('options')) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '9px', color: '#aaa' }}>Options</label>
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
                    options: element.options?.filter((_, idx) => idx !== i),
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
                  `Option ${(element.options?.length || 0) + 1}`,
                ],
              })
            }
          >
            + Option
          </button>
        </div>
      );
    }

    return null;
  };

  const renderToolbar = () => {
    return (
      <div
        className="element-toolbar"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="toolbar-content">
          {/* Section Contenu */}
          {(config.showContent || config.customFields) && (
            <div className="toolbar-section">
              <label
                style={{
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#888',
                  marginBottom: '5px',
                  display: 'block',
                }}
              >
                📝 CONTENU
              </label>

              {config.customFields ? (
                renderCustomFields()
              ) : (
                <input
                  className="toolbar-input"
                  placeholder="Contenu..."
                  value={element.content}
                  onChange={(e) =>
                    updateElement(element.id, { content: e.target.value })
                  }
                />
              )}
            </div>
          )}

          {/* Section Style */}
          {config.showStyle && (
            <div className="toolbar-section">
              <label
                style={{
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#888',
                  marginBottom: '5px',
                  display: 'block',
                }}
              >
                🎨 STYLE
              </label>

              {config.showColors && (
                <div
                  style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: '8px',
                        color: '#aaa',
                        display: 'block',
                      }}
                    >
                      Fond
                    </label>
                    <input
                      type="color"
                      value={element.style?.backgroundColor || '#ffffff'}
                      onChange={(e) =>
                        updateStyle('backgroundColor', e.target.value)
                      }
                      style={{
                        width: '30px',
                        height: '30px',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: '8px',
                        color: '#aaa',
                        display: 'block',
                      }}
                    >
                      Texte
                    </label>
                    <input
                      type="color"
                      value={element.style?.color || '#000000'}
                      onChange={(e) => updateStyle('color', e.target.value)}
                      style={{
                        width: '30px',
                        height: '30px',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    />
                  </div>
                </div>
              )}

              {config.showFont && (
                <>
                  <label
                    style={{
                      fontSize: '9px',
                      color: '#aaa',
                      display: 'block',
                      marginBottom: '2px',
                    }}
                  >
                    Police
                  </label>
                  <select
                    className="toolbar-input"
                    value={element.style?.fontFamily || 'Arial'}
                    onChange={(e) => updateStyle('fontFamily', e.target.value)}
                  >
                    <option value="Arial">Arial</option>
                    <option value="Courier New">Courier</option>
                    <option value="Times New Roman">Times</option>
                    <option value="Impact">Impact</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                </>
              )}
            </div>
          )}

          {/* Section Dimensions */}
          <div className="toolbar-section">
            <label
              style={{
                fontSize: '10px',
                fontWeight: 'bold',
                color: '#888',
                marginBottom: '5px',
                display: 'block',
              }}
            >
              📏 DIMENSIONS
            </label>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: '8px',
                    color: '#aaa',
                    display: 'block',
                    marginBottom: '2px',
                  }}
                >
                  L:{' '}
                  {resizePreview
                    ? Math.round(resizePreview.width)
                    : Math.round(extractNumericValue(element.style?.width))}
                  px
                </label>
                <input
                  type="range"
                  value={extractNumericValue(element.style?.width)}
                  onChange={(e) =>
                    updateStyle('width', parseInt(e.target.value))
                  }
                  style={{
                    width: '100%',
                    cursor: 'pointer',
                  }}
                  min="40"
                  max="1000"
                />
                <input
                  type="number"
                  value={Math.round(extractNumericValue(element.style?.width))}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 100;
                    updateStyle('width', Math.max(40, Math.min(1000, val)));
                  }}
                  style={{
                    width: '100%',
                    padding: '4px',
                    fontSize: '11px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginTop: '2px',
                  }}
                  min="40"
                  max="1000"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: '8px',
                    color: '#aaa',
                    display: 'block',
                    marginBottom: '2px',
                  }}
                >
                  H:{' '}
                  {resizePreview
                    ? Math.round(resizePreview.height)
                    : Math.round(extractNumericValue(element.style?.height))}
                  px
                </label>
                <input
                  type="range"
                  value={extractNumericValue(element.style?.height)}
                  onChange={(e) =>
                    updateStyle('height', parseInt(e.target.value))
                  }
                  style={{
                    width: '100%',
                    cursor: 'pointer',
                  }}
                  min="40"
                  max="1000"
                />
                <input
                  type="number"
                  value={Math.round(extractNumericValue(element.style?.height))}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 100;
                    updateStyle('height', Math.max(40, Math.min(1000, val)));
                  }}
                  style={{
                    width: '100%',
                    padding: '4px',
                    fontSize: '11px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginTop: '2px',
                  }}
                  min="40"
                  max="1000"
                />
              </div>
            </div>
          </div>

          {/* Section Alignement */}
          <div className="toolbar-section">
            <label
              style={{
                fontSize: '10px',
                fontWeight: 'bold',
                color: '#888',
                marginBottom: '5px',
                display: 'block',
              }}
            >
              📐 ALIGNEMENT
            </label>

            {/* Alignement vertical */}
            <label
              style={{
                fontSize: '9px',
                color: '#aaa',
                display: 'block',
                marginBottom: '2px',
              }}
            >
              Vertical
            </label>
            <div style={{ display: 'flex', gap: '3px', marginBottom: '8px' }}>
              {['top', 'middle', 'bottom'].map((align) => (
                <button
                  key={align}
                  onClick={() => updateStyle('verticalAlign', align)}
                  style={{
                    flex: 1,
                    padding: '4px 8px',
                    fontSize: '11px',
                    backgroundColor:
                      element.style?.verticalAlign === align
                        ? '#3498db'
                        : '#e0e0e0',
                    color:
                      element.style?.verticalAlign === align ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontWeight:
                      element.style?.verticalAlign === align
                        ? 'bold'
                        : 'normal',
                  }}
                >
                  {align === 'top' ? '↑' : align === 'middle' ? '↕️' : '↓'}
                </button>
              ))}
            </div>

            {/* Alignement horizontal (élément) */}
            <label
              style={{
                fontSize: '9px',
                color: '#aaa',
                display: 'block',
                marginBottom: '2px',
              }}
            >
              Horizontal (élément)
            </label>
            <div style={{ display: 'flex', gap: '3px', marginBottom: '8px' }}>
              {['left', 'center', 'right'].map((align) => (
                <button
                  key={align}
                  onClick={() => updateStyle('horizontalAlign', align)}
                  style={{
                    flex: 1,
                    padding: '4px 8px',
                    fontSize: '11px',
                    backgroundColor:
                      element.style?.horizontalAlign === align
                        ? '#3498db'
                        : '#e0e0e0',
                    color:
                      element.style?.horizontalAlign === align
                        ? 'white'
                        : '#333',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontWeight:
                      element.style?.horizontalAlign === align
                        ? 'bold'
                        : 'normal',
                  }}
                >
                  {align === 'left' ? '←' : align === 'center' ? '↔️' : '→'}
                </button>
              ))}
            </div>

            {/* Alignement du texte */}
            <label
              style={{
                fontSize: '9px',
                color: '#aaa',
                display: 'block',
                marginBottom: '2px',
              }}
            >
              Texte
            </label>
            <div style={{ display: 'flex', gap: '3px', marginBottom: '8px' }}>
              {['left', 'center', 'right'].map((align) => (
                <button
                  key={`text-${align}`}
                  onClick={() => updateStyle('textAlign', align)}
                  style={{
                    flex: 1,
                    padding: '4px 8px',
                    fontSize: '11px',
                    backgroundColor:
                      element.style?.textAlign === align
                        ? '#27ae60'
                        : '#e0e0e0',
                    color:
                      element.style?.textAlign === align ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontWeight:
                      element.style?.textAlign === align ? 'bold' : 'normal',
                  }}
                >
                  {align === 'left' ? '⬅️' : align === 'center' ? '⏹️' : '➡️'}
                </button>
              ))}
            </div>

            {/* Justify content */}
            <label
              style={{
                fontSize: '9px',
                color: '#aaa',
                display: 'block',
                marginBottom: '2px',
              }}
            >
              Distribution
            </label>
            <div style={{ display: 'flex', gap: '3px' }}>
              {[
                { value: 'flex-start', label: 'Start' },
                { value: 'center', label: 'Center' },
                { value: 'flex-end', label: 'End' },
                { value: 'space-between', label: 'Entre' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateStyle('justifyContent', option.value)}
                  style={{
                    flex: 1,
                    padding: '4px 4px',
                    fontSize: '10px',
                    backgroundColor:
                      element.style?.justifyContent === option.value
                        ? '#e74c3c'
                        : '#e0e0e0',
                    color:
                      element.style?.justifyContent === option.value
                        ? 'white'
                        : '#333',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontWeight:
                      element.style?.justifyContent === option.value
                        ? 'bold'
                        : 'normal',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section Config Technique */}
          {config.showTechConfig && (
            <div className="toolbar-section">
              <label
                style={{
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#888',
                  marginBottom: '5px',
                  display: 'block',
                }}
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
          )}

          {/* Actions */}
          <div className="toolbar-actions">
            <button
              onClick={() => centerElement(element.id)}
              className="toolbar-center-btn"
              title="Centrer l'élément sur le canvas"
              style={{
                padding: '8px 12px',
                backgroundColor: '#f39c12',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold',
                marginRight: '8px',
              }}
            >
              📍 Centrer
            </button>
            <button
              onClick={() => removeElement(element.id)}
              className="toolbar-delete-btn"
              title="Supprimer l'élément"
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
      {/* Poignées de redimensionnement */}
      {isSelected && !isDragging && !isPreviewMode && (
        <>
          {/* Coin haut-gauche */}
          <div
            onMouseDown={startResize('nw')}
            style={{
              position: 'absolute',
              top: '-8px',
              left: '-8px',
              width: '16px',
              height: '16px',
              backgroundColor: '#3498db',
              border: '2px solid white',
              borderRadius: '50%',
              cursor: 'nwse-resize',
              zIndex: isResizing ? 1001 : 101,
              opacity: isResizing ? 1 : 0.7,
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              transition: 'all 0.1s',
            }}
            title="Redimensionner"
          />
          {/* Coin haut-droit */}
          <div
            onMouseDown={startResize('ne')}
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              width: '16px',
              height: '16px',
              backgroundColor: '#3498db',
              border: '2px solid white',
              borderRadius: '50%',
              cursor: 'nesw-resize',
              zIndex: isResizing ? 1001 : 101,
              opacity: isResizing ? 1 : 0.7,
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              transition: 'all 0.1s',
            }}
            title="Redimensionner"
          />
          {/* Coin bas-gauche */}
          <div
            onMouseDown={startResize('sw')}
            style={{
              position: 'absolute',
              bottom: '-8px',
              left: '-8px',
              width: '16px',
              height: '16px',
              backgroundColor: '#3498db',
              border: '2px solid white',
              borderRadius: '50%',
              cursor: 'nesw-resize',
              zIndex: isResizing ? 1001 : 101,
              opacity: isResizing ? 1 : 0.7,
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              transition: 'all 0.1s',
            }}
            title="Redimensionner"
          />
          {/* Coin bas-droit */}
          <div
            onMouseDown={startResize('se')}
            style={{
              position: 'absolute',
              bottom: '-8px',
              right: '-8px',
              width: '16px',
              height: '16px',
              backgroundColor: '#27ae60',
              border: '2px solid white',
              borderRadius: '50%',
              cursor: 'se-resize',
              zIndex: isResizing ? 1001 : 101,
              opacity: isResizing ? 1 : 0.7,
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              transition: 'all 0.1s',
            }}
            title="Redimensionner (coin bas-droit)"
          />
          {/* Milieu haut */}
          <div
            onMouseDown={startResize('n')}
            style={{
              position: 'absolute',
              top: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '12px',
              height: '12px',
              backgroundColor: '#3498db',
              border: '2px solid white',
              borderRadius: '50%',
              cursor: 'ns-resize',
              zIndex: isResizing ? 1001 : 101,
              opacity: 0.5,
              transition: 'all 0.1s',
            }}
          />
          {/* Milieu bas */}
          <div
            onMouseDown={startResize('s')}
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '12px',
              height: '12px',
              backgroundColor: '#3498db',
              border: '2px solid white',
              borderRadius: '50%',
              cursor: 'ns-resize',
              zIndex: isResizing ? 1001 : 101,
              opacity: 0.5,
              transition: 'all 0.1s',
            }}
          />
          {/* Milieu gauche */}
          <div
            onMouseDown={startResize('w')}
            style={{
              position: 'absolute',
              left: '-6px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '12px',
              height: '12px',
              backgroundColor: '#3498db',
              border: '2px solid white',
              borderRadius: '50%',
              cursor: 'ew-resize',
              zIndex: isResizing ? 1001 : 101,
              opacity: 0.5,
              transition: 'all 0.1s',
            }}
          />
          {/* Milieu droit */}
          <div
            onMouseDown={startResize('e')}
            style={{
              position: 'absolute',
              right: '-6px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '12px',
              height: '12px',
              backgroundColor: '#3498db',
              border: '2px solid white',
              borderRadius: '50%',
              cursor: 'ew-resize',
              zIndex: isResizing ? 1001 : 101,
              opacity: 0.5,
              transition: 'all 0.1s',
            }}
          />

          {/* Affichage des dimensions pendant le redimensionnement */}
          {isResizing && resizePreview && (
            <div
              style={{
                position: 'absolute',
                top: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#2c3e50',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                whiteSpace: 'nowrap',
                zIndex: 1002,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                fontWeight: 'bold',
              }}
            >
              {Math.round(resizePreview.width)} ×{' '}
              {Math.round(resizePreview.height)}px
            </div>
          )}
        </>
      )}

      {isSelected && !isDragging && renderToolbar()}
      <RenderNode element={element} />
    </div>
  );
};
