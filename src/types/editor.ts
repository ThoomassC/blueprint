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
  | "calendar"
  | "title";

export interface Slide {
  title: string;
  description: string;
  imageUrl?: string;
}

export interface EditorElement {
  id: string;
  type: ElementType;
  content: string;

  slides?: Slide[];
  options?: string[];
  description?: string;

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
