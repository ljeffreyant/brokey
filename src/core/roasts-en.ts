import type { CategoryId, RoastLevel } from './types';

export type Bank = Record<RoastLevel, string[]>;

// ---------------------------------------------------------------------------
// Category banks. Mild = cheeky friend. Medium = group chat. Unhinged = 3am group chat.
// No body jabs in here, those live in BODY below and are opt-in.
// ---------------------------------------------------------------------------
export const BASE: Record<CategoryId, Bank> = {
  coffee: {
    mild: ['Coffee. Fair enough, you are a student and it is a survival tool.', 'A coffee, that is {units} of the dream. Easy does it.', 'Coffee logged. The barista knows your name now, is that a good sign?'],
    medium: ['Coffee again. The caffeine is not the thing you are addicted to, it is the cup.', '{amt} for hot bean water. Bold.', 'You could own a kettle. Just saying.'],
    unhinged: ['{amt} for a coffee. You are funding some guy\'s Hawthorn terrace and you rent a room.', 'Hot bean water, {amt}. Instant coffee exists and is free at uni, you absolute sook.', 'Another coffee. Your personality is 40% oat milk and 60% debt.'],
  },
  matcha: {
    mild: ['Matcha! Very green, very {amt}.', 'Matcha logged. Hope it was a good one.', 'A little matcha treat. Little being the keyword.'],
    medium: ['Matcha. So performative.', '{amt} to hold a green drink for a photo. Iconic, expensive.', 'You do not even like matcha, you like the idea of liking matcha.'],
    unhinged: ['Matcha. {amt}. It tastes like a lawn and you know it.', 'You paid {amt} for grass water so strangers think you are calm. You are not calm, you are broke.', 'Matcha girl era costing you {units}. Is the lawn worth it?'],
  },
  bubbletea: {
    mild: ['Bubble tea! Sweet, and not exactly cheap.', 'Boba logged. The pearls were worth it, probably.', 'A bubble tea moment. Treat acknowledged.'],
    medium: ['{amt} for sugar and tapioca. Brave.', 'Bubble tea again, huh. Chewing your savings, one pearl at a time.', 'Less ice, 50% sugar, 100% your rent money.'],
    unhinged: ['Chewing your own savings through a fat straw. {amt}.', 'Boba is just expensive jelly with a straw and you have a problem.', 'Tapioca balls for {amt}. They are not even that good, you just have no impulse control.'],
  },
  snacks: {
    mild: ['A snack. Small, but they add up.', 'Snack logged. Hunger is real.', 'Little snack, little receipt. Keep an eye on those.'],
    medium: ['It is never just a snack. It is {n} snacks this week.', 'Snacks are the silent budget killer. Remember that.', '{amt} on the servo shelf. Nothing there is worth it.'],
    unhinged: ['{amt} at the servo for a bag of air with six chips in it.', 'You are being pickpocketed by a chip packet.', 'Snacks. Yes, your wallet is bleeding from a thousand small cuts, well done.'],
  },
  fastfood: {
    mild: ['Fast food run logged. It was probably good.', 'Fast food. Happens to the best of us.', 'A little drive-thru moment. Water next time maybe.'],
    medium: ['Fast food. Again? You know there is food at home.', '{amt} on a meal you will forget by Thursday.', 'The drive-thru thanks you for your donation.'],
    unhinged: ['{amt} on fast food. You know what a supermarket chook costs, right?', 'Fast food, because cooking is apparently too hard. Beautiful.', 'The fast food app has more of your money than your savings account does.'],
  },
  delivery: {
    mild: ['Delivery logged. The fee was the real meal.', 'Delivery! Convenient, though pricey.', 'Someone brought you food. Lovely. Check the fees next time.'],
    medium: ['{amt} for food that arrived cold with a service fee. Bold move.', 'Delivery fees, service fees, small order fees. You paid for the privilege of doing nothing.', 'Your front door is basically a vending machine at this point.'],
    unhinged: ['You paid a stranger {amt} to drive 4km because you could not walk to the fridge.', 'Delivery fee, service fee, small order fee, tip. Lazy tax, collected.', 'Getting groceries delivered to a 2 minute walk away. Prestige laziness.'],
  },
  dineout: {
    mild: ['Dinner out. Hope the company was worth it.', 'Eating out logged. Nice, just remember the budget.', 'Restaurant night! Enjoy it, then eat noodles tomorrow.'],
    medium: ['{amt} for dinner out. A supermarket chook is $12, just saying.', 'Eating out again. Your kitchen is feeling neglected.', 'Booking the table for 6:15 like you are 80. Respect, but also the bill.'],
    unhinged: ['{units} for a plate of food you could not photograph without lighting. Next time, boil pasta.', 'You split the bill and still lost. That is a skill.', 'Fine dining on student money. Your future self is already crying into a two-minute noodle.'],
  },
  groceries: {
    mild: ['Groceries! Cooking at home is the way.', 'Look at you, adult. Nice shop.', 'Groceries logged. This is the good kind of spending.'],
    medium: ['Groceries. Huge. Cooking is cheaper than delivery apps, who knew.', 'A real shop. Proud of you, quietly.', 'Fridge: full. Wallet: less full. Still a W.'],
    unhinged: ['Groceries. Finally, a purchase that does not make me want to cry. Keep going.', 'An actual adult shop. I am emotional.', 'You bought real food. Go buy a chook. Gold star.'],
  },
  drinks: {
    mild: ['Drinks logged. Hope it was a good night.', 'A few drinks. Easy on the tabs.', 'Drinks night! Remember water between rounds.'],
    medium: ['{amt} on drinks. The hangover is free, at least.', 'Round of drinks. You bought a round? On your income?', 'Pre-drinks are cheaper, but you knew that.'],
    unhinged: ['{amt} to get a bit sad at a bar. You could do that for free at home.', 'You bought a round. A ROUND. Be so serious right now.', 'Two jugs and you called it a Tuesday. Your bank account will remember.'],
  },
  nightout: {
    mild: ['Night out logged. Hope it was a good one.', 'Big night! The memories are priceless, the receipt is not.', 'Night out. You earned it, maybe.'],
    medium: ['Cover, drinks, a ride home, kebab. The classic {amt}.', 'Nights out are just expensive ways to lose your phone.', 'The kebab at 2am was {units} of regret, probably.'],
    unhinged: ['{amt} to dance badly in the dark and lose your jacket. Worth it? Doubt it.', 'You spent {units} so you could cry in the back of a ride at 3am. Growth.', 'Your liver and your wallet are in a hostage situation.'],
  },
  rideshare: {
    mild: ['Ride logged. Convenient, if pricey.', 'A ride. Sometimes you have to.', 'Rides add up, keep an eye on them.'],
    medium: ['{amt} for a ride you could have taken the tram for.', 'Surge pricing: because you cannot wait 6 minutes.', 'There is a tram. It goes there. It costs $2.'],
    unhinged: ['{amt} on a ride. The tram was literally outside.', 'You paid surge pricing to avoid being 4 minutes late. You were late anyway.', 'A ride? You have legs. You also have a tram pass. Use them.'],
  },
  clothes: {
    mild: ['New clothes! Hope they fit the budget as well as you.', 'Clothes logged. Hope it was a good find.', 'A little shopping. Just do not make it a habit.'],
    medium: ['{amt} on clothes. You have a wardrobe, right?', 'The cart sat there for a week and then you caved. Classic.', 'You do not need another black hoodie. You own four.'],
    unhinged: ['{amt} on a top that you will wear once and then it becomes a pyjama.', 'New fit! Paid for with next week\'s food money.', 'You bought clothes you will wear twice. It is called fast fashion, and it is making you broke.'],
  },
  tech: {
    mild: ['Tech purchase logged. Hopefully a useful one.', 'A gadget! Check it is actually needed.', 'Tech buy. Do not forget the warranty.'],
    medium: ['{amt} on a gadget you will use for two weeks. Spicy.', 'Wired earphones? So performative.', 'Another gadget for the drawer of dead gadgets.'],
    unhinged: ['{units} on a gadget that will sit in a drawer by October. Beautiful.', 'You bought wired earphones in 2026. That is a personality, and an expensive one.', 'It has a lot of features you will never use. Just like your gym membership.'],
  },
  beauty: {
    mild: ['Beauty buy logged. Self care counts.', 'Skincare! Hope it works.', 'Looking good, wallet looking tired.'],
    medium: ['{amt} on skincare. Your face is fine, honestly.', 'Another serum. The 12-step routine is costing you a lot.', 'The beauty counter knows your name. That is not a flex.'],
    unhinged: ['{amt} on a serum with a hat on it. You are being fleeced by a bottle.', 'You bought it because a stranger online said so. She was sponsored.', 'Your face costs more than your rent, and it looks the same.'],
  },
  random: {
    mild: ['Random buy logged. Sometimes it happens.', 'A little impulse. We all do it.', 'Random purchase, noted.'],
    medium: ['What even was that? Be honest, you do not know either.', '{amt} on something you will not remember buying.', 'The "I will use it" energy is strong here.'],
    unhinged: ['{amt} on random crap. This is exactly how you go broke.', 'Impulse buy detected. Mate, what are you doing.', 'You bought it because it was there. That is not a reason, that is a symptom.'],
  },
  subscription: {
    mild: ['Subscriptions logged. Check what you actually use.', 'A sub. Make sure it earns its place.', 'Subscription noted. Cancel the ones you forgot.'],
    medium: ['Another subscription. Have you opened it this month?', 'You are paying for six things and using two.', 'Subs are the silent killer. Audit time.'],
    unhinged: ['You are paying monthly for things you forgot you had. Congratulations, you are a landlord for apps.', '{amt} a month to watch one show once. Impressive commitment to waste.', 'Cancel something today. Seriously. It takes 40 seconds.'],
  },
  uni: {
    mild: ['Uni expense logged. Education is pricey.', 'Uni stuff. Hopefully useful.', 'Textbook money. Check for a second-hand copy next time.'],
    medium: ['{amt} for a textbook you will open twice. Welcome to uni.', 'Uni costs, ugh. At least it is a real expense.', 'Had you checked the library? Probably free there.'],
    unhinged: ['{amt} on a textbook that is a PDF online for free. Pirate it, you are a student.', 'Uni is a scam and you are paying for it with food money.', 'The prof wrote that book and is now richer. You are poorer. That is the system.'],
  },
  health: {
    mild: ['Health spending logged. Good investment.', 'Taking care of yourself. Nice.', 'Health costs are fair. Well done for looking after yourself.'],
    medium: ['Health stuff is allowed. Fine. I will not roast it.', 'Okay, this one is a good one. Carry on.', 'A fair spend. Nothing to see here.'],
    unhinged: ['I will let this one slide. Health is not a flex, it is a need.', 'Fine. That one is okay. Do not get used to it.', 'Responsible spending. I do not know what to do with it.'],
  },
  other: {
    mild: ['Logged. Every dollar counts.', 'Noted. Spend wisely.', 'Another one for the books.'],
    medium: ['{amt} gone. Hope it was worth it.', 'Logged. I will remember this.', 'You spent {amt}. On what? Who knows.'],
    unhinged: ['{amt}. Gone. Like your dignity and your savings.', 'I have no idea what that was but it cost {units}. Wow.', 'Money out. Your bank balance whimpers.'],
  },
};

