import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { EditorElement, ElementType, MapMarker } from "../types/editor";
import { audioDescription } from "../services/audioDescription";

interface EditorState {
  elements: EditorElement[];
  selectedId: string | null;
  selectedChildId: string | null;
  isPreviewMode: boolean;
  canvasDimensions: { width: number; height: number };
  canvasBackgroundColor: string;

  // Actions
  setCanvasBackgroundColor: (color: string) => void;
  centerElementOnCanvas: (id: string) => void;
  addElement: (type: ElementType, x: number, y: number) => void;
  addChildToForm: (formId: string, childElement: EditorElement) => void;
  removeChildFromForm: (formId: string, childId: string) => void;
  updateFormChild: (
    formId: string,
    childId: string,
    updates: Partial<EditorElement>
  ) => void;
  updatePosition: (id: string, x: number, y: number) => void;
  selectElement: (id: string | null) => void;
  selectFormChild: (parentId: string, childId: string | null) => void;
  removeElement: (id: string) => void;
  updateElement: (id: string, updates: Partial<EditorElement>) => void;
  togglePreviewMode: () => void;
  getJSON: () => string;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  elements: [
    {
      id: uuidv4(),
      type: "header",
      content: "Mon Super Site",
      x: 0,
      y: 0,
      style: {
        width: "800px",
        height: "80px",
        backgroundColor: "#2c3e50",
        color: "white",
        fontFamily: "Arial",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "0px",
        boxShadow: "none",
      },
      attributes: { htmlId: "main-header", className: "header-fixed" },
    },
    {
      id: uuidv4(),
      type: "footer",
      content: "© 2025 - Tous droits réservés",
      x: 0,
      y: 940,
      style: {
        width: "800px",
        height: "60px",
        backgroundColor: "#95a5a6",
        color: "white",
        fontFamily: "Arial",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "0px",
        boxShadow: "none",
      },
      attributes: { htmlId: "main-footer", className: "" },
    },
  ],
  selectedId: null,
  selectedChildId: null,
  isPreviewMode: false,
  canvasDimensions: { width: 800, height: 1000 },
  canvasBackgroundColor: "#ffffff",

  setCanvasBackgroundColor: (color) => set({ canvasBackgroundColor: color }),

  centerElementOnCanvas: (id) => {
    const state = get();
    const element = state.elements.find((el) => el.id === id);

    if (element) {
      const elementWidth = parseFloat(element.style?.width || "100");
      const elementHeight = parseFloat(element.style?.height || "100");

      const centerX = (state.canvasDimensions.width - elementWidth) / 2;
      const centerY = (state.canvasDimensions.height - elementHeight) / 2;

      set((state) => ({
        elements: state.elements.map((el) =>
          el.id === id
            ? { ...el, x: Math.max(0, centerX), y: Math.max(0, centerY) }
            : el
        ),
      }));

      audioDescription.announceElementMoved(
        element.type,
        Math.max(0, centerX),
        Math.max(0, centerY)
      );
    }
  },

