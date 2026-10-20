import type { Bank } from './roasts-en';
import type { LangId } from './types';

/**
 * Extra lines that only a Melbourne person would get. They are mixed into the normal banks when the wallet is in
 * Australian dollars, so the app sounds like it lives here instead of like a generic budgeting joke machine.
 * Keys are roast sets (coffee, delivery...) plus the special banks OVER, BIG, REPEAT and LATE.
 * No brand names, no body jabs. Other languages only use {amt} {units} {n} {work} {unit}.
 */
export type MelbBanks = Record<string, Bank>;

export const MELB_KEYS = ['coffee', 'matcha', 'bubbletea', 'snacks', 'fastfood', 'delivery', 'dineout', 'groceries', 'drinks', 'nightout', 'rideshare', 'clothes', 'tech', 'subscription', 'uni', 'OVER', 'BIG', 'REPEAT', 'LATE'] as const;

const EN: MelbBanks = {
  coffee: {
    mild: ['A Melbourne coffee. The one thing this city does properly.', 'Laneway coffee logged. The barista had opinions about your milk.'],
    medium: ['{amt} for a coffee in a laneway you needed a map to find. Peak Melbourne.', 'Melbourne runs on coffee and tram delays, and you are paying for both.'],
    unhinged: ['{amt} for a coffee made by a man with a moustache and contempt. Very Fitzroy, very broke.', 'You queued in a laneway for a flat white. You have never queued that hard for rent.'],
  },
  matcha: {
    mild: ['Matcha in the CBD. Very Melbourne of you.', 'Matcha logged. Hope the laneway was cute.'],
    medium: ['{amt} for a green drink on Chapel Street. The lawn at Fitzroy Gardens is free.', 'Matcha in a Collingwood warehouse cafe. Your personality is a tote bag.'],
    unhinged: ['{amt} for lawn water in a laneway. The Yarra is free and about as green.', 'Melbourne matcha: {amt} of grass and zero self-awareness.'],
  },
  bubbletea: {
    mild: ['Bubble tea on Swanston Street. A student classic.', 'Boba logged. Chinatown has you.'],
    medium: ['{amt} for boba after class. The CBD has a bubble tea shop every 40 metres and you found them all.', 'Your Tuesday has a sugar problem and a tapioca habit.'],
    unhinged: ['A new bubble tea shop opens in the CBD every week and you are personally funding the leases.', '{amt} on pearls. They are chewing through your savings faster than a tram on a long red.'],
  },
  snacks: {
    mild: ['A snack from the servo. Melbourne servo, Melbourne prices.', 'Snack logged. Hope it was a Vic Market bargain.'],
    medium: ['{amt} at the servo at 11pm. The Vic Market closed at 2pm and so did your common sense.', 'You bought a snack to cope with a tram delay. Understood, but expensive.'],
    unhinged: ['{amt} for chips at Flinders Street. They know you are desperate and priced it accordingly.', 'Snack eaten before you left the shop. Wallet pickpocketed by a chip packet in Southbank.'],
  },
  fastfood: {
    mild: ['Fast food after a night in the city. A Melbourne tradition.', 'Fast food logged. It is raining, so fair enough.'],
    medium: ['{amt} on a drive-thru. A snack pack has actual meat and a story.', 'Melbourne has a million cafes and you picked a drive-thru. Respect, sort of.'],
    unhinged: ['{amt} on fast food in a city with Lygon Street. Disgraceful.', 'Best food city in the country and you ate off a tray in a car park. Be so serious.'],
  },
  delivery: {
    mild: ['Delivery on a cold Melbourne night. Fair.', 'Delivery logged. Four seasons in one day, we get it.'],
    medium: ['{amt} for delivery to a Brunswick share house. The restaurant was 800 metres away, mate.', 'It drizzled for six minutes so you ordered in. Melbourne weather is not that serious.'],
    unhinged: ['You paid a stranger on an e-bike {amt} to bring food from Smith Street. You live on Smith Street.', 'Delivery fee, service fee, small order fee, and it is 14 degrees. Lazy tax, collected.'],
  },
  dineout: {
    mild: ['Dinner out in Melbourne. Easy to overspend, easy to enjoy.', 'A Lygon Street night. Worth it, probably.'],
    medium: ['{amt} for dinner. A pub parma is cheaper and tastes like a hug.', 'You booked in Fitzroy and ordered share plates. You split a broccoli four ways.'],
    unhinged: ['{amt} for small plates. Small plates, big bill, still hungry on the 86 tram. Classic.', '"Share plates" is Melbourne for pay more and still be hungry. Congratulations.'],
  },
  groceries: {
    mild: ['Groceries! The Vic Market is great for this.', 'A proper shop. Cooking at home is the Melbourne student move.'],
    medium: ['A real shop. Imagine the money you save by not going to a Fitzroy cafe.', 'Groceries, and not a laneway in sight. Proud of you.'],
    unhinged: ['Groceries. A responsible purchase in a city that begs you to eat out. I am emotional.', 'You went to the market instead of a brunch place. Who are you.'],
  },
  drinks: {
    mild: ['Drinks in the city. Remember the last tram home.', 'A few drinks. Stay hydrated, mate.'],
    medium: ['{amt} on drinks. A pot at the pub costs less than a laneway cocktail you needed a password for.', 'A rooftop bar? The only thing rising is the bill.'],
    unhinged: ['{amt} on drinks in a secret bar with no sign. You paid extra for the mystery.', 'You bought a round on Chapel Street. On what income, you absolute sook.'],
  },
  nightout: {
    mild: ['Night out in Melbourne. The city loved you, your bank will not.', 'Big night logged. Hope the last tram was kind.'],
    medium: ['The night out, the kebab, the 3am ride home. {amt} of Melbourne nightlife.', 'You missed the last tram, so the night became a taxi. That is what {amt} is.'],
    unhinged: ['{amt} to get told off by a bouncer on King Street. A true Melbourne rite of passage.', 'You lost your jacket, your dignity and {units}. The night tram was right there.'],
  },
  rideshare: {
    mild: ['Ride logged. The tram was probably delayed anyway.', 'A ride home. Safe is worth it.'],
    medium: ['{amt} for a ride. The tram runs right past it and has a daily cap.', 'A ride across the CBD. You could have walked it in the time you waited.'],
    unhinged: ['{amt} on a ride because it drizzled. Melbourne drizzles, that is the whole climate.', 'You paid surge to dodge a slow tram. The 96 is slow, but it is not that slow.'],
  },
  clothes: {
    mild: ['Clothes logged. Hope it was a Brunswick op shop find.', 'New outfit. Chapel Street approves.'],
    medium: ['{amt} on a jacket for a city that is 12 degrees and sunny at the same time. Brave.', 'Another black jacket. It is the Melbourne uniform and you own four.'],
    unhinged: ['Black jacket number five. The Melbourne starter pack is complete and so is your overdraft.', '{amt} at Chadstone. That place is a casino for clothes.'],
  },
  tech: {
    mild: ['Tech purchase logged. Hopefully it survives the tram commute.', 'A gadget! Check it fits in the backpack.'],
    medium: ['{amt} on a gadget you will use on the tram for two weeks. Spicy.', 'The phone you have is fine. It just has a crack. So does everyone on the 109.'],
    unhinged: ['{units} on a gadget that will sit in a Brunswick drawer by winter.', 'Noise cancelling headphones to ignore Melbourne. Valid, but expensive.'],
  },
  subscription: {
    mild: ['Subscription logged. Check which ones you actually use on the tram.', 'A sub. Is it earning its place?'],
    medium: ['Melbourne winters make you subscribe to everything. Audit time.', 'You pay for streaming and still rewatch the same show. Cancel something.'],
    unhinged: ['Four streaming apps in a city with a free library. Genius.', 'Cancel one. Cold weather is not an excuse to be a subscription landlord.'],
  },
  uni: {
    mild: ['Uni expense logged. Melbourne students know the pain.', 'Textbook money. The library might have a copy, check first.'],
    medium: ['{amt} on uni stuff. Your campus library has this for free, just saying.', 'Another uni cost. At least the campus has cheap coffee. It does not.'],
    unhinged: ['{amt} on a textbook the prof wrote and sold you. The lecture is on a recording anyway.', 'You paid {amt} for a lecture you can watch at 2x speed in your pyjamas.'],
  },
  OVER: {
    mild: ['Week gone. Tram it till Monday, no rides.', 'Budget used up. Share house dinners from here, it is a Melbourne tradition.'],
    medium: ['Week gone, and it is only Wednesday. A Melbourne classic.', 'Over budget. Your future self is now a tram delay, always late and expensive.'],
    unhinged: ['Week blown. Tap water and sadness in a Brunswick share house. Welcome to Melbourne.', 'Broke by Wednesday. The pigeons at Flinders Street have more savings than you.'],
  },
  BIG: {
    mild: ['{units} in one go. Melbourne rent is bad enough, make this one count.', 'A big one. Take a breath before the tram home.'],
    medium: ['{units} in one hit. In this city that is a share house room for a few days.', '{amt} is {work} of your life gone, and you will forget by Friday.'],
    unhinged: ['{amt} in one go, in a city where a snack pack feeds you twice. Be so serious.', '{units} at once. Spending like the Docklands has a budget for you.'],
  },
  REPEAT: {
    mild: ['That is {n} this week. The owner is learning your name.', '{n} already. A regular, quietly.'],
    medium: ['{n} this week. You are a regular and the owner has started saying your name.', '{n} in a week. It is not a treat now, it is a Melbourne personality.'],
    unhinged: ['{n} this week. At this point just move in, it is closer than your lecture.', '{n}. This week. The staff know your order and your rent status.'],
  },
  LATE: {
    mild: ['Late night in Melbourne. The tram is every 40 minutes now, so go home.', 'It is late. The last tram is not your friend.'],
    medium: ['It is late and the last tram left. Go to bed, do not shop.', 'Midnight spending in a city that closes at 9. Impressive.'],
    unhinged: ['Nothing is open at 2am in Melbourne except kebab shops and bad ideas.', '{amt} at this hour. The tram is gone and so is your dignity.'],
  },
};

