export type ElementType =
  | "text"
  | "button"
  | "image"
  | "video"
  | "header"
  | "footer"
  | "card"
  | "carousel"
  | "select"
  | "input-number"
  | "input-email"
  | "input-text"
  | "input-form"
  | "calendar"
  | "title"
  | "map";

export interface Slide {
  title: string;
  description: string;
  imageUrl?: string;
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  color?: string;
}

export interface EditorElement {
  id: string;
  type: ElementType;
  content: string;

  slides?: Slide[];
  options?: string[];
  description?: string;
  children?: EditorElement[];
  coordinates?: { lat: number; lng: number };
  markers?: MapMarker[];

  x: number;
  y: number;

  attributes: {
    htmlId?: string;
    className?: string;
  };

  style?: {
    backgroundColor?: string;
    color?: string;
    padding?: string;
    width?: string;
    height?: string;
    fontSize?: string;
    borderRadius?: string;
    fontFamily?: string;
  };
}
