import { useState, useEffect } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Sidebar } from "./components/Editor/Sidebar";
import { Canvas } from "./components/Editor/Canvas";
import { useEditorStore } from "./store/useEditorStore";
import { audioDescription } from "./services/audioDescription";
import type { ElementType } from "./types/editor";
import "./App.css";

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
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    audioDescription.setEnabled(isAudioEnabled);
  }, [isAudioEnabled]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const exportContainer = target.closest("[data-export-container]");

      if (showExportMenu && !exportContainer) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showExportMenu]);

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (!isAudioEnabled) {
      audioDescription.announceSuccess("Audio description activée");
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
        activeElement === "INPUT" || activeElement === "TEXTAREA";

      if (isTyping) return;

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        removeElement(currentSelectedId);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [removeElement]);

  const handleDragStart = (event: DragStartEvent) => {
    const type = event.active.data.current?.type as ElementType;
    if (type) setActiveDragType(type);
  };

  // Zone protégée autour du logo (haut gauche)
  const LOGO_PROTECTED_ZONE = {
    x: 0,
    y: 0,
    width: 120, // Logo 80px + marge droite
    height: 100, // Hauteur du logo + marges
  };

  // Récupérer le header pour définir sa zone protégée
  const getHeaderElement = () => {
    return useEditorStore
      .getState()
      .elements.find((el) => el.type === "header");
  };

  const isInProtectedZone = (
    x: number,
    y: number,
    elementWidth = 100,
    elementHeight = 100
  ) => {
    const elementRight = x + elementWidth;
    const elementBottom = y + elementHeight;

    // Vérifier collision avec le logo
    const logoZoneRight = LOGO_PROTECTED_ZONE.x + LOGO_PROTECTED_ZONE.width;
    const logoZoneBottom = LOGO_PROTECTED_ZONE.y + LOGO_PROTECTED_ZONE.height;

    const collidesWithLogo =
      x < logoZoneRight &&
      elementRight > LOGO_PROTECTED_ZONE.x &&
      y < logoZoneBottom &&
      elementBottom > LOGO_PROTECTED_ZONE.y;

    // Vérifier collision avec le header
    const headerElement = getHeaderElement();
    let collidesWithHeader = false;

    if (headerElement) {
      const headerWidth = parseFloat(headerElement.style?.width || "800");
      const headerHeight = parseFloat(headerElement.style?.height || "80");
      const headerRight = headerElement.x + headerWidth;
      const headerBottom = headerElement.y + headerHeight;

      collidesWithHeader =
        x < headerRight &&
        elementRight > headerElement.x &&
        y < headerBottom &&
        elementBottom > headerElement.y;
    }

    return collidesWithLogo || collidesWithHeader;
  };

  const adjustPositionIfInProtectedZone = (
    x: number,
    y: number,
    elementWidth = 100,
    elementHeight = 100
  ) => {
    if (!isInProtectedZone(x, y, elementWidth, elementHeight)) {
      return { x, y };
    }

    // Toujours placer en dessous du header (qui contient aussi le logo)
    const headerElement = getHeaderElement();
    if (headerElement) {
      const headerHeight = parseFloat(headerElement.style?.height || "80");
      const belowHeader = headerElement.y + headerHeight + 10;
      return { x, y: belowHeader };
    }

    // Fallback si pas de header : placer en dessous de la zone logo
    const belowLogo = LOGO_PROTECTED_ZONE.y + LOGO_PROTECTED_ZONE.height + 10;
    return { x, y: belowLogo };
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    setActiveDragType(null);

    if (!over || over.id !== "canvas-drop-zone") return;

    const type = active.data.current?.type as ElementType;
    const isCanvasElement = active.data.current?.isCanvasElement;
    const elementId = active.id as string;

    if (isCanvasElement) {
      const currentElement = useEditorStore
        .getState()
        .elements.find((e) => e.id === elementId);
      if (currentElement) {
        let newX = currentElement.x + delta.x;
        let newY = currentElement.y + delta.y;

        // Récupérer les dimensions de l'élément
        const elementWidth = parseFloat(currentElement.style?.width || "100");
        const elementHeight = parseFloat(currentElement.style?.height || "100");

        // Ajuster la position si elle entre en collision avec la zone du logo
        const adjustedPosition = adjustPositionIfInProtectedZone(
          newX,
          newY,
          elementWidth,
          elementHeight
        );
        newX = adjustedPosition.x;
        newY = adjustedPosition.y;

        updatePosition(elementId, newX, newY);
      }
    } else {
      const canvasRect = document
        .querySelector(".page-sheet")
        ?.getBoundingClientRect();
      let dropX = active.rect.current?.translated
        ? active.rect.current.translated.left - (canvasRect?.left ?? 0)
        : 0;
      let dropY = active.rect.current?.translated
        ? active.rect.current.translated.top - (canvasRect?.top ?? 0)
        : 0;

      // Ajuster la position si elle entre en collision avec la zone du logo
      const adjustedPosition = adjustPositionIfInProtectedZone(dropX, dropY);
      dropX = adjustedPosition.x;
      dropY = adjustedPosition.y;

      addElement(type, dropX, dropY);
    }
  };

  const handleExport = () => {
    const fileNameInput = window.prompt(
      "Entrez le nom de votre fichier (ex: ma-page) :",
      `blueprint-${new Date().toISOString().slice(0, 10)}`
    );

    if (fileNameInput === null) return;

    let fileName = fileNameInput.trim();
    if (!fileName) fileName = "export-sans-nom";
    if (!fileName.endsWith(".json")) fileName += ".json";

    const jsonData = JSON.parse(getJSON());
    // Ajouter le logo aux données exportées
    jsonData.logo = {
      src: "/src/assets/logo.png",
      alt: "Logo du site",
      position: { top: 2, left: 20 },
      width: "80px",
      zIndex: 9999,
    };
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleScreenshotExport = async (format: "png" | "jpg" | "pdf") => {
    setShowExportMenu(false);

    // Demander le nom du fichier avant de basculer en mode aperçu
    const fileNameInput = window.prompt(
      `Entrez le nom du fichier ${format.toUpperCase()} :`,
      `blueprint-${new Date().toISOString().slice(0, 10)}`
    );

    if (fileNameInput === null) return;

    let fileName = fileNameInput.trim();
    if (!fileName) fileName = "export-sans-nom";

    // Sauvegarder l'état actuel du mode
    const wasInPreviewMode = isPreviewMode;

    // Basculer en mode aperçu si nécessaire
    if (!wasInPreviewMode) {
      togglePreviewMode();
      // Attendre que le DOM se mette à jour
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    const canvasElement = document.querySelector(".page-sheet") as HTMLElement;
    if (!canvasElement) {
      alert("Impossible de trouver la maquette à exporter");
      console.error("Élément .page-sheet non trouvé");
      // Revenir au mode précédent
      if (!wasInPreviewMode) {
        togglePreviewMode();
      }
      return;
    }

    try {
      console.log("Début de la capture d'écran...");

      const screenshot = await html2canvas(canvasElement, {
        backgroundColor: useEditorStore.getState().canvasBackgroundColor,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true,
        width: canvasElement.offsetWidth,
        height: canvasElement.offsetHeight,
      });

      console.log("Capture réussie:", screenshot.width, "x", screenshot.height);

      if (format === "pdf") {
        const imgData = screenshot.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation:
            screenshot.width > screenshot.height ? "landscape" : "portrait",
          unit: "px",
          format: [screenshot.width, screenshot.height],
        });

        pdf.addImage(imgData, "PNG", 0, 0, screenshot.width, screenshot.height);
        pdf.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
        console.log("PDF exporté avec succès");
      } else {
        const mimeType = format === "png" ? "image/png" : "image/jpeg";
        const extension = format;
        const quality = format === "jpg" ? 0.95 : undefined;

        screenshot.toBlob(
          (blob) => {
            if (!blob) {
              console.error("Échec de la création du blob");
              alert("Erreur lors de la création de l'image");
              return;
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName.endsWith(`.${extension}`)
              ? fileName
              : `${fileName}.${extension}`;

            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            console.log(`Image ${format.toUpperCase()} exportée avec succès`);
          },
          mimeType,
          quality
        );
      }

      // Revenir au mode précédent après un court délai
      if (!wasInPreviewMode) {
        setTimeout(() => {
          togglePreviewMode();
        }, 500);
      }
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      alert(
        `Une erreur est survenue lors de l'export: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`
      );

      // Revenir au mode précédent en cas d'erreur
      if (!wasInPreviewMode) {
        togglePreviewMode();
      }
    }
  };

  const getOverlayLabel = (type: ElementType) => {
    switch (type) {
      case "header":
        return "En-tête";
      case "footer":
        return "Pied de page";
      case "button":
        return "Bouton";
      case "text":
        return "Texte";
      case "card":
        return "Carte";
      default:
        return "Elément";
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
                className={`toggle-btn ${!isPreviewMode ? "active" : ""}`}
                onClick={() => isPreviewMode && togglePreviewMode()}
              >
                ✏️ Édition
              </button>
              <button
                className={`toggle-btn ${isPreviewMode ? "active" : ""}`}
                onClick={() => !isPreviewMode && togglePreviewMode()}
              >
                👁️ Aperçu
              </button>
            </div>
          </div>

          <div className="header-actions">
            <button onClick={handleExport} className="btn-export">
              📥 Télécharger JSON
            </button>
            <div
              style={{ position: "relative", display: "inline-block" }}
              data-export-container
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExportMenu(!showExportMenu);
                }}
                className="btn-export"
                style={{ marginLeft: "10px" }}
              >
                📸 Export
              </button>
              {showExportMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "5px",
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    zIndex: 1000,
                    minWidth: "150px",
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScreenshotExport("png");
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "10px 15px",
                      border: "none",
                      background: "transparent",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f5f5f5")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    🖼️ PNG
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScreenshotExport("jpg");
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "10px 15px",
                      border: "none",
                      background: "transparent",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f5f5f5")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    🖼️ JPG
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScreenshotExport("pdf");
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "10px 15px",
                      border: "none",
                      background: "transparent",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f5f5f5")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    📄 PDF
                  </button>
                </div>
              )}
            </div>
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