const ZH: MelbBanks = {
  coffee: {
    mild: ['一杯墨尔本咖啡。这座城市唯一真正做得好的事。', '小巷咖啡已记录。咖啡师对你的奶有意见。'],
    medium: ['{amt} 买一杯咖啡，还得靠地图才找到那条小巷。典型墨尔本。', '墨尔本靠咖啡和电车晚点运转，而你两样都在付钱。'],
    unhinged: ['{amt} 一杯咖啡，做咖啡的人留着小胡子还一脸不屑。很菲茨罗伊，很穷。', '你在小巷里排队买一杯 flat white，交房租时你可从没这么积极。'],
  },
  matcha: {
    mild: ['市中心的抹茶。很墨尔本。', '抹茶已记录。希望那条小巷挺好看。'],
    medium: ['{amt} 在查佩尔街买一杯绿饮料。菲茨罗伊花园的草地是免费的。', '柯林伍德仓库咖啡馆里的抹茶，你的人格就是一个帆布袋。'],
    unhinged: ['{amt} 买小巷里的草水。亚拉河免费，颜色也差不多。', '墨尔本抹茶：{amt} 的青草，零自知之明。'],
  },
  bubbletea: {
    mild: ['斯旺斯顿街的奶茶。学生经典。', '珍珠奶茶已记录。唐人街拿下你了。'],
    medium: ['{amt} 下课喝奶茶。市中心每 40 米一家奶茶店，你全都找到了。', '你的周二有糖瘾，还有珍珠瘾。'],
    unhinged: ['市中心每周都开一家新奶茶店，房租是你一个人在撑。', '{amt} 买珍珠。它们嚼你存款的速度比电车等红灯还快。'],
  },
  snacks: {
    mild: ['加油站买的零食。墨尔本加油站，墨尔本价格。', '零食已记录。希望是在维多利亚女王市场捡到的便宜货。'],
    medium: ['晚上 11 点在加油站花 {amt}。市场下午 2 点就关了，你的理智也是。', '你为了熬过电车晚点买零食。理解，但很贵。'],
    unhinged: ['{amt} 在弗林德斯街买薯片。他们知道你走投无路，所以定了这个价。', '零食在出店前就吃完了。钱包在南岸被一包薯片扒了。'],
  },
  fastfood: {
    mild: ['市区夜晚之后来点快餐。墨尔本传统。', '快餐已记录。下雨了，可以理解。'],
    medium: ['{amt} 买得来速。一份 snack pack 有真正的肉，还有故事。', '墨尔本有上百万家咖啡馆，你选了得来速。算你有种。'],
    unhinged: ['在有莱贡街的城市里花 {amt} 吃快餐。太丢人了。', '全国最好吃的城市，你却在停车场里吃托盘饭。认真点。'],
  },
  delivery: {
    mild: ['墨尔本冷夜点外卖。合理。', '外卖已记录。一天四季，我们懂。'],
    medium: ['{amt} 点外卖送到布伦瑞克的合租屋。餐厅就在 800 米外，兄弟。', '下了六分钟毛毛雨你就点外卖。墨尔本的天气没那么严重。'],
    unhinged: ['你付 {amt} 让一个骑电动车的陌生人从史密斯街送餐。你就住在史密斯街。', '配送费、服务费、小额订单费，而且才 14 度。懒人税已收。'],
  },
  dineout: {
    mild: ['墨尔本外出用餐。容易超支，也容易开心。', '莱贡街之夜。大概值得。'],
    medium: ['{amt} 一顿晚饭。酒吧的鸡排便宜，吃起来还像拥抱。', '你在菲茨罗伊订了位，点了分享小盘。一棵西兰花四个人分。'],
    unhinged: ['{amt} 买小盘菜。小盘子，大账单，坐在电车上还饿着。经典。', '"分享盘"在墨尔本就是多花钱还吃不饱。恭喜。'],
  },
  groceries: {
    mild: ['买菜！维多利亚女王市场很适合。', '一次正经采购。在家做饭是墨尔本学生的正解。'],
    medium: ['一次真正的采购。想想不去菲茨罗伊咖啡馆能省多少钱。', '买菜，而且没有小巷咖啡馆。为你骄傲。'],
    unhinged: ['买菜。在一个怂恿你天天下馆子的城市里，这是负责任的消费。我很感动。', '你去了市场而不是早午餐店。你是谁。'],
  },
  drinks: {
    mild: ['在市区喝酒。记得末班电车。', '喝几杯。记得多喝水，兄弟。'],
    medium: ['{amt} 花在饮品上。酒吧一杯啤酒，比小巷里要暗号才能进的鸡尾酒便宜。', '屋顶酒吧？唯一在上升的是账单。'],
    unhinged: ['{amt} 在没有招牌的秘密酒吧里喝酒。你为神秘感多付了钱。', '你在查佩尔街请客了。拿什么收入请的，你这怂货。'],
  },
  nightout: {
    mild: ['墨尔本夜生活。城市爱你，你的银行不爱。', '大夜晚已记录。希望末班电车对你好。'],
    medium: ['夜场、烤肉卷、凌晨 3 点打车回家。{amt} 的墨尔本夜生活。', '你错过了末班电车，夜晚变成了打车。{amt} 就是这么来的。'],
    unhinged: ['{amt} 在国王街被保安训了一顿。典型的墨尔本成年礼。', '你丢了外套、尊严和 {units}。夜间电车明明就在那儿。'],
  },
  rideshare: {
    mild: ['打车已记录。电车大概也晚点了。', '打车回家。安全值得。'],
    medium: ['{amt} 打车。电车就从旁边开过，而且每天有封顶价。', '在市区里打车。你等车的时间够走过去了。'],
    unhinged: ['{amt} 打车，因为下了点毛毛雨。墨尔本一直下毛毛雨，这就是气候。', '你为躲一辆慢电车付了加价。96 路是慢，但没那么慢。'],
  },
  clothes: {
    mild: ['买衣服已记录。希望是在布伦瑞克二手店淘到的。', '新衣服。查佩尔街批准了。'],
    medium: ['{amt} 买外套，在一个又是 12 度又出太阳的城市。勇敢。', '又一件黑外套。这是墨尔本制服，你已经有四件了。'],
    unhinged: ['第五件黑外套。墨尔本新手套装集齐了，你的透支额度也满了。', '{amt} 花在查德斯通。那地方就是衣服赌场。'],
  },
  tech: {
    mild: ['科技消费已记录。希望能熬过电车通勤。', '新设备！先确认能塞进背包。'],
    medium: ['{amt} 买个电车上只会用两周的小玩意。刺激。', '你现在的手机没问题，只是有裂痕。109 路上谁的没有。'],
    unhinged: ['{units} 买个到冬天就躺在布伦瑞克抽屉里的设备。', '买降噪耳机来无视墨尔本。合理，但贵。'],
  },
  subscription: {
    mild: ['订阅已记录。看看你在电车上真正用哪些。', '一个订阅。它配得上这个位置吗？'],
    medium: ['墨尔本的冬天让你什么都想订阅。该清点了。', '你付费订阅流媒体，却在重刷同一部剧。取消一个。'],
    unhinged: ['在一个有免费图书馆的城市里订四个流媒体。天才。', '取消一个。天冷不是当订阅房东的借口。'],
  },
  uni: {
    mild: ['大学开销已记录。墨尔本的学生都懂这种痛。', '教材钱。图书馆也许有，先查一下。'],
    medium: ['{amt} 花在大学的东西上。你们校园图书馆这个是免费的，我只是说说。', '又是一笔大学开销。至少校园咖啡便宜。其实并不。'],
    unhinged: ['{amt} 买教授自己写、自己卖给你的教材。反正讲座有录播。', '你花 {amt} 买一堂可以穿着睡衣 2 倍速看的课。'],
  },
  OVER: {
    mild: ['这周用完了。接下来坐电车，别打车到周一。', '预算用完了。接下来在合租屋吃饭吧，这是墨尔本传统。'],
    medium: ['这周没了，才周三。墨尔本经典。', '超支了。未来的你就像电车晚点，永远迟到还贵。'],
    unhinged: ['这周爆了。在布伦瑞克合租屋里喝自来水加伤心。欢迎来到墨尔本。', '周三就破产。弗林德斯街的鸽子都比你有存款。'],
  },
  BIG: {
    mild: ['一次花了 {units}。墨尔本房租已经够惨了，这笔要值得。', '大额消费。坐电车回家前先深呼吸。'],
    medium: ['一次 {units}。在这座城市，这够付几天合租房。', '{amt} 等于 {work}，周五你就忘了。'],
    unhinged: ['一次 {amt}，在一个 snack pack 能吃两顿的城市里。认真点。', '一口气 {units}。花钱像是码头区替你备了预算。'],
  },
  REPEAT: {
    mild: ['这周已经 {n} 次了。老板开始记住你的名字了。', '已经 {n} 次。悄悄成了熟客。'],
    medium: ['这周 {n} 次。你成了熟客，老板开始叫你的名字了。', '一周 {n} 次。这不是犒劳，是墨尔本人格。'],
    unhinged: ['这周 {n} 次。干脆搬进去住，比你的讲座还近。', '{n} 次，这周。店员知道你点什么，也知道你交没交房租。'],
  },
  LATE: {
    mild: ['墨尔本深夜。电车现在 40 分钟一班，回家吧。', '很晚了。末班电车不是你的朋友。'],
    medium: ['很晚了，末班电车也走了。去睡觉，别购物。', '在一座 9 点就打烊的城市里午夜消费。厉害。'],
    unhinged: ['墨尔本凌晨 2 点唯一开着的是烤肉店和坏主意。', '这个点花 {amt}。电车没了，尊严也没了。'],
  },
};

