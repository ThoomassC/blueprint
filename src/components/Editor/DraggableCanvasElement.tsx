import { useDraggable } from "@dnd-kit/core";
import type { EditorElement } from "../../types/editor";
import { RenderNode } from "./RenderNode";
import { useEditorStore } from "../../store/useEditorStore";
import React from "react";

interface Props {
  element: EditorElement;
}

const TOOLBAR_CONFIG: Record<
  string,
  {
    showContent: boolean;
    showStyle: boolean;
    showColors: boolean;
    showFont: boolean;
    showTechConfig: boolean;
    showRadius: boolean;
    showShadow: boolean;
    showAlignment: boolean;
    customFields?: string[];
  }
> = {
  text: {
    showContent: true,
    showStyle: true,
    showColors: true,
    showFont: true,
    showTechConfig: true,
    showRadius: true,
    showShadow: true,
    showAlignment: true,
  },
  heading: {
    showContent: true,
    showStyle: true,
    showColors: true,
    showFont: true,
    showTechConfig: true,
    showRadius: false,
    showShadow: false,
    showAlignment: true,
  },
  button: {
    showContent: true,
    showStyle: true,
    showColors: true,
    showFont: true,
    showTechConfig: true,
    showRadius: true,
    showShadow: true,
    showAlignment: true,
  },
  input: {
    showContent: true,
    showStyle: true,
    showColors: true,
    showFont: true,
    showTechConfig: true,
    showRadius: true,
    showShadow: true,
    showAlignment: true,
  },
  "input-text": {
    showContent: true,
    showStyle: true,
    showColors: true,
    showFont: true,
    showTechConfig: true,
    showRadius: true,
    showShadow: false,
    showAlignment: true,
  },
  "input-email": {
    showContent: true,
    showStyle: true,
    showColors: true,
    showFont: true,
    showTechConfig: true,
    showRadius: true,
    showShadow: false,
    showAlignment: true,
  },
  "input-number": {
    showContent: true,
    showStyle: true,
    showColors: true,
    showFont: true,
    showTechConfig: true,
    showRadius: true,
    showShadow: false,
    showAlignment: true,
  },
  textarea: {
    showContent: true,
    showStyle: true,
    showColors: true,
    showFont: true,
    showTechConfig: true,
    showRadius: true,
    showShadow: false,
    showAlignment: true,
  },
  image: {
    showContent: false,
    showStyle: false,
    showColors: false,
    showFont: false,
    showTechConfig: true,
    showRadius: true,
    showShadow: true,
    showAlignment: false,
    customFields: ["url"],
  },
  video: {
    showContent: false,
    showStyle: false,
    showColors: false,
    showFont: false,
    showTechConfig: true,
    showRadius: true,
    showShadow: true,
    showAlignment: false,
    customFields: ["url"],
  },
  card: {
    showContent: false,
    showStyle: true,
    showColors: true,
    showFont: true,
    showTechConfig: true,
    showRadius: true,
    showShadow: true,
    showAlignment: true,
    customFields: ["card"],
  },
  select: {
    showContent: false,
    showStyle: true,
    showColors: true,
    showFont: true,
    showTechConfig: true,
    showRadius: true,
    showShadow: false,
    showAlignment: false,
    customFields: ["options"],
  },
  carousel: {
    showContent: false,
    showStyle: true,
    showColors: true,
    showFont: false,
    showTechConfig: true,
    showRadius: true,
    showShadow: true,
    showAlignment: false,
    customFields: ["slides"],
  },
  map: {
    showContent: false,
    showStyle: true,
    showColors: false,
    showFont: false,
    showTechConfig: true,
    showRadius: true,
    showShadow: true,
    showAlignment: false,
    customFields: ["location"],
  },
};

