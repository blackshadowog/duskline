import type { MapId } from "./data";

export interface MissionStory {
  why: string;
  intel: string[];
  win: string;
  fail: string;
}

export const CAMPAIGN_INTRO = {
  title: "OPERATION DUSKLINE",
  subtitle: "Why you are here",
  body: [
    "Six months ago, a ghost network called THE ARCHITECT began stitching the world's black markets into one weapon — smuggled arms, trafficked scientists, hijacked comms, syndicate money, all flowing toward one harbour.",
    "You are KITE-04, the last long-range asset Command trusts. No squad. No extraction if you miss. Five theatres stand between you and the man who built it all.",
    "Every operation below is a link in his chain. Break them one by one — then take the Architect himself.",
  ],
};

export const MAP_ARCS: Record<MapId, { act: string; title: string; text: string }> = {
  marsh: {
    act: "ACT I",
    title: "The Smuggler's Vein",
    text: "Everything the Architect moves passes through Stillwater Marsh first — guns on flatboats, cash in fuel drums. Cut the vein here and his whole network starts to bleed.",
  },
  desert: {
    act: "ACT II",
    title: "The Money Trail",
    text: "The basin villages launder his fortune through arms bazaars and aid convoys. Follow the money, burn the market, and the Sultan who guards it will have to face you himself.",
  },
  snow: {
    act: "ACT III",
    title: "The Silent Frequency",
    text: "High in Frostbite Pass, a radar dome and comms mast coordinate his entire operation. Silence the mountain, and his left hand stops knowing what his right is doing.",
  },
  city: {
    act: "ACT IV",
    title: "The Syndicate Heart",
    text: "Neon District is where his money becomes power — gangs, kill teams, and the Mori syndicate. Tear the heart out and the Architect loses his army.",
  },
  harbor: {
    act: "ACT V",
    title: "The Last Ship",
    text: "Blackwater Harbor. His cargo, his prisoners, his lieutenants — and his ship. Everything ends here, one way or another.",
  },
};

