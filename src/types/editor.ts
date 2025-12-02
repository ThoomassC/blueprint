export type ElementType =
  | 'text'
  | 'button'
  | 'image'
  | 'video'
  | 'header'
  | 'footer'
  | 'card'
  | 'select'
  | 'input-number'
  | 'calendar'
  | 'title';

export type AnimationType =
  | 'none'
  | 'fade-in'
  | 'slide-up'
  | 'zoom-in'
  | 'bounce';

export interface EditorElement {
  id: string;
  type: ElementType;
  content: string;
  x: number;
  y: number;
  options?: string[];
  description?: string;
  attributes: {
    htmlId?: string;
    className?: string;
  };
  animation: {
    type: AnimationType;
    duration: number;
    delay: number;
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
