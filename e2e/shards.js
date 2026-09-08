// How the e2e specs are split across CI runners.
//
// Playwright runs one worker per job (parallel WebGL contexts against the
// software renderer flake), so wall-clock parallelism comes from running
// these groups as a CI matrix on separate runners. Playwright's own --shard
// balances by test count, which is useless here: touch.spec.js is 11 tests in
// 47s while routeForest.spec.js is 1 test in ~170s. So the groups are explicit
// and balanced by measured duration instead.
//
// Approximate durations (seconds). The route segments are measured locally
// and scaled; everything else is from CI run 34249538899. Re-measure from the
// `list` reporter output and rebalance when they drift.
//   routeForest ~160  tomHouse   130  crickhollow 60  pippin 40  ponies 20
//   routeWillow ~160  willowAnim  92  smoke       57  journeyPres 28
//   routeDowns  ~105  touch       47  chapterJourney ~60  save 10
//
// Every e2e/*.spec.js file must appear in exactly one group —
// tests/shards.test.js fails the build otherwise.
export const SHARDS = {
  shard1: ['routeForest.spec.js', 'ponies.spec.js'],
  shard2: ['routeWillow.spec.js', 'journeyPresentation.spec.js', 'save.spec.js'],
  shard3: ['tomHouse.spec.js', 'chapterJourney.spec.js'],
  shard4: ['routeDowns.spec.js', 'smoke.spec.js', 'pippin.spec.js'],
  shard5: ['willowAnimation.spec.js', 'crickhollow.spec.js', 'touch.spec.js'],
};

export const SHARD_NAMES = Object.keys(SHARDS);