export interface StoryChapter {
  id: string;
  chapter: string;
  location: string;
  title: string;
  image: string;
  color: string;
  mapId?: MapId;
  text: string;
  transmission: string;
  video: string;
  ambience: "wind" | "rain" | "calm";
}

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: "signal",
    video: "https://videos.pexels.com/video-files/6090857/6090857-uhd_3840_2160_25fps.mp4",
    ambience: "calm",
    chapter: "PROLOGUE / THE SIGNAL",
    location: "FIELD ARCHIVE 00 / SIX MONTHS EARLIER",
    title: "It started with a photograph.",
    image: "/images/story-prologue.jpg",
    color: "#e4af72",
    text: "A journalist sent Command one photograph of a shipment with no flag, no manifest and no destination. Follow the shipping marks and five names emerge: a ferryman, a sultan, a ghost, a syndicate boss, and the man they call the Architect.",
    transmission: "Kite, if this transmission reaches you, the chain is real. We lost every team that followed it. You are our last sightline.",
  },
  {
    id: "marsh",
    video: "https://videos.pexels.com/video-files/10894016/10894016-hd_1920_1080_30fps.mp4",
    ambience: "wind",
    chapter: "ACT I / STILLWATER MARSH",
    location: "GRID 07 / THE SMUGGLER'S VEIN",
    title: "Follow the water.",
    image: "/images/map-marsh.jpg",
    color: "#b7c5a5",
    mapId: "marsh",
    text: "The Architect's weapons enter through the lowlands at night. Patrols guard the crossing, and the Heron watches over them from a hidden nest. Break the route, save the witness who photographed it, then take down the man holding the marsh.",
    transmission: "One road in, one boat out. Take out the sentries. I need the journalist alive, Kite. She knows where the money goes next.",
  },
  {
    id: "desert",
    video: "https://videos.pexels.com/video-files/39609954/16883137_3840_2160_50fps.mp4",
    ambience: "wind",
    chapter: "ACT II / THE BASIN",
    location: "GRID 12 / THE MONEY TRAIL",
    title: "The desert buys a war.",
    image: "/images/story-rescue.jpg",
    color: "#eeb778",
    mapId: "desert",
    text: "The photograph leads to a desert bazaar. Under its canvas roofs, the Broker trades stolen guns while aid workers are held as leverage. Their captors have orders to kill at the first alarm. Stop the deal, bring the workers home, and leave the Sultan without an army.",
    transmission: "Those are civilians in the square. Wait for a clean angle. Once the guards hear you, they start the clock.",
  },
  {
    id: "snow",
    video: "https://videos.pexels.com/video-files/35662789/15113244_1920_1080_30fps.mp4",
    ambience: "wind",
    chapter: "ACT III / FROSTBITE PASS",
    location: "GRID 19 / THE SILENT FREQUENCY",
    title: "Silence the mountain.",
    image: "/images/map-snow.jpg",
    color: "#b9d7ec",
    mapId: "snow",
    text: "Above the snowline, the Architect's radar dome coordinates his entire network. Captured scientists keep it running. Their guards have orders to execute them if the alarm sounds. Cut the signal and face Volkov, the marksman who taught this network how to hunt.",
    transmission: "The storm will swallow your footsteps, not a muzzle flash. Make every round count. Volkov is already looking for you.",
  },
  {
    id: "city",
    video: "https://videos.pexels.com/video-files/855432/855432-hd_1840_1034_25fps.mp4",
    ambience: "rain",
    chapter: "ACT IV / NEON DISTRICT",
    location: "GRID 24 / THE SYNDICATE HEART",
    title: "The city never sleeps.",
    image: "/images/map-city.jpg",
    color: "#c2a1e2",
    mapId: "city",
    text: "The stolen money becomes power in Neon District. Kaito Mori's soldiers hold the rooftops while ordinary people move below them. Every shot risks a bystander. A kill team is preparing for your arrival; tear through it and the Architect loses his protection.",
    transmission: "Watch the streets. Those people have no idea a war is being fought above them. Don't make them part of it.",
  },
  {
    id: "harbor",
    video: "https://videos.pexels.com/video-files/13378859/13378859-uhd_4096_2160_30fps.mp4",
    ambience: "wind",
    chapter: "ACT V / BLACKWATER HARBOR",
    location: "GRID 31 / THE LAST SHIP",
    title: "The man behind the war.",
    image: "/images/story-boss.jpg",
    color: "#e79b83",
    mapId: "harbor",
    text: "The crates are stacked. The prisoners are being loaded. At the far end of the docks, the Architect is waiting beside the ship that was supposed to carry him away. He knows your name now. Clear the yard, free the captives, and end what he started.",
    transmission: "Every map on my wall leads to this dock. We have one shot at him, Kite. This time, I'm not asking you to disappear.",
  },
  {
    id: "last-light",
    video: "https://videos.pexels.com/video-files/34659081/14690772_3840_2160_30fps.mp4",
    ambience: "calm",
    chapter: "EPILOGUE / LAST LIGHT",
    location: "A NEW DAWN / YOUR CALL",
    title: "The final sightline is yours.",
    image: "/images/story-finale.jpg",
    color: "#e8c9a5",
    text: "The chain is visible now. It can be broken. Twenty-five operations across five theatres stand between you and the Architect. This is not a story about one perfect shot. It's about the people who get to see morning because you stayed on the line.",
    transmission: "Breathe, Kite. Find the sightline. Bring them home.",
  },
];

export function chapterIndexForMap(mapId: MapId) {
  return Math.max(1, STORY_CHAPTERS.findIndex((chapter) => chapter.mapId === mapId));
}

