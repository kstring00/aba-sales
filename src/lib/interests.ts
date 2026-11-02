/**
 * The Interest Explorer. Ideas to try, grouped by the kind of experience a
 * child is drawn to (not by topic, and never "autistic kids love X"). Each
 * idea says what it is, why it might click, and one thing that makes it
 * easier. Plain data: edit freely; the page and the printable read it.
 */
export type InterestId = "calm" | "movement" | "building" | "sorting" | "music" | "water" | "nature" | "art" | "facts" | "machines";
export type HelpId = "quiet" | "alone" | "together" | "short" | "steps" | "outdoors";
export type Where = "Home" | "Out" | "Either";

export const INTERESTS: Array<{ id: InterestId; label: string; hint: string }> = [
  { id: "calm", label: "Calm and quiet", hint: "Settles into slow, focused things" },
  { id: "movement", label: "Moving and climbing", hint: "Jumps, spins, runs, climbs" },
  { id: "building", label: "Building and making", hint: "Stacks, connects, creates" },
  { id: "sorting", label: "Sorting and collecting", hint: "Lines up, groups, collects" },
  { id: "music", label: "Music and sound", hint: "Songs on repeat, rhythm, sounds" },
  { id: "water", label: "Water and textures", hint: "Splashing, sand, squishy things" },
  { id: "nature", label: "Nature and animals", hint: "Bugs, dogs, plants, outside" },
  { id: "art", label: "Drawing and color", hint: "Markers, paint, patterns" },
  { id: "facts", label: "Facts and reading", hint: "Knows everything about one topic" },
  { id: "machines", label: "How things work", hint: "Vehicles, gears, taking things apart" },
];

export const HELPS: Array<{ id: HelpId; label: string }> = [
  { id: "quiet", label: "Quiet places" },
  { id: "alone", label: "Doing it on their own" },
  { id: "together", label: "With one other person" },
  { id: "short", label: "Short sessions" },
  { id: "steps", label: "Clear steps" },
  { id: "outdoors", label: "Being outdoors" },
];

export type Idea = { id: string; name: string; interests: InterestId[]; helps: HelpId[]; where: Where; cost: "Free" | "$" | "$$"; why: string; easier: string };

