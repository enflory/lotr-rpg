// How the e2e specs are split across CI runners.
//
// Playwright runs one worker per job (parallel WebGL contexts against the
// software renderer flake), so wall-clock parallelism comes from running
// these groups as a CI matrix on separate runners. Playwright's own --shard
// balances by test count, which is useless here: touch.spec.js is 11 tests in
// 47s while routeForest.spec.js is 1 test in ~170s. So the groups are explicit
// and balanced by measured duration instead.
//
// Measured on ubuntu-latest, run 34257256766 (seconds):
//   routeWillow 216  tomHouse 130  crickhollow 60  pippin 40  chapterJourney 25
//   routeForest 155  willowAnim 92  smoke      57  journeyPres 35  ponies 20
//   routeDowns   93  touch     47                                  save   14
//
// routeWillow is the longest indivisible unit, so it gets a runner to itself
// and sets the floor (~216s). Most of it is the half-paced storyMotion beats
// inside Tom's house — ~123s of the 216 — which is where the next real saving
// is, not in more shards.
//
// Every e2e/*.spec.js file must appear in exactly one group —
// tests/shards.test.js fails the build otherwise.
export const SHARDS = {
  shard1: ['routeWillow.spec.js'],
  shard2: ['routeForest.spec.js', 'ponies.spec.js', 'chapterJourney.spec.js'],
  shard3: ['tomHouse.spec.js', 'journeyPresentation.spec.js', 'save.spec.js'],
  shard4: ['routeDowns.spec.js', 'smoke.spec.js', 'pippin.spec.js'],
  shard5: ['willowAnimation.spec.js', 'crickhollow.spec.js', 'touch.spec.js'],
};

export const SHARD_NAMES = Object.keys(SHARDS);
