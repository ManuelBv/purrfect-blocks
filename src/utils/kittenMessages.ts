export const KITTEN_MESSAGES = [
  'Meow',
  'Purrr',
  'Mrrrow',
  'Nya',
  'Mew',
  'Purr-fect',
  'Meowdy',
  'Paw-some',
  'Fur-tastic',
  'Whisker-ific',
];

export const KITTEN_EMOJIS = ['🐾', '😺', '😸', '😻', '🐱', '🎀', '🧶', '🐟'];

export function getRandomKittenMessage(): string {
  return KITTEN_MESSAGES[Math.floor(Math.random() * KITTEN_MESSAGES.length)];
}

export function getRandomKittenEmojis(): string {
  const count = Math.floor(Math.random() * 3) + 1; // 1-3 emojis
  const emojis: string[] = [];

  for (let i = 0; i < count; i++) {
    const emoji = KITTEN_EMOJIS[Math.floor(Math.random() * KITTEN_EMOJIS.length)];
    emojis.push(emoji);
  }

  return emojis.join(' ');
}

export function generateGreeting(playerName: string): string {
  const message = getRandomKittenMessage();
  const emojis = getRandomKittenEmojis();
  return `${message}, ${playerName}! ${emojis}`;
}
