/// <reference types="vite/client" />

declare module 'lucide-react' {
  import * as React from 'react';
  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    className?: string;
  }
  export type LucideIcon = React.FC<LucideProps>;

  export const Play: LucideIcon;
  export const Pause: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const RotateCw: LucideIcon;
  export const Volume2: LucideIcon;
  export const VolumeX: LucideIcon;
  export const Sliders: LucideIcon;
  export const Bookmark: LucideIcon;
  export const Subtitles: LucideIcon;
  export const Maximize: LucideIcon;
  export const Minimize: LucideIcon;
  export const FastForward: LucideIcon;
  export const Moon: LucideIcon;
  export const X: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const FolderOpen: LucideIcon;
  export const Film: LucideIcon;
  export const Clock: LucideIcon;
}
