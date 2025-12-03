import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { EditorElement, ElementType } from "../types/editor";
import { audioDescription } from "../services/audioDescription";

interface EditorState {
  elements: EditorElement[];
  selectedId: string | null;
  isPreviewMode: boolean;
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
      },
      attributes: { htmlId: "main-footer", className: "" },
    },
  ],
  selectedId: null,
  isPreviewMode: false,

  addElement: (type, x, y) => {
    const newId = uuidv4();
    let defaultContent = "Texte";
    let defaultStyle: EditorElement["style"] = {
      fontFamily: "Arial",
      color: "#000000",
    };
    let defaultOptions: string[] | undefined = undefined;
    let defaultDescription: string | undefined = undefined;

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
        };
        // Créer des inputs par défaut pour le formulaire
        const formChildren: EditorElement[] = [
          {
            id: uuidv4(),
            type: "input-email",
            content: "",
            x: 0,
            y: 0,
            style: { fontFamily: "Arial" },
            attributes: { htmlId: "", className: "" },
          },
          {
            id: uuidv4(),
            type: "input-number",
            content: "0",
            x: 0,
            y: 0,
            style: { fontFamily: "Arial" },
            attributes: { htmlId: "", className: "" },
          },
          {
            id: uuidv4(),
            type: "calendar",
            content: new Date().toISOString().split("T")[0],
            x: 0,
            y: 0,
            style: { fontFamily: "Arial" },
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
    if (child && updates.description !== undefined) {
      audioDescription.announceFormChildUpdated(child.type, "label");
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
    set({ selectedId: id });
    audioDescription.announceElementSelected(element || null);
  },

  updateElement: (id, updates) => {
    const state = get();
    const element = state.elements.find((el) => el.id === id);

    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    }));

    if (element) {
      // Determine what changed
      if (updates.style) {
        // Check specific style properties
        if (updates.style.color !== undefined) {
          audioDescription.announceStyleChanged("couleur", updates.style.color);
        }
        if (updates.style.backgroundColor !== undefined) {
          audioDescription.announceStyleChanged(
            "fond",
            updates.style.backgroundColor
          );
        }
        if (updates.style.fontFamily !== undefined) {
          audioDescription.announceStyleChanged(
            "police",
            updates.style.fontFamily
          );
        }
        if (updates.style.fontSize !== undefined) {
          audioDescription.announceStyleChanged(
            "taille",
            `${updates.style.fontSize}px`
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
      if (updates.description !== undefined) {
        audioDescription.announceAttributeChanged(
          "description",
          String(updates.description)
        );
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

  getJSON: () => JSON.stringify(get().elements, null, 2),
}));
