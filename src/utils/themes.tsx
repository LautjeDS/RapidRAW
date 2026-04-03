import { Theme } from '../components/ui/AppProperties';

export interface ThemeProps {
  cssVariables: any;
  id: Theme;
  name: string;
  splashImage: string;
}

export const THEMES: Array<ThemeProps> = [
  {
    id: Theme.Dark,
    name: 'Dark',
    splashImage: '/splash-dark.jpg',
    cssVariables: {
      '--app-bg-primary': 'rgba(45, 45, 45, 0.6)',
      '--app-bg-secondary': 'rgba(34, 34, 34, 0.75)',
      '--app-surface': 'rgb(28, 28, 28)',
      '--app-card-active': 'rgb(43, 43, 43)',
      '--app-button-text': 'rgb(0, 0, 0)',
      '--app-text-primary': 'rgb(232, 234, 237)',
      '--app-text-secondary': 'rgb(158, 158, 158)',
      '--app-accent': 'rgb(255, 255, 255)',
      '--app-border-color': 'rgb(74, 74, 74)',
      '--app-hover-color': 'rgb(255, 255, 255)',
    },
  },
  {
    id: Theme.Light,
    name: 'Light',
    splashImage: '/splash-light.jpg',
    cssVariables: {
      '--app-bg-primary': 'rgba(250, 250, 250, 0.8)',
      '--app-bg-secondary': 'rgba(255, 255, 255, 0.9)',
      '--app-surface': 'rgb(240, 240, 240)',
      '--app-card-active': 'rgb(235, 235, 235)',
      '--app-button-text': 'rgb(255, 255, 255)',
      '--app-text-primary': 'rgb(20, 20, 20)',
      '--app-text-secondary': 'rgb(108, 108, 108)',
      '--app-accent': 'rgb(181, 141, 98)',
      '--app-border-color': 'rgb(224, 224, 224)',
      '--app-hover-color': 'rgb(181, 141, 98)',
    },
  },
  {
    id: Theme.Grey,
    name: 'Grey',
    splashImage: '/splash-grey.jpg',
    cssVariables: {
      '--app-bg-primary': 'rgba(88, 88, 88, 0.7)',
      '--app-bg-secondary': 'rgba(90, 90, 90, 0.8)',
      '--app-surface': 'rgb(80, 80, 80)',
      '--app-card-active': 'rgb(105, 105, 105)',
      '--app-button-text': 'rgb(80, 80, 80)',
      '--app-text-primary': 'rgb(225, 225, 225)',
      '--app-text-secondary': 'rgb(160, 160, 160)',
      '--app-accent': 'rgb(210, 210, 210)',
      '--app-border-color': 'rgb(110, 110, 110)',
      '--app-hover-color': 'rgb(210, 210, 210)',
    },
  },
  {
    id: Theme.MutedGreen,
    name: 'Muted Green',
    splashImage: '/splash-green.jpg',
    cssVariables: {
      '--app-bg-primary': 'rgba(55, 60, 50, 0.7)',
      '--app-bg-secondary': 'rgba(65, 70, 60, 0.8)',
      '--app-surface': 'rgb(45, 50, 40)',
      '--app-card-active': 'rgb(75, 80, 70)',
      '--app-button-text': 'rgb(45, 50, 40)',
      '--app-text-primary': 'rgb(227, 225, 220)',
      '--app-text-secondary': 'rgb(155, 160, 150)',
      '--app-accent': 'rgb(219, 212, 173)',
      '--app-border-color': 'rgb(85, 90, 80)',
      '--app-hover-color': 'rgb(219, 212, 173)',
    },
  },
  {
    id: Theme.Blue,
    name: 'Blue',
    splashImage: '/splash-blue.jpg',
    cssVariables: {
      '--app-bg-primary': 'rgba(32, 36, 37, 0.7)',
      '--app-bg-secondary': 'rgba(42, 46, 50, 0.85)',
      '--app-surface': 'rgb(35, 38, 41)',
      '--app-card-active': 'rgb(52, 57, 62)',
      '--app-button-text': 'rgb(35, 38, 41)',
      '--app-text-primary': 'rgb(220, 225, 230)',
      '--app-text-secondary': 'rgb(145, 155, 165)',
      '--app-accent': 'rgb(152, 187, 199)',
      '--app-border-color': 'rgb(60, 65, 70)',
      '--app-hover-color': 'rgb(152, 187, 199)',
    },
  },
  {
    id: Theme.Sepia,
    name: 'Sepia',
    splashImage: '/splash-sepia.jpg',
    cssVariables: {
      '--app-bg-primary': 'rgba(48, 43, 38, 0.7)',
      '--app-bg-secondary': 'rgba(65, 60, 55, 0.8)',
      '--app-surface': 'rgb(52, 47, 43)',
      '--app-card-active': 'rgb(80, 75, 70)',
      '--app-button-text': 'rgb(50, 45, 40)',
      '--app-text-primary': 'rgb(225, 215, 205)',
      '--app-text-secondary': 'rgb(160, 150, 140)',
      '--app-accent': 'rgb(255, 226, 182)',
      '--app-border-color': 'rgb(90, 85, 80)',
      '--app-hover-color': 'rgb(255, 226, 182)',
    },
  },
  {
    id: Theme.Snow,
    name: 'Snow',
    splashImage: '/splash-snow.jpg',
    cssVariables: {
      '--app-bg-primary': 'rgba(248, 249, 250, 0.8)',
      '--app-bg-secondary': 'rgba(255, 255, 255, 0.9)',
      '--app-surface': 'rgb(243, 236, 233)',
      '--app-card-active': 'rgb(233, 236, 239)',
      '--app-button-text': 'rgb(255, 255, 255)',
      '--app-text-primary': 'rgb(33, 37, 41)',
      '--app-text-secondary': 'rgb(108, 117, 125)',
      '--app-accent': 'rgb(215, 123, 107)',
      '--app-border-color': 'rgb(222, 226, 230)',
      '--app-hover-color': 'rgb(215, 123, 107)',
    },
  },
  {
    id: Theme.Arctic,
    name: 'Arctic',
    splashImage: '/splash-arctic.jpg',
    cssVariables: {
      '--app-bg-primary': 'rgba(248, 249, 250, 0.8)',
      '--app-bg-secondary': 'rgba(255, 255, 255, 0.9)',
      '--app-surface': 'rgb(240, 245, 249)',
      '--app-card-active': 'rgb(233, 236, 239)',
      '--app-button-text': 'rgb(255, 255, 255)',
      '--app-text-primary': 'rgb(33, 37, 41)',
      '--app-text-secondary': 'rgb(108, 117, 125)',
      '--app-accent': 'rgb(100, 120, 140)',
      '--app-border-color': 'rgb(222, 226, 230)',
      '--app-hover-color': 'rgb(100, 120, 140)',
    },
  },
];

export const DEFAULT_THEME_ID = Theme.Dark;
