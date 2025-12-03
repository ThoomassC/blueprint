export type ElementType =
  | 'text'
  | 'image'
  | 'video'
  | 'button'
  | 'header'
  | 'footer'
  | 'card'
  | 'input-text'
  | 'input-email'
  | 'input-number'
  | 'input-form'
  | 'select'
  | 'calendar'
  | 'map'
  | 'title'
  | 'carousel'
  | 'textarea'
  | 'heading'
  | 'input';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  color?: string;
}

export interface Slide {
  title: string;
  description: string;
  imageUrl: string;
}

export interface EditorElement {
  id: string;
  type: ElementType;
  content: string;
  x: number;
  y: number;
  style: {
    width?: string;
    height?: string;
    backgroundColor?: string;
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    padding?: string;
    borderRadius?: string;
    border?: string;
    textAlign?: 'left' | 'center' | 'right' | string;
    display?: 'flex' | 'block' | 'inline-block' | 'none' | string;
    flexDirection?:
      | 'row'
      | 'column'
      | 'row-reverse'
      | 'column-reverse'
      | string;
    alignItems?:
      | 'flex-start'
      | 'center'
      | 'flex-end'
      | 'stretch'
      | 'baseline'
      | string;
    justifyContent?:
      | 'flex-start'
      | 'center'
      | 'flex-end'
      | 'space-between'
      | 'space-around'
      | string;
    gap?: string;
    zIndex?: number;
    position?: 'absolute' | 'relative' | string;
    left?: number | string;
    top?: number | string;
    cursor?: string;
    // ✅ CORRECTION 1 : On remplace 'any' par les types valides en CSS (string ou number)
    [key: string]: string | number | undefined;
  };
  attributes?: {
    htmlId?: string;
    className?: string;
    [key: string]: string | number | boolean | undefined;
  };
  children?: EditorElement[];
  description?: string;
  options?: string[];
  coordinates?: { lat: number; lng: number };
  markers?: MapMarker[];
  slides?: Slide[];
}
