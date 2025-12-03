import { useState, useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useEditorStore } from "../../store/useEditorStore";
import { DraggableCanvasElement } from "./DraggableCanvasElement";

export const Canvas = () => {
  const elements = useEditorStore((state) => state.elements);
  const selectElement = useEditorStore((state) => state.selectElement);
  const selectedId = useEditorStore((state) => state.selectedId);
  const backgroundColor = useEditorStore(
    (state) => state.canvasBackgroundColor
  );
  const setBackgroundColor = useEditorStore(
    (state) => state.setCanvasBackgroundColor
  );

  const [showPalette, setShowPalette] = useState(false);
  // Position par défaut ajustée pour être visible sur les petits écrans
  const [palettePosition, setPalettePosition] = useState({ x: 50, y: 50 });
  const [isDraggingPalette, setIsDraggingPalette] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-drop-zone",
  });

  const handleBackgroundClick = () => {
    selectElement(null);
    setShowPalette(true);
  };

  const handleMouseDownPalette = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingPalette(true);
    // Calcul de l'offset basé sur la position viewport
    dragOffset.current = {
      x: e.clientX - palettePosition.x,
      y: e.clientY - palettePosition.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingPalette) return;
      setPalettePosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };
    const handleMouseUp = () => {
      setIsDraggingPalette(false);
    };

    if (isDraggingPalette) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingPalette]);

  const canvasWidth = 800;
  const canvasHeight = 1000;

  return (
    <div
      className="canvas-container"
      onClick={() => selectElement(null)}
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        // --- CHANGEMENTS MAJEURS ICI ---
        overflow: "auto", // 1. Active les barres de défilement
        display: "flex", // 2. Utilise Flexbox pour centrer
        justifyContent: "center", // 2. Centre horizontalement
        backgroundColor: "#e5e5e5", // 3. Ajout d'un gris de fond pour distinguer la feuille
        padding: "40px 0", // 4. Ajoute de l'espace en haut et en bas
      }}
    >
      <div
        ref={setNodeRef}
        className={`page-sheet ${isOver ? "highlight" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          handleBackgroundClick();
        }}
        style={{
          // Suppression de 'position: absolute' s'il y était, relative est mieux ici
          position: "relative",
          backgroundColor: backgroundColor,
          width: canvasWidth,
          height: canvasHeight,
          // Empêche la feuille de rétrécir
          flexShrink: 0,
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          // Pas de margin nécessaire grâce au padding du parent
        }}
      >
        {/* Logo fixe en haut à gauche - non modifiable */}
        <div
          style={{
            position: "absolute",
            top: "2px",
            left: "20px",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <img
            src="/src/assets/logo.png"
            alt="Logo du site"
            style={{
              width: "80px",
              height: "auto",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>

        {elements.length === 0 && (
          <div
            className="empty-state"
            style={{ padding: 20, textAlign: "center", color: "#aaa" }}
          >
            Glissez un élément n'importe où ici
          </div>
        )}

        {elements.map((el) => (
          <DraggableCanvasElement key={el.id} element={el} />
        ))}
      </div>

      {showPalette && !selectedId && (
        <div
          onMouseDown={handleMouseDownPalette}
          onClick={(e) => e.stopPropagation()}
          style={{
            // --- CHANGEMENT POUR LA PALETTE ---
            position: "fixed", // 5. 'fixed' au lieu de 'absolute'
            left: palettePosition.x,
            top: palettePosition.y,
            width: "220px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            zIndex: 100,
            overflow: "hidden",
            border: "1px solid #e0e0e0",
          }}
        >
          {/* ... (Le reste du contenu de la palette reste identique) ... */}
          <div
            style={{
              padding: "8px 12px",
              background: "#f1f3f5",
              borderBottom: "1px solid #ddd",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: isDraggingPalette ? "grabbing" : "grab",
              userSelect: "none",
            }}
          >
            <span
              style={{ fontSize: "13px", fontWeight: "600", color: "#444" }}
            >
              Arrière-plan
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPalette(false);
              }}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "16px",
                cursor: "pointer",
                color: "#666",
                padding: "0 4px",
                lineHeight: 1,
              }}
            >
              &times;
            </button>
          </div>

          <div style={{ padding: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "12px",
                color: "#666",
              }}
            >
              Couleur de remplissage
            </label>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  position: "relative",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "1px solid #ccc",
                }}
              >
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  style={{
                    position: "absolute",
                    top: "-50%",
                    left: "-50%",
                    width: "200%",
                    height: "200%",
                    border: "none",
                    cursor: "pointer",
                    margin: 0,
                    padding: 0,
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: "14px",
                    fontFamily: "monospace",
                    color: "#333",
                  }}
                >
                  {backgroundColor.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