const ID: MelbBanks = {
  coffee: {
    mild: ['Kopi Melbourne. Satu-satunya hal yang kota ini lakukan dengan benar.', 'Kopi gang tercatat. Baristanya punya opini soal susumu.'],
    medium: ['{amt} buat kopi di gang yang harus kamu cari pakai peta. Khas Melbourne.', 'Melbourne jalan karena kopi dan trem telat, dan kamu bayar dua-duanya.'],
    unhinged: ['{amt} buat kopi bikinan cowok berkumis yang menatap sinis. Sangat Fitzroy, sangat bokek.', 'Kamu antre di gang demi flat white. Antre bayar kos aja nggak segitunya.'],
  },
  matcha: {
    mild: ['Matcha di pusat kota. Melbourne banget.', 'Matcha tercatat. Semoga gangnya lucu.'],
    medium: ['{amt} buat minuman hijau di Chapel Street. Rumput di Fitzroy Gardens gratis.', 'Matcha di kafe gudang Collingwood. Kepribadianmu itu tote bag.'],
    unhinged: ['{amt} buat air rumput di gang. Sungai Yarra gratis dan warnanya mirip.', 'Matcha Melbourne: {amt} rumput dan nol kesadaran diri.'],
  },
  bubbletea: {
    mild: ['Boba di Swanston Street. Klasik anak kuliahan.', 'Boba tercatat. Chinatown sudah menangkapmu.'],
    medium: ['{amt} buat boba habis kelas. Pusat kota punya kedai boba tiap 40 meter dan kamu mampir semuanya.', 'Selasamu punya masalah gula dan kebiasaan tapioka.'],
    unhinged: ['Tiap minggu ada kedai boba baru di pusat kota dan kamu sendirian yang bayar sewanya.', '{amt} buat mutiara. Mereka mengunyah tabunganmu lebih cepat dari trem di lampu merah panjang.'],
  },
  snacks: {
    mild: ['Camilan dari pom bensin. Pom bensin Melbourne, harga Melbourne.', 'Camilan tercatat. Semoga dapat diskon di Vic Market.'],
    medium: ['{amt} di pom bensin jam 11 malam. Vic Market tutup jam 2 siang dan akal sehatmu ikut tutup.', 'Kamu jajan buat tahan trem telat. Paham, tapi mahal.'],
    unhinged: ['{amt} buat keripik di Flinders Street. Mereka tahu kamu putus asa dan menaikkan harga.', 'Camilan habis sebelum keluar toko. Dompetmu dicopet bungkus keripik di Southbank.'],
  },
  fastfood: {
    mild: ['Makanan cepat saji setelah malam di kota. Tradisi Melbourne.', 'Cepat saji tercatat. Hujan, jadi wajar.'],
    medium: ['{amt} buat drive-thru. Snack pack punya daging beneran dan cerita.', 'Melbourne punya sejuta kafe dan kamu pilih drive-thru. Respect, kurang lebih.'],
    unhinged: ['{amt} buat cepat saji di kota yang punya Lygon Street. Memalukan.', 'Kota kuliner terbaik di negara ini dan kamu makan dari nampan di parkiran. Serius dong.'],
  },
  delivery: {
    mild: ['Pesan antar di malam dingin Melbourne. Wajar.', 'Pesan antar tercatat. Empat musim dalam sehari, kami paham.'],
    medium: ['{amt} buat pesan antar ke kos di Brunswick. Restorannya 800 meter dari situ, bro.', 'Gerimis enam menit dan kamu pesan antar. Cuaca Melbourne nggak segitunya.'],
    unhinged: ['Kamu bayar orang naik sepeda listrik {amt} buat bawa makanan dari Smith Street. Kamu tinggal di Smith Street.', 'Ongkir, biaya layanan, biaya pesanan kecil, dan suhunya 14 derajat. Pajak males, terkumpul.'],
  },
  dineout: {
    mild: ['Makan malam di luar di Melbourne. Gampang boros, gampang senang.', 'Malam di Lygon Street. Mungkin sepadan.'],
    medium: ['{amt} buat makan malam. Parma di pub lebih murah dan rasanya kayak pelukan.', 'Kamu reservasi di Fitzroy dan pesan piring berbagi. Satu brokoli dibagi empat.'],
    unhinged: ['{amt} buat piring kecil. Piring kecil, tagihan besar, masih lapar di trem. Klasik.', '"Piring berbagi" di Melbourne artinya bayar lebih dan tetap lapar. Selamat.'],
  },
  groceries: {
    mild: ['Belanja bahan! Vic Market cocok banget.', 'Belanja beneran. Masak di rumah itu langkah anak kuliahan Melbourne.'],
    medium: ['Belanja beneran. Bayangkan uang yang hemat karena nggak ke kafe Fitzroy.', 'Belanja bahan, dan tanpa gang kafe sama sekali. Bangga.'],
    unhinged: ['Belanja bahan. Pembelian bertanggung jawab di kota yang memaksamu makan di luar. Aku terharu.', 'Kamu ke pasar, bukan ke tempat brunch. Kamu siapa.'],
  },
  drinks: {
    mild: ['Minum di kota. Ingat trem terakhir.', 'Beberapa minuman. Tetap minum air putih, bro.'],
    medium: ['{amt} buat minuman. Satu gelas di pub lebih murah dari koktail gang yang butuh kata sandi.', 'Bar rooftop? Satu-satunya yang naik cuma tagihan.'],
    unhinged: ['{amt} buat minum di bar rahasia tanpa papan nama. Kamu bayar lebih buat misterinya.', 'Kamu traktir sekelompok orang di Chapel Street. Pakai gaji apa, dasar boros.'],
  },
  nightout: {
    mild: ['Malam di luar di Melbourne. Kotanya sayang kamu, banknya nggak.', 'Malam besar tercatat. Semoga trem terakhirnya baik.'],
    medium: ['Dugem, kebab, pulang naik taksi jam 3 pagi. {amt} nightlife Melbourne.', 'Kamu ketinggalan trem terakhir, jadi malamnya jadi taksi. Begitulah {amt}.'],
    unhinged: ['{amt} buat dimarahi bouncer di King Street. Ritual wajib Melbourne.', 'Kamu kehilangan jaket, harga diri, dan {units}. Trem malamnya padahal ada.'],
  },
  rideshare: {
    mild: ['Perjalanan tercatat. Tremnya mungkin memang telat.', 'Pulang naik kendaraan. Aman itu layak.'],
    medium: ['{amt} buat naik kendaraan. Trem lewat persis di situ dan ada batas harian.', 'Naik kendaraan di tengah kota. Waktu nunggunya cukup buat jalan kaki.'],
    unhinged: ['{amt} buat naik kendaraan gara-gara gerimis. Melbourne memang gerimis, itu seluruh iklimnya.', 'Kamu bayar harga lonjakan buat hindari trem lambat. Trem 96 memang lambat, tapi nggak segitunya.'],
  },
  clothes: {
    mild: ['Belanja baju tercatat. Semoga hasil thrift di Brunswick.', 'Baju baru. Chapel Street menyetujui.'],
    medium: ['{amt} buat jaket di kota yang 12 derajat dan cerah bersamaan. Berani.', 'Jaket hitam lagi. Itu seragam Melbourne dan kamu sudah punya empat.'],
    unhinged: ['Jaket hitam nomor lima. Paket pemula Melbourne lengkap, begitu juga overdraftmu.', '{amt} di Chadstone. Tempat itu kasino untuk baju.'],
  },
  tech: {
    mild: ['Beli gadget tercatat. Semoga tahan perjalanan trem.', 'Gadget! Pastikan muat di ransel.'],
    medium: ['{amt} buat gadget yang cuma kamu pakai dua minggu di trem. Pedas.', 'Ponselmu yang sekarang baik-baik saja. Cuma retak. Semua orang di trem 109 juga.'],
    unhinged: ['{units} buat gadget yang bakal nganggur di laci Brunswick pas musim dingin.', 'Headphone noise cancelling buat cuekin Melbourne. Valid, tapi mahal.'],
  },
  subscription: {
    mild: ['Langganan tercatat. Cek mana yang benar-benar kamu pakai di trem.', 'Satu langganan. Pantas nggak di situ?'],
    medium: ['Musim dingin Melbourne bikin kamu langganan segalanya. Waktunya audit.', 'Kamu bayar streaming tapi nonton ulang serial yang sama. Batalkan satu.'],
    unhinged: ['Empat aplikasi streaming di kota yang punya perpustakaan gratis. Jenius.', 'Batalkan satu. Cuaca dingin bukan alasan jadi tuan tanah langganan.'],
  },
  uni: {
    mild: ['Biaya kuliah tercatat. Mahasiswa Melbourne paham sakitnya.', 'Uang buku. Perpustakaan mungkin punya, cek dulu.'],
    medium: ['{amt} buat urusan kampus. Perpustakaan kampusmu punya ini gratis, cuma bilang.', 'Biaya kuliah lagi. Setidaknya kopi kampus murah. Ternyata nggak.'],
    unhinged: ['{amt} buat buku yang ditulis dosennya sendiri lalu dijual ke kamu. Kuliahnya juga ada rekaman.', 'Kamu bayar {amt} buat kuliah yang bisa ditonton 2x kecepatan pakai piyama.'],
  },
  OVER: {
    mild: ['Minggu ini habis. Naik trem sampai Senin, jangan naik kendaraan lain.', 'Anggaran habis. Makan di rumah kos dari sekarang, itu tradisi Melbourne.'],
    medium: ['Minggu habis, padahal baru Rabu. Klasik Melbourne.', 'Over budget. Dirimu di masa depan sekarang kayak trem telat, selalu telat dan mahal.'],
    unhinged: ['Minggu jebol. Air keran dan kesedihan di kos Brunswick. Selamat datang di Melbourne.', 'Bokek hari Rabu. Merpati di Flinders Street tabungannya lebih banyak dari kamu.'],
  },
  BIG: {
    mild: ['{units} sekali jalan. Sewa Melbourne sudah berat, bikin yang ini berarti.', 'Pembelian besar. Tarik napas dulu sebelum naik trem pulang.'],
    medium: ['{units} sekaligus. Di kota ini itu setara beberapa hari kamar kos.', '{amt} itu {work} hidupmu, dan hari Jumat kamu lupa.'],
    unhinged: ['{amt} sekaligus, di kota tempat snack pack cukup buat dua kali makan. Serius dong.', '{units} sekali jalan. Belanja kayak Docklands punya anggaran buat kamu.'],
  },
  REPEAT: {
    mild: ['Itu sudah {n} kali minggu ini. Pemiliknya mulai hafal namamu.', 'Sudah {n} kali. Diam-diam jadi langganan.'],
    medium: ['{n} kali minggu ini. Kamu langganan dan pemiliknya mulai manggil namamu.', '{n} kali seminggu. Ini bukan hadiah, ini kepribadian Melbourne.'],
    unhinged: ['{n} kali minggu ini. Sekalian pindah, lebih dekat dari kuliahmu.', '{n} kali, minggu ini. Stafnya hafal pesananmu dan status sewamu.'],
  },
  LATE: {
    mild: ['Malam di Melbourne. Trem sekarang tiap 40 menit, pulang gih.', 'Sudah malam. Trem terakhir bukan temanmu.'],
    medium: ['Sudah malam dan trem terakhir pergi. Tidur, jangan belanja.', 'Belanja tengah malam di kota yang tutup jam 9. Mengesankan.'],
    unhinged: ['Jam 2 pagi di Melbourne cuma kedai kebab dan ide buruk yang buka.', '{amt} jam segini. Trem sudah pergi dan harga dirimu juga.'],
  },
};