export const OVER: Bank = {
  mild: ['That is the week\'s budget gone. Take it easy for the next few days.', 'You are over for the week. No stress, just eat at home.', 'Budget used up. Next week we do better.'],
  medium: ['That is the week gone. Now you are spending next week\'s money.', 'Over budget. You are officially on credit from your future self.', 'Budget: gone. Excuses: loading.'],
  unhinged: ['Week blown. Absolutely cooked. Eat the fries in the couch cushions.', 'You are now broke. Not metaphorically. Do not look at your bank app.', 'Over budget. Mate. {n} {noun} this week and now you are a charity case.'],
};

export const BIG: Bank = {
  mild: ['That is a big one: {units}. Make sure it counts.', '{units} in one go. Hope it was planned.', 'Chunky purchase. Take a breath.'],
  medium: ['{units} in one hit. Be honest, did you need it?', '{amt} is {work} of your life. Gone.', 'That is {units}. You could have bought a whole day of food.'],
  unhinged: ['{units}. In ONE go. Be so fucking serious right now.', '{amt} is {work} of work, gone for a thing you will forget by Friday.', 'You could have bought {units} of actual snack packs. You chose this instead. Interesting.'],
};

export const REPEAT: Bank = {
  mild: ['That is {n} {noun} this week. Maybe pace yourself.', '{nth} {noun} already. Might be a pattern.', 'Another {noun}? Noticing a habit.'],
  medium: ['{nth} {noun} this week. It is not a treat anymore, it is a lifestyle.', 'That is {n} {noun} in a week. The pattern is strong.', 'You have a {noun} problem and it is expensive.'],
  unhinged: ['{n} {noun} this week. It is a problem. You have a problem.', '{nth}. {noun}. This week. I am not even mad, I am concerned.', 'At this point just move into {merchant}.'],
};

