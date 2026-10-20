import { CategoryId, CategoryMeta, GroupId, GroupMeta } from './types';

export const GROUPS: GroupMeta[] = [
  { id: 'chips', label: 'Treats', blurb: 'coffee, sweets, snacks', color: '#FFD23F' },
  { id: 'meat', label: 'Food', blurb: 'meals and groceries', color: '#B56D36' },
  { id: 'garlic', label: 'Going out', blurb: 'drinks, nights, rides', color: '#FFF6E6' },
  { id: 'chilli', label: 'Shopping', blurb: 'things you want', color: '#EE3B2B' },
  { id: 'bbq', label: 'Basics', blurb: 'bills, health, uni, travel', color: '#8A4B24' },
];

type Row = [id: string, label: string, group: GroupId, icon: string, roastAs?: string, noun?: string, headline?: string];

// The 19 ids the roast banks are written for.
const BASE_IDS = [
  'coffee', 'matcha', 'bubbletea', 'snacks', 'fastfood', 'delivery', 'dineout', 'groceries', 'drinks', 'nightout',
  'rideshare', 'clothes', 'tech', 'beauty', 'random', 'subscription', 'uni', 'health', 'other',
] as const;

const ROWS: Row[] = [
  // ---- chips group (Treats)
  ['coffee', 'Coffee', 'chips', 'coffee', undefined, 'coffees', 'coffee'],
  ['matcha', 'Matcha', 'chips', 'matcha', undefined, 'matchas', 'matcha'],
  ['bubbletea', 'Bubble tea', 'chips', 'boba', undefined, 'bubble teas', 'bubble tea'],
  ['snacks', 'Snacks', 'chips', 'chips', undefined, 'snacks', 'snacks'],
  ['icecream', 'Ice cream', 'chips', 'icecream', 'snacks'],
  ['dessert', 'Dessert', 'chips', 'cake', 'snacks'],
  ['bakery', 'Bakery', 'chips', 'bread', 'snacks'],
  ['softdrink', 'Juice & soft drink', 'chips', 'juice', 'snacks'],
  // ---- meat group (Food)
  ['fastfood', 'Fast food', 'meat', 'burger', undefined, 'fast food runs', 'fast food'],
  ['takeaway', 'HSP', 'meat', 'hsp', 'fastfood', 'HSPs', 'HSPs'],
  ['pizza', 'Pizza', 'meat', 'pizza', 'fastfood'],
  ['kebab', 'Kebab', 'meat', 'kebab', 'fastfood'],
  ['chicken', 'Chicken', 'meat', 'chicken', 'fastfood'],
  ['delivery', 'Delivery', 'meat', 'delivery', undefined, 'delivery orders', 'delivery'],
  ['dineout', 'Eating out', 'meat', 'plate', undefined, 'dinners out', 'dinners out'],
  ['sushi', 'Sushi', 'meat', 'sushi', 'dineout'],
  ['noodles', 'Noodles', 'meat', 'noodles', 'dineout'],
  ['dumplings', 'Dumplings', 'meat', 'dumpling', 'dineout'],
  ['breakfast', 'Brunch', 'meat', 'eggs', 'dineout'],
  ['salad', 'Salad & bowls', 'meat', 'salad', 'dineout'],
  ['groceries', 'Groceries', 'meat', 'groceries', undefined, 'grocery shops', 'groceries'],
  // ---- garlic group (Going out)
  ['drinks', 'Drinks', 'garlic', 'cocktail', undefined, 'rounds of drinks', 'drinks'],
  ['pub', 'Pub & beer', 'garlic', 'beer', 'drinks'],
  ['wine', 'Wine', 'garlic', 'wine', 'drinks'],
  ['nightout', 'Night out', 'garlic', 'disco', undefined, 'nights out', 'nights out'],
  ['rideshare', 'Rides', 'garlic', 'car', undefined, 'rides', 'rides'],
  ['concert', 'Gigs', 'garlic', 'mic', 'nightout'],
  ['cinema', 'Cinema', 'garlic', 'clapper', 'nightout'],
  ['events', 'Tickets & events', 'garlic', 'ticket', 'nightout'],
  ['party', 'Parties', 'garlic', 'balloon', 'nightout'],
  ['date', 'Date night', 'garlic', 'candle', 'dineout'],
  ['arcade', 'Games out', 'garlic', 'dice', 'random'],
  // ---- chilli group (Shopping)
  ['clothes', 'Clothes', 'chilli', 'tee', undefined, 'clothes hauls', 'clothes'],
  ['shoes', 'Shoes', 'chilli', 'sneaker', 'clothes'],
  ['bags', 'Bags', 'chilli', 'bag', 'clothes'],
  ['jewelry', 'Jewellery', 'chilli', 'ring', 'clothes'],
  ['tech', 'Tech', 'chilli', 'phone', undefined, 'gadgets', 'gadgets'],
  ['headphones', 'Audio', 'chilli', 'headphones', 'tech'],
  ['gaming', 'Gaming', 'chilli', 'gamepad', 'tech'],
  ['photo', 'Camera gear', 'chilli', 'camera', 'tech'],
  ['beauty', 'Beauty', 'chilli', 'lipstick', undefined, 'beauty buys', 'beauty'],
  ['skincare', 'Skincare', 'chilli', 'skincare', 'beauty'],
  ['haircut', 'Haircut', 'chilli', 'scissors', 'beauty'],
  ['gifts', 'Gifts', 'chilli', 'gift', 'random'],
  ['hobbies', 'Hobbies', 'chilli', 'palette', 'random'],
  ['homewares', 'Homewares', 'chilli', 'lamp', 'random'],
  ['furniture', 'Furniture', 'chilli', 'chair', 'random'],
  ['plants', 'Plants', 'chilli', 'plant', 'random'],
  ['pets', 'Pets', 'chilli', 'paw', 'other'],
  ['online', 'Online orders', 'chilli', 'parcel', 'random'],
  ['random', 'Random', 'chilli', 'questionbox', undefined, 'random buys', 'random stuff'],
  // ---- bbq group (Basics)
  ['rent', 'Rent', 'bbq', 'house', 'other'],
  ['electricity', 'Electricity', 'bbq', 'bolt', 'other'],
  ['water', 'Water', 'bbq', 'drop', 'other'],
  ['internet', 'Internet', 'bbq', 'wifi', 'subscription'],
  ['phone', 'Phone plan', 'bbq', 'signal', 'subscription'],
  ['subscription', 'Subs', 'bbq', 'loop', undefined, 'subscriptions', 'subscriptions'],
  ['streaming', 'Streaming', 'bbq', 'tv', 'subscription'],
  ['music', 'Music', 'bbq', 'music', 'subscription'],
  ['insurance', 'Insurance', 'bbq', 'shield', 'other'],
  ['fees', 'Fees & fines', 'bbq', 'receipt', 'other'],
  ['bank', 'Bank & tax', 'bbq', 'bank', 'other'],
  ['transit', 'Public transport', 'bbq', 'tram', 'other'],
  ['fuel', 'Fuel', 'bbq', 'fuel', 'other'],
  ['parking', 'Parking', 'bbq', 'parking', 'other'],
  ['carcare', 'Car care', 'bbq', 'wrench', 'other'],
  ['flights', 'Flights', 'bbq', 'plane', 'other'],
  ['hotel', 'Stays', 'bbq', 'bed', 'other'],
  ['holiday', 'Holiday', 'bbq', 'palm', 'other'],
  ['health', 'Health', 'bbq', 'cross', undefined, 'health buys', 'health'],
  ['pharmacy', 'Pharmacy', 'bbq', 'pill', 'health'],
  ['gym', 'Gym', 'bbq', 'dumbbell', 'health'],
  ['sport', 'Sport', 'bbq', 'ball', 'health'],
  ['dentist', 'Dentist', 'bbq', 'tooth', 'health'],
  ['wellness', 'Wellness', 'bbq', 'lotus', 'health'],
  ['optical', 'Glasses', 'bbq', 'glasses', 'health'],
  ['uni', 'Uni', 'bbq', 'gradcap', undefined, 'uni buys', 'uni stuff'],
  ['textbooks', 'Books', 'bbq', 'book', 'uni'],
  ['course', 'Courses', 'bbq', 'certificate', 'uni'],
  ['printing', 'Printing', 'bbq', 'printer', 'uni'],
  ['software', 'Software', 'bbq', 'code', 'subscription'],
  ['work', 'Work stuff', 'bbq', 'briefcase', 'other'],
  ['laundry', 'Laundry', 'bbq', 'washer', 'other'],
  ['cleaning', 'Cleaning', 'bbq', 'spray', 'other'],
  ['repairs', 'Repairs', 'bbq', 'hammer', 'other'],
  ['moving', 'Moving', 'bbq', 'box', 'other'],
  ['donation', 'Giving', 'bbq', 'handheart', 'other'],
  ['other', 'Other', 'bbq', 'star', undefined, 'buys', 'stuff'],
];

