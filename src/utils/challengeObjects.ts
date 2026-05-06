export interface ChallengeObject {
  name: string;
}

export const challengeObjects: ChallengeObject[] = [
  { name: 'cup' },
  { name: 'bottle' },
  { name: 'chair' },
  { name: 'laptop' },
  { name: 'keyboard' },
  { name: 'mouse' },
  { name: 'book' },
  { name: 'backpack' },
  { name: 'cell phone' },
  { name: 'remote' },
  { name: 'clock' },
  { name: 'scissors' },
  { name: 'toothbrush' },
  { name: 'spoon' },
  { name: 'fork' },
  { name: 'bowl' },
  { name: 'umbrella' },
  { name: 'handbag' },
  { name: 'suitcase' },
  { name: 'shoe' },
];

export function getRandomChallengeObject(): ChallengeObject {
  return challengeObjects[Math.floor(Math.random() * challengeObjects.length)];
}

export function getChallengeObjectByName(name: string): ChallengeObject | undefined {
  return challengeObjects.find((obj) => obj.name.toLowerCase() === name.toLowerCase());
}