export const IDEAS: Idea[] = [
  { id: "puzzles", name: "Jigsaw and shape puzzles", interests: ["calm", "sorting"], helps: ["quiet", "alone", "steps"], where: "Home", cost: "$", why: "A clear goal, a clear finish, and it can be done in silence.", easier: "Start with fewer, bigger pieces and sort edges first." },
  { id: "coloring", name: "Coloring and sticker books", interests: ["calm", "art"], helps: ["quiet", "alone", "short"], where: "Either", cost: "$", why: "Low pressure and easy to stop and start.", easier: "Pick a book about a favorite topic." },
  { id: "audiobooks", name: "Audiobooks and story podcasts", interests: ["calm", "facts"], helps: ["quiet", "alone"], where: "Either", cost: "Free", why: "Stories without having to look at anyone or anything.", easier: "Free through the public library's app." },
  { id: "kinetic-sand", name: "Kinetic sand or play dough", interests: ["calm", "water", "building"], helps: ["alone", "short"], where: "Home", cost: "$", why: "Hands busy, mind calm, nothing has to be finished.", easier: "A tray with edges keeps the mess in one place." },
  { id: "origami", name: "Simple origami and paper folding", interests: ["calm", "building", "art"], helps: ["quiet", "steps"], where: "Home", cost: "Free", why: "Step-by-step, repeatable, and the result can be kept.", easier: "Follow a video you can pause after each fold." },
  { id: "swimming", name: "Swimming and water play", interests: ["movement", "water"], helps: ["outdoors"], where: "Out", cost: "$", why: "Steady pressure from the water, and lots of movement.", easier: "Go at opening time when pools are quietest." },
  { id: "trampoline", name: "Trampoline time", interests: ["movement"], helps: ["short"], where: "Either", cost: "$", why: "Big movement in a small, predictable space.", easier: "Look for sensory-friendly hours at trampoline parks." },
  { id: "bike", name: "Bike, scooter or balance bike rides", interests: ["movement", "nature"], helps: ["outdoors", "together"], where: "Out", cost: "$$", why: "Movement with a route that can be the same every time.", easier: "Ride the same loop until it feels familiar." },
  { id: "playground", name: "Climbing at a quiet playground", interests: ["movement", "nature"], helps: ["outdoors", "short"], where: "Out", cost: "Free", why: "Climbing, swinging and spinning on their own terms.", easier: "Weekday mornings are usually calmest." },
  { id: "dance", name: "Dancing at home", interests: ["movement", "music"], helps: ["alone", "short"], where: "Home", cost: "Free", why: "Movement plus favorite songs, with nobody watching.", easier: "Make a short playlist of songs they already love." },
  { id: "blocks", name: "Blocks and building sets", interests: ["building", "machines"], helps: ["alone", "steps"], where: "Home", cost: "$$", why: "Builds can follow instructions or be completely their own.", easier: "Keep pieces sorted by color or size in clear bins." },
  { id: "marble-run", name: "Marble runs and ramps", interests: ["building", "machines"], helps: ["alone", "together"], where: "Home", cost: "$", why: "Cause and effect you can watch again and again.", easier: "Cardboard tubes and tape work as well as a kit." },
  { id: "cardboard", name: "Cardboard box builds", interests: ["building", "art"], helps: ["together"], where: "Home", cost: "Free", why: "A box can become a car, a house or a robot.", easier: "Save delivery boxes and keep a tape-and-markers bin." },
  { id: "cooking", name: "Simple cooking and baking", interests: ["building", "facts"], helps: ["steps", "together"], where: "Home", cost: "$", why: "A recipe is a list of steps with a reward at the end.", easier: "Use a picture recipe and pre-measure the ingredients." },
  { id: "rocks", name: "Collecting rocks, shells or leaves", interests: ["sorting", "nature"], helps: ["outdoors", "alone"], where: "Out", cost: "Free", why: "Finding, sorting and naming, all in one.", easier: "An egg carton makes a ready-made sorting box." },
  { id: "cards", name: "Trading cards or sticker collections", interests: ["sorting", "facts"], helps: ["alone"], where: "Home", cost: "$", why: "Sets to complete, facts to learn, things to organize.", easier: "A binder with sleeves keeps the collection in order." },
  { id: "buttons", name: "Sorting buttons, beads or blocks", interests: ["sorting", "calm"], helps: ["quiet", "alone", "short"], where: "Home", cost: "$", why: "Grouping by color, size or shape is the whole activity.", easier: "A muffin tin makes a good sorting tray." },
  { id: "keyboard", name: "Keyboard or piano apps", interests: ["music", "machines"], helps: ["alone", "steps"], where: "Home", cost: "Free", why: "Patterns, repetition and sound they control.", easier: "Headphones keep it quiet for everyone." },
  { id: "drums", name: "Drumming on buckets or pots", interests: ["music", "movement"], helps: ["short", "together"], where: "Home", cost: "Free", why: "Rhythm and big movement, with a lot of noise on their terms.", easier: "Take turns copying a short beat." },
  { id: "playlists", name: "Making playlists", interests: ["music", "sorting"], helps: ["alone"], where: "Home", cost: "Free", why: "Choosing, ordering and replaying favorites.", easier: "Let them name each playlist." },
  { id: "water-table", name: "Water table or sink play", interests: ["water", "machines"], helps: ["alone", "short"], where: "Home", cost: "$", why: "Pouring, scooping and watching water move.", easier: "Cups, funnels and a towel underneath are enough." },
  { id: "slime", name: "Slime, foam and texture bins", interests: ["water", "calm"], helps: ["alone"], where: "Home", cost: "$", why: "Lots of texture to explore with the hands.", easier: "Offer a spoon or gloves for kids who don't like messy hands." },
  { id: "garden", name: "Gardening in a pot", interests: ["nature", "water"], helps: ["outdoors", "steps"], where: "Home", cost: "$", why: "Daily watering is a routine with something to show for it.", easier: "Fast growers like beans or sunflowers show change quickly." },
  { id: "birds", name: "Bird or bug watching", interests: ["nature", "facts"], helps: ["quiet", "outdoors"], where: "Either", cost: "Free", why: "Quiet watching, naming and counting.", easier: "A simple picture guide to tick off what they spot." },
  { id: "animals", name: "Visiting animals at quiet times", interests: ["nature"], helps: ["quiet", "outdoors"], where: "Out", cost: "$", why: "Animals don't need conversation.", easier: "Go at opening time and ask about sensory bags." },
  { id: "drawing", name: "Drawing a favorite topic", interests: ["art", "facts"], helps: ["alone", "quiet"], where: "Either", cost: "Free", why: "Their interest, on paper, any way they like.", easier: "Keep a sketchbook just for that one topic." },
  { id: "painting", name: "Painting and color mixing", interests: ["art", "water"], helps: ["alone"], where: "Home", cost: "$", why: "Color, texture and watching paint change.", easier: "Paint in the bath or on a big sheet of paper outside." },
  { id: "patterns", name: "Pattern blocks and mosaics", interests: ["art", "sorting", "calm"], helps: ["quiet", "steps"], where: "Home", cost: "$", why: "Repeating shapes and colors into something bigger.", easier: "Start by copying a picture card, then free build." },
  { id: "topic-books", name: "Books about one favorite topic", interests: ["facts", "calm"], helps: ["quiet", "alone"], where: "Either", cost: "Free", why: "Going deep on one thing is the fun part.", easier: "Ask a librarian for everything on that topic." },
  { id: "maps", name: "Maps, flags and globes", interests: ["facts", "sorting"], helps: ["alone"], where: "Home", cost: "$", why: "Names, shapes and places to learn and organize.", easier: "Print a map of your own neighborhood to start." },
  { id: "make-a-book", name: "Making a book about their interest", interests: ["facts", "art"], helps: ["together", "steps"], where: "Home", cost: "Free", why: "They become the expert, and you get to learn from them.", easier: "One page a day, stapled together at the end." },
  { id: "museum", name: "Science or children's museum visits", interests: ["facts", "machines"], helps: ["short"], where: "Out", cost: "$$", why: "Hands-on exhibits about how things work.", easier: "Look for sensory-friendly mornings, and plan to leave early if needed." },
  { id: "take-apart", name: "Taking apart old electronics", interests: ["machines", "building"], helps: ["together", "steps"], where: "Home", cost: "Free", why: "Seeing what's inside is the whole point.", easier: "Unplugged, batteries out, with an adult and a small screwdriver." },
  { id: "science-kit", name: "Simple science kits", interests: ["machines", "facts", "water"], helps: ["steps", "together"], where: "Home", cost: "$", why: "Instructions, a result, and a reason why.", easier: "Do one experiment per session, not the whole kit." },
  { id: "trains", name: "Watching trains, planes or construction", interests: ["machines", "nature"], helps: ["outdoors", "quiet"], where: "Out", cost: "Free", why: "Big machines moving in predictable ways.", easier: "Find a spot with a view and bring headphones for the loud moments." },
  { id: "coding", name: "Beginner coding games", interests: ["machines", "facts"], helps: ["alone", "steps"], where: "Home", cost: "Free", why: "Clear rules, instant feedback, and building something that works.", easier: "Block-based apps made for kids are a gentle start." },
];

export function matchIdeas(interests: InterestId[], helps: HelpId[]): Idea[] {
  const pool = interests.length ? IDEAS.filter((i) => i.interests.some((x) => interests.includes(x))) : IDEAS;
  const score = (i: Idea) => i.interests.filter((x) => interests.includes(x)).length * 2 + i.helps.filter((h) => helps.includes(h)).length;
  return [...pool].sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name));
}