  addElement: (type, x, y) => {
    const newId = uuidv4();
    let defaultContent = "Texte";
    let defaultStyle: EditorElement["style"] = {
      fontFamily: "Arial",
      color: "#000000",
      textAlign: "left",
      borderRadius: "0px",
      boxShadow: "none",
    };
    let defaultOptions: string[] | undefined = undefined;
    let defaultDescription: string | undefined = undefined;
    let defaultCoordinates: { lat: number; lng: number } | undefined =
      undefined;
    let defaultMarkers: MapMarker[] | undefined = undefined;

    switch (type) {
      case "video":
        defaultContent = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
        defaultStyle = { ...defaultStyle, width: "480px", height: "270px" };
        break;
      case "image":
        defaultContent = "https://via.placeholder.com/300x200";
        defaultStyle = { ...defaultStyle, width: "300px", height: "auto" };
        break;
      case "card":
        defaultContent = "Titre Carte";
        defaultDescription = "Description...";
        defaultStyle = {
          ...defaultStyle,
          width: "300px",
          backgroundColor: "#ffffff",
          padding: "15px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          borderRadius: "8px",
        };
        break;
      case "button":
        defaultContent = "Bouton";
        defaultStyle = {
          ...defaultStyle,
          backgroundColor: "#3498db",
          color: "#ffffff",
          borderRadius: "4px",
          padding: "10px 20px",
        };
        break;
      case "header":
        defaultContent = "Header";
        defaultStyle = {
          ...defaultStyle,
          width: "800px",
          height: "80px",
          backgroundColor: "#2c3e50",
          color: "#ffffff",
          display: "flex",
        };
        break;
      case "footer":
        defaultContent = "Footer";
        defaultStyle = {
          ...defaultStyle,
          width: "800px",
          height: "60px",
          backgroundColor: "#95a5a6",
          color: "#ffffff",
          display: "flex",
        };
        break;
      case "title":
        defaultContent = "Mon Titre";
        defaultStyle = { ...defaultStyle, color: "#2c3e50" };
        break;
      case "select":
        defaultContent = "Option 1";
        defaultOptions = ["Option 1", "Option 2", "Option 3"];
        break;
      case "input-number":
        defaultContent = "0";
        break;
      case "input-email":
        defaultContent = "";
        break;
      case "input-text":
        defaultContent = "";
        break;
      case "input-form": {
        defaultContent = "Mon Formulaire";
        defaultStyle = {
          ...defaultStyle,
          width: "400px",
          backgroundColor: "#f8f9fa",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          textAlign: "left",
          alignItems: "stretch",
          borderRadius: "8px",
          border: "1px solid #ddd",
        };

        const formChildren: EditorElement[] = [
          {
            id: uuidv4(),
            type: "input-email",
            content: "",
            x: 0,
            y: 0,
            style: { fontFamily: "Arial", textAlign: "left" },
            attributes: { htmlId: "", className: "" },
          },
        ];

        set((state) => ({
          elements: [
            ...state.elements,
            {
              id: newId,
              type,
              content: defaultContent,
              description: defaultDescription,
              options: defaultOptions,
              children: formChildren,
              x,
              y,
              style: defaultStyle,
              attributes: { htmlId: "", className: "" },
            },
          ],
          selectedId: newId,
        }));
        return;
      }
      case "calendar":
        defaultContent = new Date().toISOString().split("T")[0];
        break;
      case "map":
        defaultContent = "Ma carte";
        defaultStyle = {
          ...defaultStyle,
          width: "400px",
          height: "300px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        };
        defaultCoordinates = { lat: 48.8566, lng: 2.3522 };
        defaultMarkers = [
          {
            id: uuidv4(),
            lat: 48.8566,
            lng: 2.3522,
            label: "Paris",
            color: "#FF5252",
          },
        ];
        break;
    }

    set((state) => ({
      elements: [
        ...state.elements,
        {
          id: newId,
          type,
          content: defaultContent,
          description: defaultDescription,
          options: defaultOptions,
          coordinates: defaultCoordinates,
          markers: defaultMarkers,
          x,
          y,
          style: defaultStyle,
          attributes: { htmlId: "", className: "" },
        },
      ],
      selectedId: newId,
    }));

    audioDescription.announceElementAdded(type, x, y);
  },

  addChildToForm: (formId, childElement) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === formId
          ? {
              ...el,
              children: [...(el.children || []), childElement],
            }
          : el
      ),
    }));
    audioDescription.announceFormChildAdded(childElement.type);
  },

  removeChildFromForm: (formId, childId) => {
    const state = get();
    const form = state.elements.find((el) => el.id === formId);
    const child = form?.children?.find((c) => c.id === childId);

    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === formId
          ? {
              ...el,
              children: (el.children || []).filter(
                (child) => child.id !== childId
              ),
            }
          : el
      ),
    }));

    if (child) {
      audioDescription.announceFormChildRemoved(child.type);
    }
  },

  updateFormChild: (formId, childId, updates) => {
    const state = get();
    const form = state.elements.find((el) => el.id === formId);
    const child = form?.children?.find((c) => c.id === childId);

    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === formId
          ? {
              ...el,
              children: (el.children || []).map((child) =>
                child.id === childId ? { ...child, ...updates } : child
              ),
            }
          : el
      ),
    }));

    if (child && updates.content !== undefined) {
      audioDescription.announceFormChildUpdated(child.type, "contenu");
    }
  },

  updatePosition: (id, x, y) => {
    const state = get();
    const element = state.elements.find((el) => el.id === id);

    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, x, y } : el
      ),
    }));

    if (element) {
      audioDescription.announceElementMoved(element.type, x, y);
    }
  },

  selectElement: (id) => {
    const state = get();
    const element = state.elements.find((el) => el.id === id);
    set({ selectedId: id, selectedChildId: null });
    audioDescription.announceElementSelected(element || null);
  },

  selectFormChild: (parentId, childId) => {
    set({ selectedId: parentId, selectedChildId: childId });
  },

  updateElement: (id, updates) => {
    const state = get();
    const element = state.elements.find((el) => el.id === id);

    const styleUpdates = { ...(updates.style || {}) };

    if (Object.keys(styleUpdates).length > 0) {
      updates.style = styleUpdates;
    }

    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id
          ? {
              ...el,
              ...updates,
              style: { ...el.style, ...updates.style },
            }
          : el
      ),
    }));

    if (element) {
      if (updates.style) {
        if (updates.style.borderRadius) {
          audioDescription.announceStyleChanged(
            "arrondi",
            updates.style.borderRadius
          );
        }
        if (updates.style.textAlign) {
          audioDescription.announceStyleChanged(
            "alignement",
            updates.style.textAlign
          );
        }
        if (updates.style.color !== undefined) {
          audioDescription.announceStyleChanged("couleur", updates.style.color);
        }
        if (updates.style.backgroundColor !== undefined) {
          audioDescription.announceStyleChanged(
            "fond",
            updates.style.backgroundColor
          );
        }
      }
      if (updates.content !== undefined) {
        const contentStr =
          typeof updates.content === "string"
            ? updates.content
            : String(updates.content);
        audioDescription.announceContentChanged(element.type, contentStr);
      }
    }
  },

  removeElement: (id) => {
    const state = get();
    const element = state.elements.find((el) => el.id === id);

    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedId: null,
    }));

    if (element) {
      audioDescription.announceElementRemoved(element.type);
    }
  },

  togglePreviewMode: () => {
    const state = get();
    const newMode = !state.isPreviewMode;
    set({ isPreviewMode: newMode, selectedId: null });
    audioDescription.announceModeChanged(newMode);
  },

  getJSON: () => {
    const state = get();

    // Fonction pour générer l'ariaLabel d'un élément
    const getAriaLabel = (element: EditorElement): string => {
      // Si l'élément a une description, on l'utilise
      if (element.description) return element.description;

      // Sinon, on génère un label approprié selon le type
      const ariaLabels: Record<ElementType, string> = {
        text: "Élément de texte",
        button: element.content || "Bouton",
        image: "Image",
        video: "Vidéo",
        header: "En-tête de page",
        footer: "Pied de page",
        card: element.content || "Carte",
        title: element.content || "Titre",
        select: "Menu déroulant",
        "input-number": "Champ numérique",
        "input-email": "Champ email",
        "input-text": "Champ texte",
        "input-form": element.content || "Formulaire",
        calendar: "Sélecteur de date",
        map: element.content || "Carte interactive",
        carousel: "Carrousel d'images",
        textarea: "Zone de texte multiligne",
        heading: element.content || "En-tête",
        input: "Champ de saisie",
      };

      return ariaLabels[element.type] || "Élément";
    };

    // Mapper les éléments avec leurs ariaLabel
    const elementsWithAria = state.elements.map((element) => ({
      ...element,
      ariaLabel: getAriaLabel(element),
      // Ajouter ariaLabel aux enfants de formulaire
      children: element.children?.map((child) => ({
        ...child,
        ariaLabel: getAriaLabel(child),
      })),
    }));

    const exportData = {
      meta: {
        version: "1.0",
        date: new Date().toISOString(),
      },
      canvas: {
        backgroundColor: state.canvasBackgroundColor,
        width: state.canvasDimensions.width,
        height: state.canvasDimensions.height,
      },
      elements: elementsWithAria,
    };
    return JSON.stringify(exportData, null, 2);
  },
}));