export const MISSION_STORIES: MissionStory[] = [
  {
    why: "Intel says a weapons patrol crosses the marsh causeway on a fixed schedule. Command needs the route softened before our convoy moves through.",
    intel: ["Only 3 hostiles — a warm-up for your scope", "No civilians in the marsh at this hour"],
    win: "The crossing is clear. Our convoy rolls at dawn — because of you.",
    fail: "The patrol reached the crossing and ambushed our convoy. Try again, quieter this time.",
  },
  {
    why: "A sentry in the watchtower has been radioing our positions to smugglers. The eastern bank must go dark.",
    intel: ["One sentry holds the high tower", "Expect 5 hostiles spread along the bank"],
    win: "The Reedline is silent. Smuggler boats are turning back already.",
    fail: "The sentry got a warning out. The bank stays hot — go again.",
  },
  {
    why: "The Ferryman runs guns across the marsh for the Architect. He crosses on foot during this brief window — the only time he is ever exposed.",
    intel: ["Red beret. He walks the treeline path", "If he reaches the far side, he vanishes for good"],
    win: "The Ferryman will never run another boat. The marsh route is collapsing.",
    fail: "He slipped across the treeline and disappeared into the network.",
  },
  {
    why: "Rebels grabbed a journalist who photographed the Architect's ledgers. She is alive at the ferry dock — for now.",
    intel: ["Orange jumpsuit, kneeling — DO NOT shoot her", "Her captors panic the moment they hear a shot"],
    win: "She's safe — and her photos just named every buyer in the basin.",
    fail: "We lost her. Command is asking what went wrong out there.",
  },
  {
    why: "The Heron has pinned our squad in the reeds with a laser-guided .50 cal. Nobody moves until he stops breathing.",
    intel: ["BOSS: break his red laser lock with any hit", "His visor takes 2.6× damage"],
    win: "The Heron is down. The squad is moving again — Act I is yours.",
    fail: "The Heron still owns the marsh. Study his lock rhythm and go back in.",
  },
  {
    why: "Spotters on the rooftops are calling mortar fire onto our forward base. Every minute they live, our people die.",
    intel: ["Check every rooftop — spotters love height", "2 civilians in the streets. Identify first"],
    win: "The mortars have gone silent. The base stands because you held the line.",
    fail: "The mortars found their mark. The base took heavy damage.",
  },
  {
    why: "The crowded bazaar is a front — hostiles move weapons between stalls while traders work around them.",
    intel: ["4 civilians mixed in. Bright clothes, no weapons", "Hostiles carry rifles and wear military gear"],
    win: "The market is clean. Traders can work without guns in the shadows.",
    fail: "The ambush went wrong and the market scattered. Reset and refocus.",
  },
  {
    why: "The Broker just closed a secret arms deal. If he reaches his convoy, those weapons arm a private army by the next transfer.",
    intel: ["Red beret VIP, moving fast to his convoy", "Very short window — don't hesitate"],
    win: "The deal dies with the Broker. An army that will never exist thanks you.",
    fail: "His convoy pulled out with the weapons. That army is real now.",
  },
  {
    why: "Two aid workers were taken in the square as leverage against our advance. The village is watching what we do next.",
    intel: ["2 hostages kneeling in the open square", "6 captors total — drop them before the alarm"],
    win: "Both aid workers are walking out. The village will remember this.",
    fail: "The square went quiet in the worst way. Do better next time.",
  },
  {
    why: "Al-Qadir, the self-crowned Sultan of the basin, runs every gun deal from behind his own scope. End him and the market dies.",
    intel: ["BOSS: armoured, relentless, never misses twice", "Visor hits stagger him and break his lock"],
    win: "The Sultan is dead. The basin's gun market just collapsed — Act II complete.",
    fail: "Al-Qadir out-shot you this time. He won't give you many chances.",
  },
  {
    why: "The radar dome on Frostbite Pass tracks every aircraft we fly. Its perimeter guards die first — the dome dies next.",
    intel: ["Open mountain slopes — long sightlines, nowhere to hide", "7 hostiles around the dome"],
    win: "Perimeter down. Demolition teams are moving on the dome tonight.",
    fail: "The dome is still watching our skies. The guards held.",
  },
  {
    why: "Enemy engineers are bringing the comms mast back online. If it broadcasts, every operation after this gets harder.",
    intel: ["1 civilian engineer — check your target", "Keep the mast offline at all costs"],
    win: "The mast stays dark. Their mountain is going deaf and blind.",
    fail: "The mast broadcast. Expect sharper enemies from here on.",
  },
  {
    why: "The base commander — the self-styled Glacier King — is running for the helipad. If that helicopter lifts, he takes the codes with him.",
    intel: ["HARD: faster, sharper enemies", "60 seconds. He runs the moment he's spooked"],
    win: "The King never made his flight. His codes are ours now.",
    fail: "The helicopter lifted with the codes aboard. That will cost us later.",
  },
  {
    why: "Two of our scientists are held by the radar dome, forced to repair it. Their guards have orders to execute them at the first alarm.",
    intel: ["HARD rescue — only 14 seconds after detection", "Use the suppressor or strike all at once"],
    win: "Both scientists are out. They say the dome has a weakness — we'll use it.",
    fail: "The guards carried out their orders. The mountain mourns them.",
  },
  {
    why: "Volkov trained half the snipers in this war — including, once, someone a lot like you. He waits in the pass with a thermal scope.",
    intel: ["BOSS: a mirror match against a legend", "He relocates. Watch for his laser"],
    win: "The student has surpassed the master. The pass is yours — Act III complete.",
    fail: "Volkov is still the ghost of the pass. Learn his rhythm.",
  },
  {
    why: "Gang lookouts rule the rooftops of Neon District, and the streets below are full of ordinary people trying to live.",
    intel: ["5 civilians in the streets — rooftops only, mostly", "Rain and neon: beautiful, distracting, deadly"],
    win: "The rooftops are quiet. The streets can breathe tonight.",
    fail: "The night went bad. The gangs still own those rooftops.",
  },
  {
    why: "A syndicate kill team is staging an ambush on the downtown skyline — and Command thinks the target is you.",
    intel: ["HARD: 9 hostiles, entrenched and waiting", "Hit them before they finish setting up"],
    win: "Their ambush died before it was born. They never saw you.",
    fail: "You walked into it. They were ready — be readier.",
  },
  {
    why: "The syndicate boss surfaces for thirty seconds in the open — a vanity appearance his bodyguards begged him to cancel.",
    intel: ["HARD VIP: 55 seconds, heavy escort", "No cover in the open courtyard — shoot fast"],
    win: "Thirty seconds was thirty too many. The syndicate is headless.",
    fail: "He's back underground. Bosses like him don't surface twice.",
  },
  {
    why: "Three hostages. Six captors. One power cut. When the lights die, you have seconds before panic turns to executions.",
    intel: ["HARD rescue — 13 seconds after detection", "Night + thermal is your best friend here"],
    win: "All three walked out of the dark. You're becoming a legend down there.",
    fail: "The dark took them. The city deserved better.",
  },
  {
    why: "Kaito Mori, the syndicate's enforcer, has never lost a gunfight. His private army holds the district. End the dynasty before he vanishes.",
    intel: ["BOSS: rail-scoped rifle, private army, no mercy", "Phases escalate — save medkits for phase 3"],
    win: "The Mori dynasty ends with you. The city is free — Act IV complete.",
    fail: "Mori is still standing. The dynasty endures — for now.",
  },
  {
    why: "The recovery team can't enter the container yard until it's clear. Somewhere in those boxes is evidence that ends this war.",
    intel: ["9 hostiles in a maze of steel", "Watch the container tops — and the lanes between"],
    win: "The yard is ours. What the team found inside changes everything.",
    fail: "The yard is still hot. The evidence stays buried.",
  },
  {
    why: "The Architect's elite guard holds the docks. These are the best soldiers money can buy — and you're better.",
    intel: ["HARD: 10 hostiles, 4 armoured", "Long sightlines, hard targets"],
    win: "His elite broke and ran. Only the inner circle remains.",
    fail: "The elite held the docks. Regroup and hit harder.",
  },
  {
    why: "Trafficked prisoners are being loaded onto his ship as we speak. If that gangway lifts, they're gone forever.",
    intel: ["HARD rescue — 12 seconds after detection", "3 hostages near the waterline"],
    win: "The prisoners are free and the ship sails empty. Almost over now.",
    fail: "The gangway lifted. Don't let the last one get away too.",
  },
  {
    why: "His lieutenant boards through the harbour fog. Kill him and the Architect has no one left to hide behind.",
    intel: ["HARD VIP: 50 seconds, his best guards", "One shot. Make it history."],
    win: "The lieutenant is gone. The Architect stands alone.",
    fail: "He boarded and the ship pulled out. One target left — the big one.",
  },
  {
    why: "Every war you've fought, every shot you've taken — it all led here. The Architect waits on his ship, armoured and unafraid. Prove him wrong.",
    intel: ["FINAL BOSS: 1800 HP, everything he's learned", "For the marsh. For the basin. For all of them."],
    win: "THE ARCHITECT IS DEAD. The network collapses. The war is over — because of one rifle, and the operative holding it.",
    fail: "He's still standing. But now he knows your name — and he's afraid.",
  },
];

export function getMissionStory(index: number): MissionStory {
  return MISSION_STORIES[index] ?? MISSION_STORIES[0];
}
