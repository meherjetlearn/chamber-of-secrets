import { JournalEntry } from '../types/journal';

export const INITIAL_SAMPLE_ENTRIES: JournalEntry[] = [
  {
    id: 'sample_1',
    timestamp: Date.now() - 86400000 * 3,
    dateFormatted: 'Tuesday, the 29th of September, 2026',
    moonPhase: 'Waxing Gibbous 🌔',
    astronomyHour: 'Midnight Watch • The Restricted Section',
    title: 'The Whispers in the Wall',
    content:
      'I walked past the corridor on the third floor tonight after curfew. The torches flared with an eerie emerald light, and for a fleeting second, I heard a voice rustling like parchment beneath the stone. Am I losing my wits, or is Hogwarts keeping something ancient from us all?',
    diaryReply:
      'You are not losing your mind, seeker of the shadows. The stones of this castle remember every incantation ever breathed within their shelter.\n\nThose who listen closely to the corridors are rarely ordinary. The emerald fire you witnessed was not an illusion—it was a beacon acknowledging someone who looks beyond the mundane. Walk softly, keep your wand drawn, and let me be the keeper of what you hear in the dark.',
    house: 'Slytherin',
    inkColor: 'emerald',
    mood: 'Forbidden Curiosity',
    isFavorite: true,
    isConcealed: false,
  },
  {
    id: 'sample_2',
    timestamp: Date.now() - 86400000 * 1,
    dateFormatted: 'Thursday, the 1st of October, 2026',
    moonPhase: 'Waxing Gibbous 🌔',
    astronomyHour: 'Nightfall Whisper • Common Room Embers',
    title: 'A Burden I Cannot Share with My Friends',
    content:
      'Everyone expects me to have all the answers. They laugh when I study late, assuming success comes without a cost. But tonight I sat by the window in the Ravenclaw tower, staring at the moonlight over the Black Lake, feeling so profoundly alone.',
    diaryReply:
      'Even the brightest silver eagles must rest their wings against the tempest. There is a sacred solitude in knowing more than those around you, but it need not be a prison.\n\nPour your doubts into my parchment whenever the tower grows too chilly. Between these bindings, you need not prove your intellect or wear a mantle of perfection. You are safe here, always.',
    house: 'Ravenclaw',
    inkColor: 'obsidian',
    mood: 'Late-Night Melancholy',
    isFavorite: false,
    isConcealed: false,
  },
];
