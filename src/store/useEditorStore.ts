import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { EditorElement, ElementType } from '../types/editor';

interface EditorState {
  elements: EditorElement[];
  selectedId: string | null;
  isPreviewMode: boolean;
  addElement: (type: ElementType, x: number, y: number) => void;
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
      type: 'header',
      content: 'Mon Super Site',
      x: 0,
      y: 0,
      style: {
        width: '800px',
        height: '80px',
        backgroundColor: '#2c3e50',
        color: 'white',
        fontFamily: 'Arial',
      },
      attributes: { htmlId: 'main-header', className: 'header-fixed' },
      animation: { type: 'none', duration: 1, delay: 0 },
    },
    {
      id: uuidv4(),
      type: 'footer',
      content: '© 2025 - Tous droits réservés',
      x: 0,
      y: 940,
      style: {
        width: '800px',
        height: '60px',
        backgroundColor: '#95a5a6',
        color: 'white',
        fontFamily: 'Arial',
      },
      attributes: { htmlId: 'main-footer', className: '' },
      animation: { type: 'none', duration: 1, delay: 0 },
    },
  ],
  selectedId: null,
  isPreviewMode: false,

  addElement: (type, x, y) => {
    const newId = uuidv4();
    let defaultContent = 'Texte';
    let defaultStyle: EditorElement['style'] = {
      fontFamily: 'Arial',
      color: '#000000',
    };
    let defaultOptions: string[] | undefined = undefined;
    let defaultDescription: string | undefined = undefined;

    switch (type) {
      case 'video':
        defaultContent = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        defaultStyle = { ...defaultStyle, width: '480px', height: '270px' };
        break;

      case 'image':
        defaultContent = 'https://via.placeholder.com/300x200';
        defaultStyle = { ...defaultStyle, width: '300px', height: 'auto' };
        break;
      case 'card':
        defaultContent = 'Titre Carte';
        defaultDescription = 'Description...';
        defaultStyle = {
          ...defaultStyle,
          width: '300px',
          backgroundColor: '#ffffff',
          padding: '15px',
        };
        break;
      case 'button':
        defaultContent = 'Bouton';
        defaultStyle = {
          ...defaultStyle,
          backgroundColor: '#3498db',
          color: '#ffffff',
          borderRadius: '4px',
          padding: '10px 20px',
        };
        break;
      case 'header':
        defaultContent = 'Header';
        defaultStyle = {
          ...defaultStyle,
          width: '800px',
          height: '80px',
          backgroundColor: '#2c3e50',
          color: '#ffffff',
        };
        break;
      case 'footer':
        defaultContent = 'Footer';
        defaultStyle = {
          ...defaultStyle,
          width: '800px',
          height: '60px',
          backgroundColor: '#95a5a6',
          color: '#ffffff',
        };
        break;
      case 'title':
        defaultContent = 'Mon Titre';
        defaultStyle = { ...defaultStyle, color: '#2c3e50' };
        break;
      case 'select':
        defaultContent = 'Option 1';
        defaultOptions = ['Option 1', 'Option 2', 'Option 3'];
        break;
      case 'input-number':
        defaultContent = '0';
        break;
      case 'calendar':
        defaultContent = new Date().toISOString().split('T')[0];
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
          attributes: { htmlId: '', className: '' },
          animation: { type: 'none', duration: 1, delay: 0 },
        },
      ],
      selectedId: newId,
    }));
  },

  updatePosition: (id, x, y) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, x, y } : el
      ),
    })),
  selectElement: (id) => set({ selectedId: id }),
  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    })),
  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedId: null,
    })),
  togglePreviewMode: () =>
    set((state) => ({ isPreviewMode: !state.isPreviewMode, selectedId: null })),
  getJSON: () => JSON.stringify(get().elements, null, 2),
}));
