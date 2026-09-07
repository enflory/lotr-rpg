// The furthest completed milestone wins, including saves from the earlier house.
export function nextHouseBeat(f) {
  if (f.learnedSong) return null;
  if (f.houseRested) return 'house_farewell';
  if (f.houseRing) return 'house_bed';
  if (f.houseStories) return 'house_ring';
  if (f.houseNightOne) return 'house_stories';
  if (f.houseSupper) return 'house_bed';
  if (f.houseWelcomed) return 'house_supper';
  return 'house_welcome';
}
export function houseObjective(f) {
  const key = nextHouseBeat(f);
  return (
    {
      house_welcome: 'Follow the golden light to Goldberry’s welcome',
      house_supper: 'Gather at the glowing supper table',
      house_bed: f.houseRing
        ? 'Return to the guest beds for the second night'
        : 'Settle into the guest beds',
      house_stories: 'Join Tom by the hearth for the rainy day’s tales',
      house_ring: 'Show Tom the Ring by the hearth',
      house_farewell: 'Hear Tom’s farewell counsel by the door',
    }[key] ?? 'Leave through the south door and take the eastern path to the downs'
  );
}
