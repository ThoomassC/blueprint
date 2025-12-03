import type { EditorElement } from "../../types/editor";
import { useEditorStore } from "../../store/useEditorStore";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import React from "react";

const getEmbedUrl = (url: string) => {
  if (url.includes("youtube.com/watch?v=")) {
    return url.replace("watch?v=", "embed/");
  }
  if (url.includes("youtu.be/")) {
    return url.replace("youtu.be/", "www.youtube.com/embed/");
  }
  return url;
};

export const RenderNode = ({ element }: { element: EditorElement }) => {
  const isPreviewMode = useEditorStore((state) => state.isPreviewMode);
  const updateElement = useEditorStore((state) => state.updateElement);
  const addChildToForm = useEditorStore((state) => state.addChildToForm);
  const removeChildFromForm = useEditorStore(
    (state) => state.removeChildFromForm
  );
  const updateFormChild = useEditorStore((state) => state.updateFormChild);
  const selectFormChild = useEditorStore((state) => state.selectFormChild);
  const selectedChildId = useEditorStore((state) => state.selectedChildId);
  const [emailError, setEmailError] = useState<string>("");

  const styles: React.CSSProperties = {
    ...element.style,
    width: element.style?.width || "100%",
    height: element.style?.height || "auto",
    fontFamily: element.style?.fontFamily || "Arial",
    color: element.style?.color || undefined,
    backgroundColor: element.style?.backgroundColor || undefined,
    position: element.style?.position as React.CSSProperties["position"],
    display:
      (element.style?.display as React.CSSProperties["display"]) ||
      (element.style?.justifyContent ? "flex" : undefined),
    flexDirection: element.style
      ?.flexDirection as React.CSSProperties["flexDirection"],
    alignItems:
      element.style?.verticalAlign === "top"
        ? "flex-start"
        : element.style?.verticalAlign === "middle"
        ? "center"
        : element.style?.verticalAlign === "bottom"
        ? "flex-end"
        : (element.style?.alignItems as React.CSSProperties["alignItems"]),
    justifyContent: element.style
      ?.justifyContent as React.CSSProperties["justifyContent"],
    textAlign: element.style?.textAlign as React.CSSProperties["textAlign"],
    borderRadius: element.style
      ?.borderRadius as React.CSSProperties["borderRadius"],
    boxShadow: element.style?.boxShadow as React.CSSProperties["boxShadow"],
  };

  const interactionStyle = {
    pointerEvents: isPreviewMode ? "auto" : "none",
  } as const;

  switch (element.type) {
    case "video": {
      const isYoutube =
        element.content.includes("youtube") ||
        element.content.includes("youtu.be");

      if (isYoutube) {
        return (
          <iframe
            src={getEmbedUrl(element.content)}
            style={{ ...styles, ...interactionStyle, border: "none" }}
            title="Video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      } else {
        return (
          <video
            src={element.content}
            style={{
              ...styles,
              ...interactionStyle,
              backgroundColor: element.style?.backgroundColor || "#000",
            }}
            controls
          >
            Votre navigateur ne supporte pas la balise vidéo.
          </video>
        );
      }
    }

    case "image":
      return (
        <img
          src={element.content}
          alt="Contenu"
          style={{ ...styles, objectFit: "cover", display: "block" }}
          draggable={false}
        />
      );

    case "logo":
      return (
        <img
          src={element.content}
          alt="Logo du site"
          style={{
            ...styles,
            objectFit: "contain",
            display: "block",
            cursor: "pointer",
          }}
          draggable={false}
        />
      );

    case "select":
      return (
        <div style={{ minWidth: "150px" }}>
          <select
            style={{
              ...styles,
              ...interactionStyle,
              width: "100%",
              padding: "5px",
            }}
            value={element.content}
            onChange={(e) =>
              updateElement(element.id, { content: e.target.value })
            }
          >
            {element.options?.map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );

    case "card":
      return (
        <div
          style={{
            ...styles,
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "15px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "10px",
              color: element.style?.color || "#000",
              fontFamily: element.style?.fontFamily || "Arial",
            }}
          >
            {element.content}
          </h3>
          <p
            style={{
              color: element.style?.color || "#666",
              fontSize: "14px",
              margin: 0,
              fontFamily: element.style?.fontFamily || "Arial",
            }}
          >
            {element.description}
          </p>
        </div>
      );

    case "header":
      return (
        <header
          style={{
            ...styles,
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
          }}
        >
          <h2
            style={{
              color: element.style?.color || "#000",
              fontFamily: element.style?.fontFamily || "Arial",
            }}
          >
            {element.content}
          </h2>
        </header>
      );

    case "footer":
      return (
        <footer
          style={{
            ...styles,
            display: "flex",
            justifyContent: "center",
            padding: "10px",
            alignItems: "center",
          }}
        >
          <small
            style={{
              color: element.style?.color || "#000",
              fontFamily: element.style?.fontFamily || "Arial",
            }}
          >
            {element.content}
          </small>
        </footer>
      );

    case "title":
      return <h1 style={{ margin: 0, ...styles }}>{element.content}</h1>;

    case "button":
      return (
        <button
          className="preview-btn"
          style={{
            ...styles,
            backgroundColor: element.style?.backgroundColor || "#3498db",
            color: element.style?.color || "#ffffff",
            fontFamily: element.style?.fontFamily || "Arial",
          }}
        >
          {element.content}
        </button>
      );

    case "input-number":
      return (
        <input
          type="number"
          value={element.content}
          style={{
            ...styles,
            ...interactionStyle,
            padding: "5px",
            textAlign: element.style?.textAlign || "left",
          }}
          onChange={(e) =>
            updateElement(element.id, { content: e.target.value })
          }
        />
      );

    case "input-text":
      return (
        <input
          type="text"
          value={element.content}
          placeholder={element.description || "Entrez du texte..."}
          style={{
            ...interactionStyle,
            padding: "10px 12px",
            width: "100%",
            border: "2px solid #e0e0e0",
            borderRadius: "8px",
            fontSize: "14px",
            fontFamily: element.style?.fontFamily || "Arial",
            color: element.style?.color || "#000",
            backgroundColor: element.style?.backgroundColor || "#ffffff",
            outline: "none",
            boxSizing: "border-box",
            textAlign: element.style?.textAlign || "left",
          }}
          onChange={(e) =>
            updateElement(element.id, { content: e.target.value })
          }
        />
      );

    case "input-email": {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValidEmail = emailRegex.test(element.content);
      const hasError = element.content && !isValidEmail;

      return (
        <div
          style={{
            position: "relative",
            display: "inline-block",
            minWidth: "250px",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "16px",
              color: element.style?.color || "#666",
              pointerEvents: "none",
            }}
          >
            📧
          </span>
          <input
            type="email"
            value={element.content}
            placeholder="exemple@email.com"
            required
            style={{
              ...interactionStyle,
              padding: "10px 12px 10px 40px",
              width: "100%",
              border: `2px solid ${hasError ? "#f44336" : "#e0e0e0"}`,
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: styles.fontFamily,
              backgroundColor: "#ffffff",
              color: element.style?.color || "#000000",
              transition: "border-color 0.2s",
              outline: "none",
              boxSizing: "border-box",
              textAlign: element.style?.textAlign || "left",
            }}
            onFocus={(e) => {
              if (!hasError) {
                e.target.style.borderColor = "#4CAF50";
              }
            }}
            onBlur={(e) => {
              const value = e.target.value;
              if (value && !emailRegex.test(value)) {
                setEmailError(
                  "Veuillez entrer une adresse email valide avec @"
                );
                e.target.style.borderColor = "#f44336";
              } else {
                setEmailError("");
                e.target.style.borderColor = "#e0e0e0";
              }
            }}
            onChange={(e) => {
              const value = e.target.value;
              updateElement(element.id, { content: value });
              if (value && !emailRegex.test(value)) {
                setEmailError(
                  "Veuillez entrer une adresse email valide avec @"
                );
              } else {
                setEmailError("");
              }
            }}
          />
          {hasError && (
            <div
              style={{
                color: "#f44336",
                fontSize: "12px",
                marginTop: "4px",
                paddingLeft: "4px",
              }}
            >
              {emailError || "Veuillez entrer une adresse email valide avec @"}
            </div>
          )}
        </div>
      );
    }

    case "calendar":
      return (
        <input
          type="date"
          value={element.content}
          style={{ ...interactionStyle, padding: "5px" }}
          onChange={(e) =>
            updateElement(element.id, { content: e.target.value })
          }
        />
      );

    case "input-form":
      return (
        <form
          style={{
            ...styles,
            // 👇 ICI : On force l'étirement, même si le texte est centré
            alignItems: "stretch",
            border: "2px solid #3498db",
            borderRadius: "12px",
            padding: "20px",
            minWidth: "300px",
            maxWidth: "500px",
          }}
          onSubmit={(e) => {
            e.preventDefault();
            if (isPreviewMode) {
              alert("Formulaire soumis !");
            }
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "15px",
              color: element.style?.color || "#2c3e50",
              fontFamily: styles.fontFamily,
              // Le titre obéit bien à l'alignement (Gauche/Centre/Droite)
              textAlign: element.style
                ?.textAlign as React.CSSProperties["textAlign"],
            }}
          >
            {element.content}
          </h3>

          {element.children && element.children.length > 0 ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {element.children.map((child) => (
                // 👇 ICI : On ajoute width: '100%' pour que le champ prenne toute la place
                <div
                  key={child.id}
                  style={{
                    position: "relative",
                    width: "100%",
                    padding:
                      selectedChildId === child.id && !isPreviewMode
                        ? "8px"
                        : "0",
                    backgroundColor:
                      selectedChildId === child.id && !isPreviewMode
                        ? "#e3f2fd"
                        : "transparent",
                    borderRadius: "4px",
                    border:
                      selectedChildId === child.id && !isPreviewMode
                        ? "2px solid #2196F3"
                        : "none",
                    transition: "all 0.2s",
                  }}
                  onClick={(e) => {
                    if (!isPreviewMode) {
                      e.stopPropagation();
                      selectFormChild(element.id, child.id);
                    }
                  }}
                >
                  {!isPreviewMode && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "4px",
                      }}
                    >
                      <input
                        type="text"
                        value={child.description || ""}
                        placeholder="Label du champ..."
                        style={{
                          flex: 1,
                          padding: "4px 8px",
                          fontSize: "12px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                        }}
                        onChange={(e) =>
                          updateFormChild(element.id, child.id, {
                            description: e.target.value,
                          })
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        type="button"
                        style={{
                          padding: "4px 8px",
                          fontSize: "18px",
                          border: "none",
                          background: "#f44336",
                          color: "white",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeChildFromForm(element.id, child.id);
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                  {child.description && isPreviewMode && (
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: "bold",
                        marginBottom: "4px",
                        color: "#555",
                        textAlign: "left",
                      }}
                    >
                      {child.description}
                    </label>
                  )}
                  <div>
                    {child.type === "input-text" && (
                      <input
                        type="text"
                        value={child.content}
                        placeholder={child.description || "Entrez du texte..."}
                        style={{
                          ...interactionStyle,
                          padding: "10px 12px",
                          width: "100%",
                          border: "2px solid #e0e0e0",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontFamily: element.style?.fontFamily || "Arial",
                          outline: "none",
                          boxSizing: "border-box",
                          textAlign: (child.style?.textAlign ||
                            "left") as React.CSSProperties["textAlign"],
                        }}
                        onChange={(e) =>
                          updateFormChild(element.id, child.id, {
                            content: e.target.value,
                          })
                        }
                        onClick={(e) => {
                          if (!isPreviewMode) {
                            e.stopPropagation();
                            selectFormChild(element.id, child.id);
                          }
                        }}
                      />
                    )}
                    {child.type === "input-email" && (
                      <input
                        type="email"
                        value={child.content}
                        placeholder={child.description || "exemple@email.com"}
                        style={{
                          ...interactionStyle,
                          padding: "10px 12px",
                          width: "100%",
                          border: "2px solid #e0e0e0",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontFamily: element.style?.fontFamily || "Arial",
                          outline: "none",
                          boxSizing: "border-box",
                          textAlign: (child.style?.textAlign ||
                            "left") as React.CSSProperties["textAlign"],
                        }}
                        onChange={(e) =>
                          updateFormChild(element.id, child.id, {
                            content: e.target.value,
                          })
                        }
                        onClick={(e) => {
                          if (!isPreviewMode) {
                            e.stopPropagation();
                            selectFormChild(element.id, child.id);
                          }
                        }}
                      />
                    )}
                    {child.type === "input-number" && (
                      <input
                        type="number"
                        value={child.content}
                        placeholder={child.description || "0"}
                        style={{
                          ...interactionStyle,
                          padding: "10px 12px",
                          width: "100%",
                          border: "2px solid #e0e0e0",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontFamily: element.style?.fontFamily || "Arial",
                          outline: "none",
                          boxSizing: "border-box",
                          textAlign: (child.style?.textAlign ||
                            "left") as React.CSSProperties["textAlign"],
                        }}
                        onChange={(e) =>
                          updateFormChild(element.id, child.id, {
                            content: e.target.value,
                          })
                        }
                        onClick={(e) => {
                          if (!isPreviewMode) {
                            e.stopPropagation();
                            selectFormChild(element.id, child.id);
                          }
                        }}
                      />
                    )}
                    {child.type === "calendar" && (
                      <input
                        type="date"
                        value={child.content}
                        style={{
                          ...interactionStyle,
                          padding: "10px 12px",
                          width: "100%",
                          border: "2px solid #e0e0e0",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontFamily: element.style?.fontFamily || "Arial",
                          outline: "none",
                          boxSizing: "border-box",
                          textAlign: (child.style?.textAlign ||
                            "left") as React.CSSProperties["textAlign"],
                        }}
                        onChange={(e) =>
                          updateFormChild(element.id, child.id, {
                            content: e.target.value,
                          })
                        }
                        onClick={(e) => {
                          if (!isPreviewMode) {
                            e.stopPropagation();
                            selectFormChild(element.id, child.id);
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#666", fontSize: "14px", fontStyle: "italic" }}>
              Ajoutez des champs ci-dessous
            </p>
          )}

          {!isPreviewMode && (
            <div
              style={{
                marginTop: "15px",
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  border: "1px solid #3498db",
                  backgroundColor: "white",
                  color: "#3498db",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  addChildToForm(element.id, {
                    id: uuidv4(),
                    type: "input-text",
                    content: "",
                    description: "Texte",
                    x: 0,
                    y: 0,
                    style: { fontFamily: "Arial", textAlign: "left" },
                    attributes: { htmlId: "", className: "" },
                  });
                }}
              >
                + Texte
              </button>
              <button
                type="button"
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  border: "1px solid #3498db",
                  backgroundColor: "white",
                  color: "#3498db",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  addChildToForm(element.id, {
                    id: uuidv4(),
                    type: "input-email",
                    content: "",
                    description: "Email",
                    x: 0,
                    y: 0,
                    style: { fontFamily: "Arial", textAlign: "left" },
                    attributes: { htmlId: "", className: "" },
                  });
                }}
              >
                + Email
              </button>
              <button
                type="button"
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  border: "1px solid #3498db",
                  backgroundColor: "white",
                  color: "#3498db",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  addChildToForm(element.id, {
                    id: uuidv4(),
                    type: "input-number",
                    content: "0",
                    description: "Nombre",
                    x: 0,
                    y: 0,
                    style: { fontFamily: "Arial", textAlign: "left" },
                    attributes: { htmlId: "", className: "" },
                  });
                }}
              >
                + Nombre
              </button>
              <button
                type="button"
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  border: "1px solid #3498db",
                  backgroundColor: "white",
                  color: "#3498db",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  addChildToForm(element.id, {
                    id: uuidv4(),
                    type: "calendar",
                    content: new Date().toISOString().split("T")[0],
                    description: "Date",
                    x: 0,
                    y: 0,
                    style: { fontFamily: "Arial", textAlign: "left" },
                    attributes: { htmlId: "", className: "" },
                  });
                }}
              >
                + Date
              </button>
            </div>
          )}

          <button
            type="submit"
            style={{
              marginTop: "20px",
              width: "100%",
              padding: "12px 20px",
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: isPreviewMode ? "pointer" : "default",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              if (isPreviewMode) {
                e.currentTarget.style.backgroundColor = "#2980b9";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#3498db";
            }}
          >
            Envoyer
          </button>
        </form>
      );

    case "map": {
      const markers = element.markers || [];
      const centerLat = element.coordinates?.lat || 48.8566;
      const centerLng = element.coordinates?.lng || 2.3522;

      // Calculer le centre et le zoom automatique
      let mapCenter = { lat: centerLat, lng: centerLng };
      let zoom = 13;

      if (markers.length > 0) {
        // Calculer le centre moyen
        const avgLat =
          markers.reduce((sum, m) => sum + m.lat, 0) / markers.length;
        const avgLng =
          markers.reduce((sum, m) => sum + m.lng, 0) / markers.length;
        mapCenter = { lat: avgLat, lng: avgLng };

        // Calculer le zoom basé sur la dispersion des marqueurs
        const lats = markers.map((m) => m.lat);
        const lngs = markers.map((m) => m.lng);
        const latDiff = Math.max(...lats) - Math.min(...lats);
        const lngDiff = Math.max(...lngs) - Math.min(...lngs);
        const maxDiff = Math.max(latDiff, lngDiff);

        if (maxDiff > 0.5) zoom = 10;
        else if (maxDiff > 0.1) zoom = 12;
        else if (maxDiff > 0.05) zoom = 13;
        else if (maxDiff > 0.01) zoom = 14;
        else zoom = 15;
      }

      // Créer le HTML pour la carte avec Leaflet
      const mapHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            body { margin: 0; padding: 0; }
            #map { width: 100vw; height: 100vh; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            const map = L.map('map').setView([${mapCenter.lat}, ${
        mapCenter.lng
      }], ${zoom});
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19
            }).addTo(map);

            // Créer une icône personnalisée pour chaque marqueur
            ${markers
              .map(
                (marker) => `
              const icon_${marker.id.replace(
                /[^a-zA-Z0-9]/g,
                "_"
              )} = L.divIcon({
                className: 'custom-marker',
                html: \`
                  <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
                    <svg width="30" height="40" viewBox="0 0 30 40" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                      <path d="M15 0C8.373 0 3 5.373 3 12c0 9 12 28 12 28s12-19 12-28c0-6.627-5.373-12-12-12z" fill="${
                        marker.color || "#FF5252"
                      }" />
                      <circle cx="15" cy="12" r="5" fill="white" />
                    </svg>
                    <div style="
                      background-color: ${marker.color || "#FF5252"};
                      color: white;
                      padding: 2px 8px;
                      border-radius: 4px;
                      font-size: 11px;
                      font-weight: bold;
                      white-space: nowrap;
                      margin-top: -5px;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    ">${marker.label}</div>
                  </div>
                \`,
                iconSize: [30, 50],
                iconAnchor: [15, 50],
                popupAnchor: [0, -50]
              });

              L.marker([${marker.lat}, ${
                  marker.lng
                }], { icon: icon_${marker.id.replace(/[^a-zA-Z0-9]/g, "_")} })
                .addTo(map)
                .bindPopup('<b>${marker.label}</b><br>Lat: ${
                  marker.lat
                }<br>Lng: ${marker.lng}');
            `
              )
              .join("\n")}

            // Ajuster la vue pour inclure tous les marqueurs
            ${
              markers.length > 1
                ? `
              const bounds = L.latLngBounds([
                ${markers
                  .map((m) => `[${m.lat}, ${m.lng}]`)
                  .join(",\n                ")}
              ]);
              map.fitBounds(bounds, { padding: [50, 50] });
            `
                : ""
            }
          </script>
        </body>
        </html>
      `;

      return (
        <div
          style={{
            ...styles,
            border: "2px solid #4CAF50",
            borderRadius: "8px",
            overflow: "hidden",
            minWidth: "300px",
            minHeight: "200px",
            position: "relative",
            backgroundColor: "#f0f0f0",
          }}
        >
          <iframe
            srcDoc={mapHTML}
            style={{
              ...interactionStyle,
              width: "100%",
              height: "100%",
              minHeight: "200px",
              border: "none",
            }}
            title="Carte interactive"
          />

          {!isPreviewMode && (
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                left: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                padding: "5px 10px",
                borderRadius: "4px",
                fontSize: "12px",
                color: "#333",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                zIndex: 1000,
              }}
            >
              📍 {element.content || "Ma carte"}
              {markers.length > 0 && (
                <span
                  style={{
                    marginLeft: "5px",
                    color: "#4CAF50",
                    fontWeight: "bold",
                  }}
                >
                  ({markers.length} point{markers.length > 1 ? "s" : ""})
                </span>
              )}
            </div>
          )}
        </div>
      );
    }

    default:
      return (
        <p className="preview-text" style={styles}>
          {element.content}
        </p>
      );
  }
};
