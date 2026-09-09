// How the e2e specs are split across CI runners.
//
// Playwright runs one worker per job (parallel WebGL contexts against the
// software renderer flake), so wall-clock parallelism comes from running
// these groups as a CI matrix on separate runners. Playwright's own --shard
// balances by test count, which is useless here: touch.spec.js is 11 tests in
// 47s while routeForest.spec.js is 1 test in ~170s. So the groups are explicit
// and balanced by measured duration instead.
//
// Measured per file, in seconds, across two CI runs on identical test code
// (34257256766 / 34258149119):
//   routeWillow 216/188  tomHouse 130  crickhollow 60  pippin 40  ponies 20
//   routeForest 155/228  willowAnim 92  smoke      57  journeyPres 35
//   routeDowns   93       touch     47  chapterJourney 25          save   14
//
// Note the spread: routeForest moved 155 -> 228 and routeWillow 216 -> 188 with
// no code change between them. GitHub's shared runners vary by roughly a third
// on the same work, so DO NOT rebalance these groups off a single run — the
// second layout here was tuned from run 1 and came out 10s slower on run 2,
// which is well inside the noise. Rebalance only for an imbalance that holds
// across several runs.
//
// The two route segments (~190-200s each) are the floor: they are single tests
// and cannot be divided, so any layout lands near 200s plus ~35s of setup. More
// shards will not help. The remaining lever is the half-paced storyMotion beats
// in Tom's house — ~123s inside routeWillow, plus tomHouse.spec.js entire.
//
// Every e2e/*.spec.js file must appear in exactly one group —
// tests/shards.test.js fails the build otherwise.
export const SHARDS = {
  shard1: ['routeWillow.spec.js'],
  shard2: ['routeForest.spec.js', 'barrowStaging.spec.js'],
  shard3: [
    'tomHouse.spec.js',
    'journeyPresentation.spec.js',
    'save.spec.js',
    'chapterJourney.spec.js',
  ],
  shard4: ['routeDowns.spec.js', 'smoke.spec.js', 'pippin.spec.js', 'barrowReview.spec.js'],
  shard5: ['willowAnimation.spec.js', 'crickhollow.spec.js', 'touch.spec.js', 'ponies.spec.js'],
};

export const SHARD_NAMES = Object.keys(SHARDS);
