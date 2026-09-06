# Beyond the Hedge

Build on PR 28 (3932dda), preserving its companion and save behavior.

Chapter 2 runs from Crickhollow at dawn, through the tunnel under the High Hay, the Bonfire Glade, a hilltop, the descending hollows, the Withywindle, Old Man Willow, and Tom and Goldberry's house. Chapter 3 continues across the sunny downs, the cold standing stone and fog, the barrow, rescue, blades and recovered ponies, to the East Road. Both ship together; the house provides the natural chapter break.

Exploration is the hook: connected, broad woodland areas with winding routes, optional glades and inspectable landmarks. The northern routes turn south; do not randomize or strand the player. An atmospheric canopy, drifting leaves, river glints, rain at the house and fog on the downs give distinct moods. New original procedural tiles, character art and music stay within the existing Phaser pipeline.

The narrative follows Fellowship Book I chapters 5–8. Crickhollow briefly establishes the conspiracy and Fatty staying behind. Merry joins Sam and Pippin as the third follower. Ponies are acknowledged and represented at departure/rest stops; traversal uses the existing walking controls. At Willow, sleep overtakes the party, Sam rescues Frodo, Merry and Pippin are trapped, fire fails, Frodo runs to call for help, Tom sings them free. At the house: Goldberry's welcome, supper, first sleep, rainy storytelling, Ring demonstration, second sleep, farewell and Tom's summoning verse. In the barrow: separation and capture, companions laid out, Frodo rejects escape alone, strikes the hand, calls Tom, rescue, four blades, recovered ponies, road. No generic enemies or invented combat quest.

All prose is original paraphrase; source anchors and adaptation decisions are documented. Summoning is presented as Frodo remembering the verse, without reproducing the poem. Prompts must make the playable action clear. Encounters cannot require fast reflexes or permanently fail.

Reuse zone hooks, dialogues and flags. Add reusable inspectable interactables and checkpoint-on-dialogue effects; danger-scene geometry and party visibility must derive from saved flags on zone creation. Autosaves never strand the player in an unresumable animation. Restore all three followers after rescue. Existing v1 saves remain valid.

Acceptance: walkable routes from each entry to all reachable exits and interactions; full connected journey through ordinary interactions; gated exits cannot skip rescue/rest/blades; refresh/Continue through danger and rest phases; old chapter tests pass; lint, typecheck, format, build, unit and E2E tests pass; visual review of forest, Willow, house and barrow. Ending clearly names the East Road and the next chapter; no unimplemented Bree entry.
