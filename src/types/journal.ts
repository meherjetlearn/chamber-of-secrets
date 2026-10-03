export type HogwartsHouse = 'Slytherin' | 'Gryffindor' | 'Ravenclaw' | 'Hufflepuff' | 'Hogwarts';

export type InkColor = 'obsidian' | 'emerald' | 'maroon' | 'gold';

export interface JournalEntry {
  id: string;
  timestamp: number;
  dateFormatted: string;
  moonPhase: string;
  astronomyHour: string;
  title: string;
  content: string;
  diaryReply: string;
  house: HogwartsHouse;
  inkColor: InkColor;
  mood: string;
  isFavorite: boolean;
  isConcealed: boolean;
}

export type WritingState = 'idle' | 'absorbing' | 'communing' | 'revealing' | 'completed';