export const BUILTIN_CATEGORIES: CategoryMeta[] = ROWS.map(([id, label, group, icon, roastAs, noun, headline]) => ({
  id,
  label,
  group,
  icon,
  roastAs: roastAs ?? id,
  noun: noun ?? `${label.toLowerCase()} buys`,
  headline: headline ?? label.toLowerCase(),
  builtin: true,
}));

/** Kept for the old call sites and tests. */
export const CATEGORIES = BUILTIN_CATEGORIES;

const BASE_SET = new Set<string>(BASE_IDS);
const builtinById = new Map<CategoryId, CategoryMeta>(BUILTIN_CATEGORIES.map((c) => [c.id, c]));

let custom: CategoryMeta[] = [];
let customById = new Map<CategoryId, CategoryMeta>();

/** The store calls this whenever the user's own categories change. */
export function registerCustomCategories(list: CategoryMeta[]): void {
  custom = list;
  customById = new Map(list.map((c) => [c.id, c]));
}

export function customCategories(): CategoryMeta[] {
  return custom;
}

/** Build the meta for a category the user made up. */
export function makeCustomCategory(id: string, label: string, group: GroupId, icon: string): CategoryMeta {
  const clean = label.trim() || 'Custom';
  const defaultRoast: Record<GroupId, string> = { chips: 'snacks', meat: 'dineout', garlic: 'drinks', chilli: 'random', bbq: 'other' };
  return {
    id,
    label: clean,
    group,
    icon,
    roastAs: defaultRoast[group],
    noun: `${clean.toLowerCase()} buys`,
    headline: clean.toLowerCase(),
  };
}

