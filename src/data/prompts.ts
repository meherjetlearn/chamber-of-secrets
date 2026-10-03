import { HogwartsHouse, InkColor } from '../types/journal';

export interface HouseInfo {
  name: HogwartsHouse;
  motto: string;
  primaryColor: string;
  accentColor: string;
  sealSymbol: string;
  description: string;
}

export const HOUSES: Record<HogwartsHouse, HouseInfo> = {
  Slytherin: {
    name: 'Slytherin',
    motto: 'Pride, Ambition & Cunning',
    primaryColor: '#10492c',
    accentColor: '#9aa0a6',
    sealSymbol: '🐍',
    description: 'Emerald fires, serpent stone carvings, and quiet cunning secrets beneath the Black Lake.',
  },
  Gryffindor: {
    name: 'Gryffindor',
    motto: 'Courage, Bravery & Chivalry',
    primaryColor: '#740001',
    accentColor: '#d3a625',
    sealSymbol: '🦁',
    description: 'Deep scarlet velvet, roar of the hearth fires, and confessions of daring hearts.',
  },
  Ravenclaw: {
    name: 'Ravenclaw',
    motto: 'Wit, Wisdom & Intellect',
    primaryColor: '#0e1a40',
    accentColor: '#946b2d',
    sealSymbol: '🦅',
    description: 'Star-swept midnight towers, endless tomes, and thoughts that probe the mysteries of existence.',
  },
  Hufflepuff: {
    name: 'Hufflepuff',
    motto: 'Loyalty, Patience & Dedication',
    primaryColor: '#ecb939',
    accentColor: '#372e29',
    sealSymbol: '🦡',
    description: 'Sunlit earthen warmth, scent of sweet herbs, and steadfast honesty in all things.',
  },
  Hogwarts: {
    name: 'Hogwarts',
    motto: 'Draco Dormiens Nunquam Titillandus',
    primaryColor: '#3d1635',
    accentColor: '#d4af37',
    sealSymbol: '🏰',
    description: 'The ancient castle herself — centuries of whispers echoing through stone corridors.',
  },
};

export const INK_COLORS: { id: InkColor; label: string; textClass: string; hex: string; desc: string }[] = [
  {
    id: 'obsidian',
    label: 'Raven Feather Obsidian',
    textClass: 'text-[#1c1815]',
    hex: '#1c1815',
    desc: 'Deep velvety midnight ink ground from enchanted volcanic glass.',
  },
  {
    id: 'emerald',
    label: 'Basilisk Venom Emerald',
    textClass: 'text-[#0e4429]',
    hex: '#0e4429',
    desc: 'Luminescent dark jade, imbued with the secret essence of the serpents.',
  },
  {
    id: 'maroon',
    label: 'Phoenix Tear Crimson',
    textClass: 'text-[#5c1322]',
    hex: '#5c1322',
    desc: 'Rich garnet red, steeped in dragon blood and burning embers.',
  },
  {
    id: 'gold',
    label: 'Gilded Snitch Gold',
    textClass: 'text-[#845c11]',
    hex: '#845c11',
    desc: 'Reflective alchemical gold that catches the flickering candlelight.',
  },
];

export const WHISPER_PROMPTS = [
  'Whisper a secret you have shielded from every living soul...',
  'What fear haunts you when the castle falls dead silent at midnight?',
  'If you could drink a vial of Liquid Luck today, what choice would you make?',
  'Tell me of a longing that feels too sacred—or too dangerous—to speak aloud.',
  'What truth did someone speak to you that you still carry like a brand?',
  'If you stood before the Mirror of Erised tonight, whose reflection would stand beside yours?',
  'What part of yourself do you hide behind a mask of poise and confidence?',
  'Confide in me the mystery in your life that no logic or spell can unravel...',
];

export const MOOD_TAGS = [
  'Haunted & Confessional',
  'Quiet Wonder',
  'Simmering Ambition',
  'Late-Night Melancholy',
  'Fierce Resolve',
  'Forbidden Curiosity',
  'Weary Heart',
  'Sparks of Hope',
];