export const DraggableCanvasElement = ({ element }: Props) => {
  const selectElement = useEditorStore((state) => state.selectElement);
  const selectedId = useEditorStore((state) => state.selectedId);
  const selectedChildId = useEditorStore((state) => state.selectedChildId);
  const updateElement = useEditorStore((state) => state.updateElement);
  const updateFormChild = useEditorStore((state) => state.updateFormChild);
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
    position: "absolute",
    left: element.x + (transform ? transform.x : 0),
    top: element.y + (transform ? transform.y : 0),
    cursor: isPreviewMode ? "default" : isDragging ? "grabbing" : "grab",
    zIndex: isDragging ? 1000 : isSelected ? 100 : 1,
  };

  const config = TOOLBAR_CONFIG[element.type] || TOOLBAR_CONFIG.text;

  // Déterminer si on édite un enfant ou le parent
  const selectedChild = selectedChildId
    ? element.children?.find((child) => child.id === selectedChildId)
    : null;

  const currentElement = selectedChild || element;
  const currentConfig = selectedChild
    ? TOOLBAR_CONFIG[selectedChild.type] || TOOLBAR_CONFIG.text
    : config;

  const updateStyle = (key: string, value: string | number) => {
    const finalValue = typeof value === "number" ? `${value}px` : value;

    if (selectedChild) {
      // Mettre à jour le style de l'enfant
      updateFormChild(element.id, selectedChild.id, {
        style: { ...selectedChild.style, [key]: finalValue },
      });
    } else {
      // Mettre à jour le style du parent
      updateElement(element.id, {
        style: { ...element.style, [key]: finalValue },
      });
    }
  };

  const updateCurrentSlide = (
    key: "title" | "description" | "imageUrl",
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

    if (config.customFields?.includes("slides")) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontSize: "9px", color: "#aaa" }}>
            SLIDE {currentIndex + 1}
          </label>
          <input
            type="text"
            placeholder="Titre"
            className="toolbar-input"
            value={element.slides?.[currentIndex]?.title || ""}
            onChange={(e) => updateCurrentSlide("title", e.target.value)}
          />
          <input
            type="text"
            placeholder="URL Image"
            className="toolbar-input"
            value={element.slides?.[currentIndex]?.imageUrl || ""}
            onChange={(e) => updateCurrentSlide("imageUrl", e.target.value)}
          />
          <textarea
            placeholder="Description"
            className="toolbar-textarea"
            value={element.slides?.[currentIndex]?.description || ""}
            onChange={(e) => updateCurrentSlide("description", e.target.value)}
          />
          <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
            <button
              className="btn-add-option"
              onClick={() =>
                updateElement(element.id, {
                  slides: [
                    ...(element.slides || []),
                    { title: "New", description: "", imageUrl: "" },
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
                    (_: unknown, i: number) => i !== currentIndex
                  ),
                  content: "0",
                })
              }
            >
              🗑️
            </button>
          </div>
        </div>
      );
    }

    if (config.customFields?.includes("url")) {
      return (
        <>
          <label style={{ fontSize: "9px", color: "#aaa" }}>
            URL {element.type === "image" ? "Image" : "Vidéo"}
          </label>
          <input
            className="toolbar-input"
            placeholder={`https://example.com/${element.type}.${
              element.type === "image" ? "jpg" : "mp4"
            }`}
            value={element.content}
            onChange={(e) =>
              updateElement(element.id, { content: e.target.value })
            }
          />
        </>
      );
    }

    if (config.customFields?.includes("card")) {
      return (
        <>
          <label style={{ fontSize: "9px", color: "#aaa" }}>Titre</label>
          <input
            className="toolbar-input"
            placeholder="Titre de la carte"
            value={element.content}
            onChange={(e) =>
              updateElement(element.id, { content: e.target.value })
            }
          />
          <label style={{ fontSize: "9px", color: "#aaa", marginTop: "5px" }}>
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

    if (config.customFields?.includes("options")) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontSize: "9px", color: "#aaa" }}>Options</label>
          {element.options?.map((opt, i) => (
            <div key={i} style={{ display: "flex", gap: "5px" }}>
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

    if (config.customFields?.includes("location")) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontSize: "9px", color: "#aaa" }}>
            NOM DE LA CARTE
          </label>
          <input
            className="toolbar-input"
            placeholder="Nom du lieu"
            value={element.content}
            onChange={(e) =>
              updateElement(element.id, { content: e.target.value })
            }
          />

          <div
            style={{
              marginTop: "10px",
              borderTop: "1px solid #ddd",
              paddingTop: "10px",
            }}
          >
            <label style={{ fontSize: "9px", color: "#aaa" }}>
              POINTS SUR LA CARTE
            </label>
            {(element.markers || []).map((marker, i) => (
              <div
                key={marker.id}
                style={{
                  marginTop: "5px",
                  padding: "8px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "4px",
                  border: "1px solid #e0e0e0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "5px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "8px",
                      color: "#666",
                      fontWeight: "bold",
                    }}
                  >
                    POINT {i + 1}
                  </label>
                  <button
                    className="btn-mini-delete"
                    onClick={() =>
                      updateElement(element.id, {
                        markers: element.markers?.filter(
                          (m) => m.id !== marker.id
                        ),
                      })
                    }
                  >
                    🗑️
                  </button>
                </div>
                <input
                  className="toolbar-input"
                  placeholder="Nom du point"
                  value={marker.label}
                  style={{ marginBottom: "3px", fontSize: "11px" }}
                  onChange={(e) => {
                    const newMarkers = [...(element.markers || [])];
                    newMarkers[i] = { ...marker, label: e.target.value };
                    updateElement(element.id, { markers: newMarkers });
                  }}
                />
                <div
                  style={{ display: "flex", gap: "3px", marginBottom: "3px" }}
                >
                  <input
                    type="number"
                    step="0.0001"
                    className="toolbar-input-small"
                    placeholder="Lat"
                    value={marker.lat}
                    style={{ fontSize: "10px" }}
                    onChange={(e) => {
                      const newMarkers = [...(element.markers || [])];
                      newMarkers[i] = {
                        ...marker,
                        lat: parseFloat(e.target.value) || 0,
                      };
                      updateElement(element.id, { markers: newMarkers });
                    }}
                  />
                  <input
                    type="number"
                    step="0.0001"
                    className="toolbar-input-small"
                    placeholder="Lng"
                    value={marker.lng}
                    style={{ fontSize: "10px" }}
                    onChange={(e) => {
                      const newMarkers = [...(element.markers || [])];
                      newMarkers[i] = {
                        ...marker,
                        lng: parseFloat(e.target.value) || 0,
                      };
                      updateElement(element.id, { markers: newMarkers });
                    }}
                  />
                </div>
                <div
                  style={{ display: "flex", gap: "3px", alignItems: "center" }}
                >
                  <label style={{ fontSize: "8px", color: "#666" }}>
                    Couleur:
                  </label>
                  <input
                    type="color"
                    value={marker.color || "#FF5252"}
                    style={{
                      width: "40px",
                      height: "25px",
                      border: "1px solid #ccc",
                      borderRadius: "3px",
                      cursor: "pointer",
                    }}
                    onChange={(e) => {
                      const newMarkers = [...(element.markers || [])];
                      newMarkers[i] = {
                        ...marker,
                        color: e.target.value,
                      };
                      updateElement(element.id, { markers: newMarkers });
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      fontSize: "9px",
                      color: "#999",
                      textAlign: "right",
                    }}
                  >
                    {marker.color || "#FF5252"}
                  </div>
                </div>
              </div>
            ))}
            <button
              className="btn-add-option"
              style={{ marginTop: "5px", width: "100%" }}
              onClick={() => {
                const colors = [
                  "#FF5252",
                  "#4CAF50",
                  "#2196F3",
                  "#FFC107",
                  "#9C27B0",
                  "#FF9800",
                ];
                const colorIndex =
                  (element.markers?.length || 0) % colors.length;

                const newMarker = {
                  id: `marker-${Date.now()}`,
                  lat: element.coordinates?.lat || 48.8566,
                  lng: element.coordinates?.lng || 2.3522,
                  label: `Point ${(element.markers?.length || 0) + 1}`,
                  color: colors[colorIndex],
                };
                updateElement(element.id, {
                  markers: [...(element.markers || []), newMarker],
                });
              }}
            >
              + Ajouter un point
            </button>
          </div>
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
          {/* Indicateur si un enfant est sélectionné */}
          {selectedChild && (
            <div
              style={{
                backgroundColor: "#2196F3",
                color: "white",
                padding: "8px 12px",
                borderRadius: "4px",
                marginBottom: "10px",
                fontSize: "11px",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              🎯 Élément sélectionné :{" "}
              {selectedChild.type === "input-text"
                ? "Texte"
                : selectedChild.type === "input-email"
                ? "Email"
                : selectedChild.type === "input-number"
                ? "Nombre"
                : selectedChild.type === "calendar"
                ? "Date"
                : "Champ"}
            </div>
          )}

          {/* Aide pour le formulaire */}
          {!selectedChild && element.type === "input-form" && (
            <div
              style={{
                backgroundColor: "#fff3cd",
                color: "#856404",
                padding: "8px 12px",
                borderRadius: "4px",
                marginBottom: "10px",
                fontSize: "10px",
                border: "1px solid #ffeeba",
              }}
            >
              💡 <strong>Astuce :</strong> Cliquez sur un champ du formulaire
              pour modifier son alignement individuellement
            </div>
          )}

          {/* Section Contenu */}
          {(currentConfig.showContent || currentConfig.customFields) && (
            <div className="toolbar-section">
              <label
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "#888",
                  marginBottom: "5px",
                  display: "block",
                }}
              >
                📝 CONTENU
              </label>

              {currentConfig.customFields ? (
                renderCustomFields()
              ) : (
                <input
                  className="toolbar-input"
                  placeholder="Contenu..."
                  value={currentElement.content}
                  onChange={(e) => {
                    if (selectedChild) {
                      updateFormChild(element.id, selectedChild.id, {
                        content: e.target.value,
                      });
                    } else {
                      updateElement(element.id, { content: e.target.value });
                    }
                  }}
                />
              )}
            </div>
          )}

          {/* Section Style */}
          {currentConfig.showStyle && (
            <div className="toolbar-section">
              <label
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "#888",
                  marginBottom: "5px",
                  display: "block",
                }}
              >
                🎨 STYLE
              </label>

              {currentConfig.showColors && (
                <div
                  style={{ display: "flex", gap: "10px", marginBottom: "8px" }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: "8px",
                        color: "#aaa",
                        display: "block",
                      }}
                    >
                      Fond
                    </label>
                    <input
                      type="color"
                      value={currentElement.style?.backgroundColor || "#ffffff"}
                      onChange={(e) =>
                        updateStyle("backgroundColor", e.target.value)
                      }
                      style={{
                        width: "30px",
                        height: "30px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: "8px",
                        color: "#aaa",
                        display: "block",
                      }}
                    >
                      Texte
                    </label>
                    <input
                      type="color"
                      value={currentElement.style?.color || "#000000"}
                      onChange={(e) => updateStyle("color", e.target.value)}
                      style={{
                        width: "30px",
                        height: "30px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                </div>
              )}

              {currentConfig.showFont && (
                <>
                  <label
                    style={{
                      fontSize: "9px",
                      color: "#aaa",
                      display: "block",
                      marginBottom: "2px",
                    }}
                  >
                    Police
                  </label>
                  <select
                    className="toolbar-input"
                    value={currentElement.style?.fontFamily || "Arial"}
                    onChange={(e) => updateStyle("fontFamily", e.target.value)}
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

          {(config.showRadius || config.showShadow) && (
            <div className="toolbar-section">
              <label
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "#888",
                  marginBottom: "5px",
                  display: "block",
                }}
              >
                ✨ APPARENCE
              </label>

              {config.showRadius && (
                <div style={{ marginBottom: "10px" }}>
                  <label
                    style={{
                      fontSize: "9px",
                      color: "#aaa",
                      display: "block",
                      marginBottom: "3px",
                    }}
                  >
                    Arrondi
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={parseInt(element.style?.borderRadius || "0")}
                      onChange={(e) =>
                        updateStyle("borderRadius", `${e.target.value}px`)
                      }
                      style={{ flex: 1 }}
                    />
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#666",
                        minWidth: "35px",
                      }}
                    >
                      {element.style?.borderRadius || "0px"}
                    </span>
                  </div>
                </div>
              )}

              {config.showShadow && (
                <div style={{ marginBottom: "5px" }}>
                  <label
                    style={{
                      fontSize: "9px",
                      color: "#aaa",
                      display: "block",
                      marginBottom: "3px",
                    }}
                  >
                    Ombre
                  </label>
                  <select
                    className="toolbar-input"
                    value={element.style?.boxShadow || "none"}
                    onChange={(e) => updateStyle("boxShadow", e.target.value)}
                  >
                    <option value="none">Aucune</option>
                    <option value="0 2px 4px rgba(0,0,0,0.1)">Légère</option>
                    <option value="0 4px 8px rgba(0,0,0,0.2)">Moyenne</option>
                    <option value="0 8px 16px rgba(0,0,0,0.3)">Forte</option>
                    <option value="0 12px 24px rgba(0,0,0,0.4)">
                      Très forte
                    </option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Section Alignement */}
          {currentConfig.showAlignment && (
            <div className="toolbar-section">
              <label
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "#888",
                  marginBottom: "5px",
                  display: "block",
                }}
              >
                📐 ALIGNEMENT
              </label>

              <button
                onClick={() => {
                  const isCentered =
                    currentElement.style?.textAlign === "center";
                  updateStyle("textAlign", isCentered ? "left" : "center");
                }}
                style={{
                  width: "100%",
                  padding: "8px",
                  fontSize: "12px",
                  backgroundColor:
                    currentElement.style?.textAlign === "center"
                      ? "#27ae60"
                      : "#e0e0e0",
                  color:
                    currentElement.style?.textAlign === "center"
                      ? "white"
                      : "#333",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight:
                    currentElement.style?.textAlign === "center"
                      ? "bold"
                      : "normal",
                }}
              >
                {currentElement.style?.textAlign === "center"
                  ? "✓ Texte centré"
                  : "Centrer le texte"}
              </button>
            </div>
          )}

          {/* Section Config Technique */}
          {currentConfig.showTechConfig && !selectedChild && (
            <div className="toolbar-section">
              <label
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "#888",
                  marginBottom: "5px",
                  display: "block",
                }}
              >
                ⚙️ CONFIG TECH
              </label>

              <div style={{ marginBottom: "5px" }}>
                <label
                  style={{
                    fontSize: "9px",
                    color: "#aaa",
                    display: "block",
                    marginBottom: "2px",
                  }}
                >
                  ID Unique (JS)
                </label>
                <input
                  type="text"
                  className="toolbar-input"
                  placeholder="ex: mon-bouton-1"
                  value={element.attributes?.htmlId || ""}
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
                    fontSize: "9px",
                    color: "#aaa",
                    display: "block",
                    marginBottom: "2px",
                  }}
                >
                  Classes CSS
                </label>
                <input
                  type="text"
                  className="toolbar-input"
                  placeholder="ex: btn-lg shadow-md"
                  value={element.attributes?.className || ""}
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

          <div className="toolbar-actions">
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
      {isSelected && !isDragging && renderToolbar()}
      <RenderNode element={element} />
    </div>
  );
};