const ES: MelbBanks = {
  coffee: {
    mild: ['Un café de Melbourne. Lo único que esta ciudad hace bien.', 'Café de callejón anotado. El barista tuvo opiniones sobre tu leche.'],
    medium: ['{amt} por un café en un callejón que necesitaste un mapa para encontrar. Melbourne puro.', 'Melbourne funciona con café y retrasos de tranvía, y tú pagas los dos.'],
    unhinged: ['{amt} por un café hecho por un tipo con bigote y desprecio. Muy Fitzroy, muy pobre.', 'Hiciste cola en un callejón por un flat white. Nunca has hecho tanta cola para pagar el alquiler.'],
  },
  matcha: {
    mild: ['Matcha en el centro. Muy de Melbourne.', 'Matcha anotado. Espero que el callejón fuera bonito.'],
    medium: ['{amt} por una bebida verde en Chapel Street. El césped de Fitzroy Gardens es gratis.', 'Matcha en un café-almacén de Collingwood. Tu personalidad es una tote bag.'],
    unhinged: ['{amt} por agua de césped en un callejón. El río Yarra es gratis y casi igual de verde.', 'Matcha de Melbourne: {amt} de hierba y cero autoconciencia.'],
  },
  bubbletea: {
    mild: ['Té de burbujas en Swanston Street. Un clásico estudiantil.', 'Boba anotado. Chinatown te tiene.'],
    medium: ['{amt} por boba después de clase. El centro tiene una tienda cada 40 metros y las encontraste todas.', 'Tu martes tiene un problema de azúcar y un hábito de tapioca.'],
    unhinged: ['Cada semana abre una tienda de boba en el centro y tú pagas los alquileres tú solo.', '{amt} en perlas. Se comen tus ahorros más rápido que un tranvía en un semáforo largo.'],
  },
  snacks: {
    mild: ['Un snack de la gasolinera. Gasolinera de Melbourne, precios de Melbourne.', 'Snack anotado. Espero que fuera una ganga del Vic Market.'],
    medium: ['{amt} en la gasolinera a las 11 de la noche. El Vic Market cerró a las 2 y tu sentido común también.', 'Compraste un snack para aguantar un retraso del tranvía. Entendible, pero caro.'],
    unhinged: ['{amt} por patatas en Flinders Street. Saben que estás desesperado y lo cobraron.', 'Snack comido antes de salir de la tienda. Cartera robada por una bolsa de patatas en Southbank.'],
  },
  fastfood: {
    mild: ['Comida rápida después de una noche en la ciudad. Tradición de Melbourne.', 'Comida rápida anotada. Está lloviendo, así que se entiende.'],
    medium: ['{amt} en un autoservicio. Un snack pack tiene carne de verdad y una historia.', 'Melbourne tiene un millón de cafés y elegiste el autoservicio. Respeto, más o menos.'],
    unhinged: ['{amt} en comida rápida en una ciudad con Lygon Street. Vergonzoso.', 'La mejor ciudad para comer del país y comiste de una bandeja en un parking. Sé serio.'],
  },
  delivery: {
    mild: ['Pedido a domicilio en una noche fría de Melbourne. Justo.', 'Domicilio anotado. Cuatro estaciones en un día, ya lo sabemos.'],
    medium: ['{amt} por un pedido a un piso compartido en Brunswick. El restaurante estaba a 800 metros, amigo.', 'Llovizna seis minutos y pides a domicilio. El clima de Melbourne no es para tanto.'],
    unhinged: ['Pagaste {amt} a un desconocido en bici eléctrica por traer comida de Smith Street. Vives en Smith Street.', 'Tarifa de envío, de servicio y de pedido pequeño, y hay 14 grados. Impuesto de la pereza cobrado.'],
  },
  dineout: {
    mild: ['Cena fuera en Melbourne. Fácil de gastar de más, fácil de disfrutar.', 'Una noche en Lygon Street. Probablemente valió la pena.'],
    medium: ['{amt} por una cena. Una parma de pub es más barata y sabe a abrazo.', 'Reservaste en Fitzroy y pediste platos para compartir. Dividiste un brócoli entre cuatro.'],
    unhinged: ['{amt} por platitos. Platos pequeños, cuenta enorme, con hambre en el tranvía. Clásico.', '"Platos para compartir" en Melbourne significa pagar más y seguir con hambre. Felicidades.'],
  },
  groceries: {
    mild: ['¡Compra de comida! El Vic Market es genial para esto.', 'Una compra de verdad. Cocinar en casa es la jugada del estudiante de Melbourne.'],
    medium: ['Una compra real. Imagina lo que ahorras por no ir a un café de Fitzroy.', 'Compra de comida y ni un callejón a la vista. Orgulloso de ti.'],
    unhinged: ['Compra de comida. Un gasto responsable en una ciudad que te ruega comer fuera. Me emociono.', 'Fuiste al mercado en vez de a un brunch. ¿Quién eres?'],
  },
  drinks: {
    mild: ['Copas en el centro. Recuerda el último tranvía.', 'Unas copas. Hidrátate, amigo.'],
    medium: ['{amt} en copas. Una caña en el pub cuesta menos que un cóctel de callejón que pedía contraseña.', '¿Un bar en la azotea? Lo único que sube es la cuenta.'],
    unhinged: ['{amt} en copas en un bar secreto sin letrero. Pagaste extra por el misterio.', 'Invitaste una ronda en Chapel Street. ¿Con qué ingresos, mi rey?'],
  },
  nightout: {
    mild: ['Salida nocturna en Melbourne. La ciudad te quiso, tu banco no.', 'Gran noche anotada. Ojalá el último tranvía fuera amable.'],
    medium: ['La fiesta, el kebab, el taxi a las 3 de la mañana. {amt} de vida nocturna de Melbourne.', 'Perdiste el último tranvía y la noche se hizo taxi. Eso es {amt}.'],
    unhinged: ['{amt} para que un portero te regañe en King Street. Un rito de paso de Melbourne.', 'Perdiste la chaqueta, la dignidad y {units}. El tranvía nocturno estaba ahí.'],
  },
  rideshare: {
    mild: ['Viaje anotado. El tranvía seguro iba retrasado.', 'Un viaje a casa. La seguridad vale.'],
    medium: ['{amt} por un viaje. El tranvía pasa justo por ahí y tiene tope diario.', 'Un viaje por el centro. Podrías haber caminado en lo que esperaste.'],
    unhinged: ['{amt} en un viaje porque lloviznó. Melbourne llovizna, ese es todo su clima.', 'Pagaste tarifa dinámica por evitar un tranvía lento. El 96 es lento, pero no tanto.'],
  },
  clothes: {
    mild: ['Ropa anotada. Espero que fuera un hallazgo de segunda mano en Brunswick.', 'Outfit nuevo. Chapel Street aprueba.'],
    medium: ['{amt} en una chaqueta en una ciudad que está a 12 grados y soleada a la vez. Valiente.', 'Otra chaqueta negra. Es el uniforme de Melbourne y ya tienes cuatro.'],
    unhinged: ['Chaqueta negra número cinco. El kit de principiante de Melbourne está completo y tu descubierto también.', '{amt} en Chadstone. Ese lugar es un casino de ropa.'],
  },
  tech: {
    mild: ['Compra de tecnología anotada. Ojalá sobreviva al tranvía.', '¡Un gadget! Mira que quepa en la mochila.'],
    medium: ['{amt} en un gadget que usarás dos semanas en el tranvía. Picante.', 'Tu móvil actual está bien. Solo tiene una grieta. Como el de todos en el 109.'],
    unhinged: ['{units} en un gadget que estará en un cajón de Brunswick para el invierno.', 'Auriculares con cancelación de ruido para ignorar Melbourne. Válido, pero caro.'],
  },
  subscription: {
    mild: ['Suscripción anotada. Revisa cuáles usas de verdad en el tranvía.', 'Una suscripción. ¿Se merece su lugar?'],
    medium: ['El invierno de Melbourne te hace suscribirte a todo. Hora de auditar.', 'Pagas streaming y sigues viendo la misma serie. Cancela una.'],
    unhinged: ['Cuatro apps de streaming en una ciudad con biblioteca gratis. Genio.', 'Cancela una. El frío no es excusa para ser casero de suscripciones.'],
  },
  uni: {
    mild: ['Gasto de uni anotado. Los estudiantes de Melbourne conocen el dolor.', 'Dinero de libros. Quizá la biblioteca lo tenga, mira primero.'],
    medium: ['{amt} en cosas de la uni. La biblioteca de tu campus tiene esto gratis, solo digo.', 'Otro gasto de uni. Al menos el café del campus es barato. No lo es.'],
    unhinged: ['{amt} en un libro que escribió el profe y te vendió. La clase está grabada de todas formas.', 'Pagaste {amt} por una clase que puedes ver al doble de velocidad en pijama.'],
  },
  OVER: {
    mild: ['Semana agotada. Tranvía hasta el lunes, nada de viajes.', 'Presupuesto gastado. Cenas en casa desde ahora, es tradición de Melbourne.'],
    medium: ['Semana agotada y ni siquiera es jueves. Un clásico de Melbourne.', 'Te pasaste. Tu yo del futuro es ahora un retraso de tranvía: siempre tarde y caro.'],
    unhinged: ['Semana reventada. Agua del grifo y tristeza en un piso compartido de Brunswick. Bienvenido a Melbourne.', 'Arruinado a mitad de semana. Las palomas de Flinders Street tienen más ahorros que tú.'],
  },
  BIG: {
    mild: ['{units} de golpe. El alquiler de Melbourne ya duele, que esta valga la pena.', 'Una compra grande. Respira antes del tranvía a casa.'],
    medium: ['{units} de un golpe. En esta ciudad eso es una habitación compartida unos días.', '{amt} son {work} de tu vida, y el viernes lo habrás olvidado.'],
    unhinged: ['{amt} de golpe, en una ciudad donde un snack pack te da para dos comidas. Sé serio.', '{units} de una vez. Gastas como si Docklands tuviera presupuesto para ti.'],
  },
  REPEAT: {
    mild: ['Ya van {n} esta semana. El dueño está aprendiendo tu nombre.', 'Ya {n}. Cliente habitual, en silencio.'],
    medium: ['{n} esta semana. Eres habitual y el dueño ya dice tu nombre.', '{n} en una semana. Ya no es un capricho, es una personalidad de Melbourne.'],
    unhinged: ['{n} esta semana. Múdate ahí, queda más cerca que tu clase.', '{n}, esta semana. El personal sabe tu pedido y el estado de tu alquiler.'],
  },
  LATE: {
    mild: ['Noche en Melbourne. El tranvía pasa cada 40 minutos, vete a casa.', 'Es tarde. El último tranvía no es tu amigo.'],
    medium: ['Es tarde y el último tranvía se fue. A dormir, no a comprar.', 'Gastar a medianoche en una ciudad que cierra a las 9. Impresionante.'],
    unhinged: ['A las 2 de la mañana en Melbourne solo abren kebabs y malas ideas.', '{amt} a esta hora. El tranvía se fue y tu dignidad también.'],
  },
};

const BANKS: Record<LangId, MelbBanks> = { en: EN, zh: ZH, id: ID, es: ES };

/** Melbourne-only lines for a roast set or special bank. Empty when there are none. */
export function melbLines(lang: LangId, key: string, level: keyof Bank): string[] {
  return (BANKS[lang] ?? EN)[key]?.[level] ?? [];
}