export const LATE: Bank = {
  mild: ['Late night purchase. Sleep on these things next time.', 'It is late. Decisions made now are sleepy decisions.', 'Night spending noted. Maybe wait till morning.'],
  medium: ['Late night purchase. 3am you has terrible taste.', 'Nothing good is bought after midnight. Ask your cart.', 'Your sleepy self spent {amt}. Awake you is annoyed.'],
  unhinged: ['{amt} at this hour? Go to bed, you absolute menace.', 'Midnight spending is how you end up with a drone and no rent money.', 'The only things open at 2am are bad ideas and drive-thrus.'],
};

export const BNPL: Bank = {
  mild: ['Pay later is still pay. It counts in full today.'],
  medium: ['Pay later is just pay worse. I counted the full {amt} today.'],
  unhinged: ['Pay later? Mate, that is just a loan with a cute logo. Full {amt} counted.'],
};

export const BODY: Partial<Record<CategoryId, string[]>> = {
  fastfood: [
    'Fast food again? Fat fuck.',
    'Another fast food run. Look at you, you absolute unit.',
    'Fast food. The fries are on your hips, and the receipt is on your budget.',
  ],
  delivery: ['Delivery again. Your couch has a permanent dent, and so does your bank account.'],
  snacks: ['More snacks? Your pants are crying for help.'],
};


// ---------------------------------------------------------------------------
// "I want this" nudges
// ---------------------------------------------------------------------------
export const WANT: Bank = {
  mild: ['Sleep on it. If you still want it tomorrow, it is probably okay.', 'Give it a day. The urge usually passes.', 'Let it cool. You can always buy it later.'],
  medium: ['Put it in the fridge. Cooling off is free.', 'You want it now. Will you want it Thursday?', 'The cart can wait. Your rent cannot.'],
  unhinged: ['Absolutely not tonight. Come back when your brain is back.', 'You want it because you are bored. Go for a walk.', 'Impulse detected. Locking it in the freezer.'],
};