export function categoryMeta(id: CategoryId): CategoryMeta {
  return customById.get(id) ?? builtinById.get(id) ?? (builtinById.get('other') as CategoryMeta);
}

export function isBuiltinCategory(id: CategoryId): boolean {
  return builtinById.has(id);
}

/** The roast set to use for a category. Always one of the 19 base ids. */
export function roastSetFor(id: CategoryId): string {
  const meta = categoryMeta(id);
  return BASE_SET.has(meta.roastAs) ? meta.roastAs : 'other';
}

export function groupOf(id: CategoryId): GroupId {
  return categoryMeta(id).group;
}

export function groupMeta(id: GroupId): GroupMeta {
  return GROUPS.find((g) => g.id === id) as GroupMeta;
}

export function allCategories(hidden: string[] = []): CategoryMeta[] {
  return [...BUILTIN_CATEGORIES, ...custom].filter((c) => !hidden.includes(c.id));
}

export function categoriesIn(group: GroupId, hidden: string[] = []): CategoryMeta[] {
  return allCategories(hidden).filter((c) => c.group === group);
}

/** Merchant text from an Apple Pay shortcut, mapped to a category. null = no idea. */
const MERCHANT_RULES: [RegExp, CategoryId][] = [
  [/uber\s*eats|doordash|menulog|deliveroo/i, 'delivery'],
  [/mcdonald|maccas|hungry\s*jack|kfc|subway|guzman|domino|nando|oporto|zambrero|grill'?d|red\s*rooster/i, 'fastfood'],
  [/pizza/i, 'pizza'],
  [/kebab|snack\s*pack|halal/i, 'kebab'],
  [/matcha/i, 'matcha'],
  [/gong\s*cha|chatime|the\s*alley|sharetea|tiger\s*sugar|bubble|boba|yi\s*fang/i, 'bubbletea'],
  [/gelato|ice\s*cream|messina|N2/i, 'icecream'],
  [/bakery|baker|patisserie|bread/i, 'bakery'],
  [/starbucks|gloria\s*jean|coffee\s*club|brunetti|market\s*lane|industry\s*beans|cafe|café|coffee|espresso|roaster/i, 'coffee'],
  [/coles|woolworths|woolies|aldi|iga\b|harris\s*farm|queen\s*vic|market/i, 'groceries'],
  [/uber(?!\s*eats)|didi|ola\b|13\s*cab|taxi/i, 'rideshare'],
  [/myki|ptv|metro\s*trains|yarra\s*trams/i, 'transit'],
  [/bp\b|shell|ampol|caltex|7-?eleven|united\s*petrol|petrol|servo/i, 'fuel'],
  [/spotify|apple\s*music/i, 'music'],
  [/netflix|disney|youtube|prime\s*video|stan\b|binge|hbo|paramount/i, 'streaming'],
  [/icloud|apple\.com\/bill|adobe|chatgpt|openai|anthropic|patreon|github/i, 'subscription'],
  [/uniqlo|zara|h&m|cotton\s*on|asos|glassons|the\s*iconic|culture\s*kings|supre|factorie|kmart|target/i, 'clothes'],
  [/nike|adidas|foot\s*locker|platypus|hype\s*dc|new\s*balance/i, 'shoes'],
  [/jb\s*hi-?fi|apple\s*store|officeworks|harvey\s*norman|kogan|dell|samsung/i, 'tech'],
  [/bunnings|ikea|freedom\s*furniture|fantastic/i, 'homewares'],
  [/steam|playstation|nintendo|xbox|epic\s*games|eb\s*games/i, 'gaming'],
  [/sephora|mecca|priceline|chemist\s*warehouse|oz\s*hair|typo|kiko/i, 'beauty'],
  [/barber|hair\s*salon|haircut/i, 'haircut'],
  [/dan\s*murphy|bws|liquorland|brewery|tavern|pub\b/i, 'pub'],
  [/\bbar\b|hotel\s*bar|cocktail/i, 'drinks'],
  [/moshtix|oztix|ticketek|eventbrite|ticketmaster/i, 'events'],
  [/hoyts|village\s*cinema|event\s*cinema|palace\s*cinema|imax/i, 'cinema'],
  [/club|nightclub/i, 'nightout'],
  [/co-?op\s*bookshop|university|unimelb|monash|rmit|uni\s*shop/i, 'uni'],
  [/textbook|dymocks|readings|booktopia/i, 'textbooks'],
  [/pharmacy|medical|physio|doctor|clinic/i, 'health'],
  [/dental|dentist/i, 'dentist'],
  [/gym|anytime|f45|pilates|fitness|jetts|snap\s*fitness/i, 'gym'],
  [/qantas|jetstar|virgin\s*australia|airline|flight|skyscanner/i, 'flights'],
  [/airbnb|booking\.com|hotel|hostel|motel/i, 'hotel'],
  [/restaurant|kitchen|diner|bistro|izakaya|burger/i, 'dineout'],
  [/sushi/i, 'sushi'],
  [/ramen|noodle|pho\b/i, 'noodles'],
  [/dumpling/i, 'dumplings'],
  [/telstra|optus|vodafone|boost|amaysim|belong|aussie\s*broadband/i, 'phone'],
  [/agl|origin\s*energy|energy\s*australia|electricity/i, 'electricity'],
  [/rent|real\s*estate|ray\s*white|domain/i, 'rent'],
  [/snack/i, 'snacks'],
];

export function categorizeMerchant(merchant: string | undefined | null): CategoryId | null {
  if (!merchant) return null;
  for (const [re, cat] of MERCHANT_RULES) if (re.test(merchant)) return cat;
  return null;
}
