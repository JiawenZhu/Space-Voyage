import photos from './photos.json';
import videos from './videos.json';

// Regions in display order (`short` is the header label). Add a region by appending here
// and giving its cities the same `country` id.
export const countries = [
  { id: 'china', name: 'China', short: 'China', local: '中国', available: true },
  { id: 'usa', name: 'USA', short: 'USA', local: '美国', available: true },
  { id: 'east-asia', name: 'East Asia', short: 'East Asia', local: '东亚', available: true },
  { id: 'southeast-asia', name: 'Southeast Asia', short: 'SE Asia', local: '东南亚', available: true },
  { id: 'europe', name: 'Europe', short: 'Europe', local: '欧洲', available: true },
  { id: 'south-america', name: 'South America', short: 'S. America', local: '南美洲', available: true },
  { id: 'africa', name: 'Africa', short: 'Africa', local: '非洲', available: true }
];

// Sources: Wikipedia city articles (population, history) checked October 2026.
// `nation` defaults to the region name for single-country regions.
const cityData = [
  {
    id: 'beijing', country: 'china', name: 'Beijing', local: '北京',
    tagline: 'The imperial capital',
    intro: 'China’s capital for most of the past eight centuries, Beijing pairs vast imperial palaces and quiet hutong alleys with the Great Wall winding through the hills to the north.',
    stats: { population: '21.8M', region: 'Municipality', time: 'UTC+8', best: 'Sep–Oct' },
    facts: [
      ['Must-see', 'Forbidden City, Temple of Heaven, Summer Palace and the Great Wall at Mutianyu.'],
      ['Must-eat', 'Peking roast duck, zhajiangmian noodles and street-side jianbing.'],
      ['Getting around', 'One of the world’s largest metro networks reaches almost every sight.'],
      ['Tip', 'Book Forbidden City tickets online in advance — it is closed on Mondays.']
    ]
  },
  {
    id: 'xian', country: 'china', name: 'Xi’an', local: '西安',
    tagline: 'Where the Silk Road began',
    intro: 'Capital of thirteen dynasties and the eastern end of the Silk Road, Xi’an is home to the Terracotta Army and one of the best-preserved city walls in China.',
    stats: { population: '13.2M', region: 'Shaanxi', time: 'UTC+8', best: 'Apr–May' },
    facts: [
      ['Must-see', 'Terracotta Army, the City Wall by bike, the Bell and Drum Towers, Big Wild Goose Pagoda.'],
      ['Must-eat', 'Roujiamo, biangbiang noodles and yangrou paomo in the Muslim Quarter.'],
      ['Getting around', 'Metro and buses in town; tourist bus 5 (306) runs to the Terracotta Army.'],
      ['Tip', 'Cycle the 14 km wall at sunset, then walk to the Muslim Quarter for dinner.']
    ]
  },
  {
    id: 'shanghai', country: 'china', name: 'Shanghai', local: '上海',
    tagline: 'Where the Bund meets the future',
    intro: 'China’s largest city faces itself across the Huangpu River: colonial-era banks along the Bund on one side, the glittering towers of Lujiazui on the other.',
    stats: { population: '24.9M', region: 'Municipality', time: 'UTC+8', best: 'Apr–May' },
    facts: [
      ['Must-see', 'The Bund at night, Shanghai Tower, Yuyuan Garden and the plane-tree streets of the former French Concession.'],
      ['Must-eat', 'Xiaolongbao soup dumplings and pan-fried shengjianbao.'],
      ['Getting around', 'The world’s longest metro network, plus the 431 km/h Maglev to Pudong Airport.'],
      ['Tip', 'Cross the river on the ferry for the cheapest skyline view in town.']
    ]
  },
  {
    id: 'chongqing', country: 'china', name: 'Chongqing', local: '重庆',
    tagline: 'The 8D mountain city',
    intro: 'Built on steep hills where the Yangtze and Jialing rivers meet, Chongqing stacks streets, bridges and monorails on top of each other — and is famous for its fiery hot pot.',
    stats: { population: '32M', region: 'Municipality', time: 'UTC+8', best: 'Mar–May' },
    facts: [
      ['Must-see', 'Hongya Cave at night, the Liziba monorail that runs through a building, the Yangtze River cableway.'],
      ['Must-eat', 'Chongqing hot pot and xiaomian spicy noodles.'],
      ['Getting around', 'Monorail and metro; a ground floor here can be the 20th floor next door.'],
      ['Tip', 'Summers are among China’s hottest — spring and autumn are far more comfortable.']
    ]
  },
  {
    id: 'shenzhen', country: 'china', name: 'Shenzhen', local: '深圳',
    tagline: 'From fishing villages to tech capital',
    intro: 'China’s first special economic zone grew from a cluster of villages in 1980 into a city of 18 million — the world’s hardware workshop, right across the border from Hong Kong.',
    stats: { population: '18.2M', region: 'Guangdong', time: 'UTC+8', best: 'Oct–Dec' },
    facts: [
      ['Must-see', 'Huaqiangbei electronics markets, Shenzhen Bay Park, Ping An Finance Center, OCT Loft.'],
      ['Must-eat', 'Cantonese dim sum and Chaoshan beef hot pot.'],
      ['Getting around', 'A fast, modern metro; high-speed trains reach Hong Kong in under 20 minutes.'],
      ['Tip', 'Walk the Shenzhen Bay coastline at sunset for views over to Hong Kong.']
    ]
  },
  {
    id: 'chengdu', country: 'china', name: 'Chengdu', local: '成都',
    tagline: 'Pandas, teahouses and spice',
    intro: 'Sichuan’s relaxed capital is home to the Giant Panda Breeding Research Base, a deep-rooted teahouse culture and some of China’s boldest cooking.',
    stats: { population: '20.9M', region: 'Sichuan', time: 'UTC+8', best: 'Mar–Jun' },
    facts: [
      ['Must-see', 'Giant Panda Base (go early), Kuanzhai Alley, Jinli Street, Wenshu Monastery.'],
      ['Must-eat', 'Mapo tofu, Sichuan hot pot and dan dan noodles.'],
      ['Getting around', 'Metro across the city; fast trains to Chongqing in about an hour.'],
      ['Tip', 'Sip tea and try an ear-cleaning in People’s Park — a Chengdu classic.']
    ]
  },
  {
    id: 'suzhou', country: 'china', name: 'Suzhou', local: '苏州',
    tagline: 'Gardens and canals',
    intro: 'Laced with canals along the Grand Canal, Suzhou is famous for its UNESCO-listed classical gardens, silk and Kunqu opera — long praised as “paradise on earth”.',
    stats: { population: '12.7M', region: 'Jiangsu', time: 'UTC+8', best: 'Apr–May' },
    facts: [
      ['Must-see', 'Humble Administrator’s Garden, Lingering Garden, Pingjiang Road, Tiger Hill.'],
      ['Must-eat', 'Squirrel-shaped mandarin fish and a bowl of Suzhou noodles.'],
      ['Getting around', 'About 25 minutes from Shanghai by high-speed train; metro and canal boats in town.'],
      ['Tip', 'Visit the gardens at opening time, before the tour groups arrive.']
    ]
  },
  {
    id: 'guilin', country: 'china', name: 'Guilin', local: '桂林',
    tagline: 'The finest landscape under heaven',
    intro: 'Named for its sweet osmanthus trees, Guilin sits on the Li River among hundreds of karst peaks — the scenery printed on China’s 20-yuan note.',
    stats: { population: '4.9M', region: 'Guangxi', time: 'UTC+8', best: 'Sep–Oct' },
    facts: [
      ['Must-see', 'Li River cruise to Yangshuo, Elephant Trunk Hill, Reed Flute Cave, Longji rice terraces.'],
      ['Must-eat', 'Guilin rice noodles and Yangshuo beer fish.'],
      ['Getting around', 'Boats and bamboo rafts on the river; bikes and scooters around Yangshuo.'],
      ['Tip', 'Stay a night in Yangshuo and cycle the Yulong River valley.']
    ]
  },
  {
    id: 'new-york', country: 'usa', name: 'New York', local: '纽约',
    tagline: 'The city that never sleeps',
    intro: 'America’s largest city spreads across five boroughs around one of the world’s great natural harbors — a global capital of finance, art, theatre and food.',
    stats: { population: '8.8M', region: 'New York', time: 'UTC−5', best: 'Apr–Jun' },
    facts: [
      ['Must-see', 'Central Park, the Statue of Liberty, the Empire State Building, the Met and a Broadway show.'],
      ['Must-eat', 'A New York slice, bagels with lox and pastrami on rye.'],
      ['Getting around', 'The subway runs 24 hours a day; walking is often fastest in Manhattan.'],
      ['Tip', 'The free Staten Island Ferry passes the Statue of Liberty.']
    ]
  },
  {
    id: 'orlando', country: 'usa', name: 'Orlando', local: '奥兰多',
    tagline: 'Theme park capital of the world',
    intro: 'Central Florida’s sunny hub is home to Walt Disney World and Universal Orlando, with lakes, springs and the Space Coast all within easy reach.',
    stats: { population: '2.7M metro', region: 'Florida', time: 'UTC−5', best: 'Mar–May' },
    facts: [
      ['Must-see', 'Walt Disney World, Universal Orlando, Lake Eola and Kennedy Space Center an hour east.'],
      ['Must-eat', 'Cuban sandwiches, key lime pie and fresh Florida citrus.'],
      ['Getting around', 'A car is easiest; resort shuttles connect the parks.'],
      ['Tip', 'Arrive at park opening and save big rides for the last hour.']
    ]
  },
  {
    id: 'chicago', country: 'usa', name: 'Chicago', local: '芝加哥',
    tagline: 'The Windy City',
    intro: 'Rising on the shore of Lake Michigan, Chicago is the birthplace of the skyscraper — best seen from a boat on its architecture river tours.',
    stats: { population: '2.7M', region: 'Illinois', time: 'UTC−6', best: 'May–Oct' },
    facts: [
      ['Must-see', 'Millennium Park and Cloud Gate, an architecture river cruise, the Art Institute, the Magnificent Mile.'],
      ['Must-eat', 'Deep-dish pizza, a Chicago-style hot dog and an Italian beef.'],
      ['Getting around', 'The elevated “L” trains loop right through downtown.'],
      ['Tip', 'Summer brings free concerts at Millennium Park’s Pritzker Pavilion.']
    ]
  },
  {
    id: 'new-orleans', country: 'usa', name: 'New Orleans', local: '新奥尔良',
    tagline: 'The birthplace of jazz',
    intro: 'On a bend of the Mississippi, New Orleans blends French, Spanish, African and Caribbean roots into its music, its iron-lace architecture and its Creole cooking.',
    stats: { population: '384K', region: 'Louisiana', time: 'UTC−6', best: 'Feb–May' },
    facts: [
      ['Must-see', 'The French Quarter, Jackson Square, live jazz on Frenchmen Street, the Garden District.'],
      ['Must-eat', 'Beignets, gumbo, po’boys and crawfish étouffée.'],
      ['Getting around', 'Historic streetcars run along St. Charles Avenue and Canal Street.'],
      ['Tip', 'Mardi Gras (Feb–Mar) and Jazz Fest (late April) fill the city — book early.']
    ]
  },
  {
    id: 'san-francisco', country: 'usa', name: 'San Francisco', local: '旧金山',
    tagline: 'The City by the Bay',
    intro: 'Steep hills, fog and the Golden Gate Bridge define San Francisco, a compact city of cable cars, Victorian houses and world-class food.',
    stats: { population: '826K', region: 'California', time: 'UTC−8', best: 'Sep–Oct' },
    facts: [
      ['Must-see', 'Golden Gate Bridge, Alcatraz, the Painted Ladies and crooked Lombard Street.'],
      ['Must-eat', 'Sourdough bread, a Mission burrito and Dungeness crab.'],
      ['Getting around', 'Cable cars, Muni buses and BART trains across the Bay.'],
      ['Tip', 'September and October are the warmest, least foggy months.']
    ]
  },
  {
    id: 'washington', country: 'usa', name: 'Washington, D.C.', local: '华盛顿',
    tagline: 'The nation’s capital',
    intro: 'America’s capital is built around the National Mall, lined with monuments, memorials and the Smithsonian museums — almost all of them free to visit.',
    stats: { population: '690K', region: 'D.C.', time: 'UTC−5', best: 'Late Mar–Apr' },
    facts: [
      ['Must-see', 'The National Mall, Lincoln Memorial, U.S. Capitol and the Smithsonian museums.'],
      ['Must-eat', 'A half-smoke sausage, Ethiopian food and Maryland crab cakes.'],
      ['Getting around', 'The Metro and Capital Bikeshare cover all the main sights.'],
      ['Tip', 'Cherry blossoms around the Tidal Basin peak in late March or early April.']
    ]
  },
  {
    id: 'nashville', country: 'usa', name: 'Nashville', local: '纳什维尔',
    tagline: 'Music City',
    intro: 'Tennessee’s capital on the Cumberland River is the home of country music, with live bands playing from late morning to the small hours on Lower Broadway.',
    stats: { population: '689K', region: 'Tennessee', time: 'UTC−6', best: 'Apr–May' },
    facts: [
      ['Must-see', 'Honky-tonks on Lower Broadway, the Grand Ole Opry, Ryman Auditorium, Country Music Hall of Fame.'],
      ['Must-eat', 'Nashville hot chicken and a meat-and-three plate.'],
      ['Getting around', 'Downtown is walkable; rideshare for the Opry and East Nashville.'],
      ['Tip', 'Most Broadway honky-tonks have live music with no cover charge.']
    ]
  },
  {
    id: 'las-vegas', country: 'usa', name: 'Las Vegas', local: '拉斯维加斯',
    tagline: 'Entertainment capital of the world',
    intro: 'Rising out of the Mojave Desert, Las Vegas is a non-stop resort city of casinos, shows and dining — with red-rock canyons and the Hoover Dam a short drive away.',
    stats: { population: '642K', region: 'Nevada', time: 'UTC−8', best: 'Mar–May' },
    facts: [
      ['Must-see', 'The Strip at night, the Bellagio fountains, Fremont Street, Red Rock Canyon.'],
      ['Must-eat', 'Celebrity-chef restaurants and the legendary buffets.'],
      ['Getting around', 'Walk the Strip, take the Monorail, or drive out to the desert.'],
      ['Tip', 'Summer days pass 40 °C — spring and autumn are best for hiking nearby.']
    ]
  }
,
  // East Asia — Japan and South Korea
  {
    id: 'tokyo', country: 'east-asia', nation: 'Japan', name: 'Tokyo', local: '东京',
    tagline: 'Neon, shrines and endless neighbourhoods',
    intro: 'The world’s largest metropolitan area is really a patchwork of villages — from Shibuya’s famous crossing to the old temple streets of Asakusa.',
    stats: { population: '14M', region: 'Japan', time: 'UTC+9', best: 'Mar–May' },
    facts: [
      ['Must-see', 'Shibuya Crossing, Senso-ji in Asakusa, Meiji Jingu, the view from Tokyo Skytree.'],
      ['Must-eat', 'Sushi at Toyosu, ramen, and yakitori under the train tracks in Yurakucho.'],
      ['Getting around', 'The JR Yamanote loop and metro reach everything; get a Suica card.'],
      ['Tip', 'Cherry blossoms usually peak in late March to early April.']
    ]
  },
  {
    id: 'kyoto', country: 'east-asia', nation: 'Japan', name: 'Kyoto', local: '京都',
    tagline: 'Japan’s ancient capital',
    intro: 'Imperial capital for more than a thousand years, Kyoto keeps around 1,600 temples, wooden machiya townhouses and the geisha district of Gion.',
    stats: { population: '1.46M', region: 'Japan', time: 'UTC+9', best: 'Nov' },
    facts: [
      ['Must-see', 'Fushimi Inari’s torii gates, Kinkaku-ji, Kiyomizu-dera, Arashiyama bamboo grove.'],
      ['Must-eat', 'Kaiseki dinner, yudofu tofu and matcha sweets.'],
      ['Getting around', 'Buses and the subway, or rent a bike — the city is flat.'],
      ['Tip', 'Visit Fushimi Inari at sunrise to have the gates almost to yourself.']
    ]
  },
  {
    id: 'osaka', country: 'east-asia', nation: 'Japan', name: 'Osaka', local: '大阪',
    tagline: 'Japan’s kitchen',
    intro: 'Loud, friendly and obsessed with food, Osaka lights up at night along the Dotonbori canal — the Japanese call it “kuidaore”, eat until you drop.',
    stats: { population: '2.75M', region: 'Japan', time: 'UTC+9', best: 'Mar–May' },
    facts: [
      ['Must-see', 'Dotonbori, Osaka Castle, Shinsekai and Universal Studios Japan.'],
      ['Must-eat', 'Takoyaki, okonomiyaki and kushikatsu.'],
      ['Getting around', 'Metro and JR loop line; Kyoto is 15 minutes away by shinkansen.'],
      ['Tip', 'Day-trip to Nara’s deer park — under an hour by train.']
    ]
  },
  {
    id: 'nara', country: 'east-asia', nation: 'Japan', name: 'Nara', local: '奈良',
    tagline: 'Deer, temples and giant Buddhas',
    intro: 'Japan’s first permanent capital is a calm, walkable city where over a thousand free-roaming deer bow for crackers outside Todai-ji’s Great Buddha.',
    stats: { population: '350K', region: 'Japan', time: 'UTC+9', best: 'Apr, Nov' },
    facts: [
      ['Must-see', 'Todai-ji and its Great Buddha, Nara Park, Kasuga Taisha’s lanterns.'],
      ['Must-eat', 'Kakinoha-zushi (sushi in persimmon leaves) and mochi pounded on the street.'],
      ['Getting around', 'Everything in the park area is walkable from the stations.'],
      ['Tip', 'Hold deer crackers out of sight — the deer are polite but very persistent.']
    ]
  },
  {
    id: 'seoul', country: 'east-asia', nation: 'South Korea', name: 'Seoul', local: '首尔',
    tagline: 'Palaces and pop culture',
    intro: 'South Korea’s capital wraps Joseon-era palaces and hanok villages inside a buzzing city of K-pop, night markets and late-night food.',
    stats: { population: '9.4M', region: 'South Korea', time: 'UTC+9', best: 'Apr–May' },
    facts: [
      ['Must-see', 'Gyeongbokgung Palace, Bukchon Hanok Village, Myeongdong, N Seoul Tower.'],
      ['Must-eat', 'Korean barbecue, bibimbap and street food at Gwangjang Market.'],
      ['Getting around', 'An excellent subway with signs in English; get a T-money card.'],
      ['Tip', 'Wear a hanbok and enter the palaces for free.']
    ]
  },
  {
    id: 'busan', country: 'east-asia', nation: 'South Korea', name: 'Busan', local: '釜山',
    tagline: 'Beaches, hills and seafood',
    intro: 'Korea’s second city and biggest port spreads between mountains and sea, with city beaches, hillside villages and the country’s largest fish market.',
    stats: { population: '3.3M', region: 'South Korea', time: 'UTC+9', best: 'May–Jun, Sep–Oct' },
    facts: [
      ['Must-see', 'Haeundae Beach, Gamcheon Culture Village, Haedong Yonggungsa Temple, Gwangan Bridge.'],
      ['Must-eat', 'Fresh raw fish at Jagalchi Market and dwaeji gukbap pork soup.'],
      ['Getting around', 'Metro across the city; KTX trains reach Seoul in about 2.5 hours.'],
      ['Tip', 'Watch Gwangan Bridge light up from Gwangalli Beach at night.']
    ]
  },
  // Southeast Asia
  {
    id: 'singapore', country: 'southeast-asia', nation: 'Singapore', name: 'Singapore', local: '新加坡',
    tagline: 'The garden city',
    intro: 'A tiny island nation that packs futuristic architecture, rainforest gardens and some of the world’s best street food into one spotless city.',
    stats: { population: '6M', region: 'Singapore', time: 'UTC+8', best: 'Feb–Apr' },
    facts: [
      ['Must-see', 'Marina Bay Sands, Gardens by the Bay, the Merlion, Chinatown and Little India.'],
      ['Must-eat', 'Hainanese chicken rice, chilli crab and laksa at a hawker centre.'],
      ['Getting around', 'The MRT is fast and cheap; tap in with any contactless card.'],
      ['Tip', 'Catch the free light show at Gardens by the Bay’s Supertree Grove.']
    ]
  },
  {
    id: 'bangkok', country: 'southeast-asia', nation: 'Thailand', name: 'Bangkok', local: '曼谷',
    tagline: 'Temples and street food',
    intro: 'Thailand’s capital mixes gilded temples on the Chao Phraya River with rooftop bars, floating markets and endless street-food stalls.',
    stats: { population: '11M metro', region: 'Thailand', time: 'UTC+7', best: 'Nov–Feb' },
    facts: [
      ['Must-see', 'The Grand Palace, Wat Pho’s reclining Buddha, Wat Arun, Chatuchak Weekend Market.'],
      ['Must-eat', 'Pad thai, tom yum goong and mango sticky rice.'],
      ['Getting around', 'BTS Skytrain, MRT and river boats beat the traffic.'],
      ['Tip', 'Cover shoulders and knees to enter the temples.']
    ]
  },
  {
    id: 'chiang-mai', country: 'southeast-asia', nation: 'Thailand', name: 'Chiang Mai', local: '清迈',
    tagline: 'The rose of the north',
    intro: 'Northern Thailand’s cultural capital sits in a moated old city with more than 300 temples, surrounded by mountains, night markets and elephant sanctuaries.',
    stats: { population: '1.2M metro', region: 'Thailand', time: 'UTC+7', best: 'Nov–Feb' },
    facts: [
      ['Must-see', 'Wat Phra That Doi Suthep, the Old City temples, the Sunday Walking Street.'],
      ['Must-eat', 'Khao soi curry noodles and sai oua northern sausage.'],
      ['Getting around', 'Red songthaew shared trucks, bikes and scooters.'],
      ['Tip', 'Choose an ethical, no-riding elephant sanctuary.']
    ]
  },
  {
    id: 'hanoi', country: 'southeast-asia', nation: 'Vietnam', name: 'Hanoi', local: '河内',
    tagline: 'A thousand-year-old capital',
    intro: 'Vietnam’s capital blends French colonial boulevards, tranquil lakes and the chaotic, delicious lanes of the Old Quarter.',
    stats: { population: '8.5M', region: 'Vietnam', time: 'UTC+7', best: 'Oct–Apr' },
    facts: [
      ['Must-see', 'Hoan Kiem Lake, the Old Quarter, the Temple of Literature, Train Street.'],
      ['Must-eat', 'Pho, bun cha and egg coffee.'],
      ['Getting around', 'Walk the Old Quarter; use ride-hailing motorbikes for longer trips.'],
      ['Tip', 'Ha Long Bay is a popular day or overnight trip from Hanoi.']
    ]
  },
  {
    id: 'kuala-lumpur', country: 'southeast-asia', nation: 'Malaysia', name: 'Kuala Lumpur', local: '吉隆坡',
    tagline: 'Twin towers and tropical streets',
    intro: 'Malaysia’s capital mixes Malay, Chinese and Indian cultures under the Petronas Twin Towers, once the tallest buildings in the world.',
    stats: { population: '2M', region: 'Malaysia', time: 'UTC+8', best: 'May–Jul' },
    facts: [
      ['Must-see', 'Petronas Twin Towers, Batu Caves, Merdeka Square, Jalan Alor night market.'],
      ['Must-eat', 'Nasi lemak, roti canai and satay.'],
      ['Getting around', 'LRT, MRT and monorail, plus cheap ride-hailing.'],
      ['Tip', 'Book the Petronas skybridge ahead — tickets sell out.']
    ]
  },
  {
    id: 'siem-reap', country: 'southeast-asia', nation: 'Cambodia', name: 'Siem Reap', local: '暹粒',
    tagline: 'Gateway to Angkor',
    intro: 'This relaxed riverside town is the base for exploring Angkor, the vast capital of the Khmer Empire and the largest religious monument on Earth.',
    stats: { population: '250K', region: 'Cambodia', time: 'UTC+7', best: 'Nov–Mar' },
    facts: [
      ['Must-see', 'Angkor Wat at sunrise, the faces of Bayon, the jungle-wrapped Ta Prohm.'],
      ['Must-eat', 'Fish amok and Khmer red curry.'],
      ['Getting around', 'Hire a tuk-tuk driver for the temples for the day.'],
      ['Tip', 'Buy a multi-day Angkor Pass — the site is far too big for one day.']
    ]
  },
  // Europe
  {
    id: 'paris', country: 'europe', nation: 'France', name: 'Paris', local: '巴黎',
    tagline: 'The city of light',
    intro: 'Grand boulevards, riverside bridges and café terraces make Paris the archetype of a beautiful city — with the Louvre and the Eiffel Tower to match.',
    stats: { population: '2.1M', region: 'France', time: 'UTC+1', best: 'Apr–Jun, Sep–Oct' },
    facts: [
      ['Must-see', 'The Eiffel Tower, the Louvre, Notre-Dame, Montmartre and a Seine cruise.'],
      ['Must-eat', 'Croissants, steak frites and macarons.'],
      ['Getting around', 'The Métro is dense and fast; walking along the Seine is best.'],
      ['Tip', 'The Eiffel Tower sparkles for five minutes on every hour after dark.']
    ]
  },
  {
    id: 'london', country: 'europe', nation: 'United Kingdom', name: 'London', local: '伦敦',
    tagline: 'History on every corner',
    intro: 'Two thousand years of history line the Thames, from the Tower of London to Westminster — and most of the great museums are free.',
    stats: { population: '8.9M', region: 'United Kingdom', time: 'UTC+0', best: 'May–Sep' },
    facts: [
      ['Must-see', 'Tower Bridge, Westminster and Big Ben, the British Museum, Camden and Borough Market.'],
      ['Must-eat', 'Fish and chips, a Sunday roast and afternoon tea.'],
      ['Getting around', 'The Tube and red buses; tap in with any contactless card.'],
      ['Tip', 'Free museums include the British Museum, National Gallery and Tate Modern.']
    ]
  },
  {
    id: 'rome', country: 'europe', nation: 'Italy', name: 'Rome', local: '罗马',
    tagline: 'The eternal city',
    intro: 'Capital of an empire and home of the Vatican, Rome layers ancient ruins, Renaissance churches and baroque fountains through its lively streets.',
    stats: { population: '2.8M', region: 'Italy', time: 'UTC+1', best: 'Apr–Jun, Sep–Oct' },
    facts: [
      ['Must-see', 'The Colosseum, the Roman Forum, the Vatican Museums, the Pantheon and Trevi Fountain.'],
      ['Must-eat', 'Cacio e pepe, carbonara and gelato.'],
      ['Getting around', 'Mostly on foot; buses and two metro lines fill the gaps.'],
      ['Tip', 'Throw a coin into the Trevi Fountain to make sure you return.']
    ]
  },
  {
    id: 'barcelona', country: 'europe', nation: 'Spain', name: 'Barcelona', local: '巴塞罗那',
    tagline: 'Gaudí by the sea',
    intro: 'Catalonia’s capital pairs Gaudí’s fantastical buildings with a medieval Gothic Quarter, city beaches and late, lively nights.',
    stats: { population: '1.7M', region: 'Spain', time: 'UTC+1', best: 'May–Jun, Sep' },
    facts: [
      ['Must-see', 'Sagrada Família, Park Güell, Casa Batlló, the Gothic Quarter.'],
      ['Must-eat', 'Tapas, paella and pan con tomate.'],
      ['Getting around', 'Metro and walking; the grid of Eixample is easy to navigate.'],
      ['Tip', 'Book Sagrada Família and Park Güell tickets online well ahead.']
    ]
  },
  {
    id: 'amsterdam', country: 'europe', nation: 'Netherlands', name: 'Amsterdam', local: '阿姆斯特丹',
    tagline: 'Canals and bicycles',
    intro: 'Rings of 17th-century canals, narrow gabled houses and more bicycles than people make Amsterdam one of Europe’s most charming cities.',
    stats: { population: '930K', region: 'Netherlands', time: 'UTC+1', best: 'Apr–May' },
    facts: [
      ['Must-see', 'The canal ring, the Rijksmuseum, the Van Gogh Museum, the Anne Frank House.'],
      ['Must-eat', 'Stroopwafels, raw herring and Dutch apple pie.'],
      ['Getting around', 'Bike like a local, or take trams and canal boats.'],
      ['Tip', 'Visit Keukenhof’s tulip fields nearby from late March to mid-May.']
    ]
  },
  {
    id: 'prague', country: 'europe', nation: 'Czech Republic', name: 'Prague', local: '布拉格',
    tagline: 'The city of a hundred spires',
    intro: 'Prague’s medieval centre survived almost untouched, with Charles Bridge leading over the Vltava to a vast hilltop castle.',
    stats: { population: '1.4M', region: 'Czech Republic', time: 'UTC+1', best: 'May–Sep' },
    facts: [
      ['Must-see', 'Charles Bridge, Prague Castle, Old Town Square and its astronomical clock.'],
      ['Must-eat', 'Svíčková beef, trdelník pastry and Czech beer.'],
      ['Getting around', 'Trams and metro; the centre is very walkable.'],
      ['Tip', 'Cross Charles Bridge at dawn to see it without the crowds.']
    ]
  },
  // South America
  {
    id: 'rio-de-janeiro', country: 'south-america', nation: 'Brazil', name: 'Rio de Janeiro', local: '里约热内卢',
    tagline: 'The marvellous city',
    intro: 'Granite peaks, rainforest and famous beaches surround Rio, watched over by Christ the Redeemer from the top of Corcovado.',
    stats: { population: '6.2M', region: 'Brazil', time: 'UTC−3', best: 'Dec–Mar' },
    facts: [
      ['Must-see', 'Christ the Redeemer, Sugarloaf Mountain, Copacabana and Ipanema beaches.'],
      ['Must-eat', 'Feijoada, pão de queijo and an açaí bowl.'],
      ['Getting around', 'Metro along the beaches; taxis or ride-hailing at night.'],
      ['Tip', 'Carnival takes over the city in February or early March.']
    ]
  },
  {
    id: 'buenos-aires', country: 'south-america', nation: 'Argentina', name: 'Buenos Aires', local: '布宜诺斯艾利斯',
    tagline: 'Tango and grand avenues',
    intro: 'Argentina’s elegant capital is famous for its European-style boulevards, colourful La Boca, late dinners and tango danced in the street.',
    stats: { population: '3.1M', region: 'Argentina', time: 'UTC−3', best: 'Mar–May, Sep–Nov' },
    facts: [
      ['Must-see', 'The Obelisco, Caminito in La Boca, Recoleta Cemetery, Teatro Colón.'],
      ['Must-eat', 'Steak at a parrilla, empanadas and dulce de leche.'],
      ['Getting around', 'The Subte metro and city buses; get a SUBE card.'],
      ['Tip', 'Dinner rarely starts before 9 pm.']
    ]
  },
  {
    id: 'cusco', country: 'south-america', nation: 'Peru', name: 'Cusco', local: '库斯科',
    tagline: 'Capital of the Inca Empire',
    intro: 'At 3,400 m in the Andes, Cusco’s colonial churches stand on Inca stone walls — and it is the gateway to Machu Picchu.',
    stats: { population: '430K', region: 'Peru', time: 'UTC−5', best: 'May–Sep' },
    facts: [
      ['Must-see', 'Plaza de Armas, Qorikancha, Sacsayhuamán and Machu Picchu.'],
      ['Must-eat', 'Lomo saltado, alpaca steak and coca tea.'],
      ['Getting around', 'Walk the old town; trains to Machu Picchu leave from Ollantaytambo.'],
      ['Tip', 'Take the first day slowly to adjust to the altitude.']
    ]
  },
  {
    id: 'lima', country: 'south-america', nation: 'Peru', name: 'Lima', local: '利马',
    tagline: 'South America’s food capital',
    intro: 'Peru’s capital sits on cliffs above the Pacific, with a UNESCO-listed colonial centre and some of the most celebrated restaurants in the world.',
    stats: { population: '10M metro', region: 'Peru', time: 'UTC−5', best: 'Dec–Apr' },
    facts: [
      ['Must-see', 'Plaza de Armas, Miraflores clifftops, Barranco’s art district.'],
      ['Must-eat', 'Ceviche, lomo saltado and a pisco sour.'],
      ['Getting around', 'Metropolitano rapid buses or ride-hailing.'],
      ['Tip', 'Paraglide off the Miraflores cliffs for a bird’s-eye view.']
    ]
  },
  {
    id: 'cartagena', country: 'south-america', nation: 'Colombia', name: 'Cartagena', local: '卡塔赫纳',
    tagline: 'Colour on the Caribbean',
    intro: 'Inside its stone walls, Cartagena’s old town is a maze of brightly painted colonial houses with bougainvillea spilling from wooden balconies.',
    stats: { population: '1M', region: 'Colombia', time: 'UTC−5', best: 'Dec–Apr' },
    facts: [
      ['Must-see', 'The walled city, Getsemaní’s street art, Castillo San Felipe, the Rosario Islands.'],
      ['Must-eat', 'Fried fish with coconut rice, arepas de huevo and fresh fruit.'],
      ['Getting around', 'Walk the old town; taxis and boats for further out.'],
      ['Tip', 'Walk the city walls at sunset.']
    ]
  },
  {
    id: 'santiago', country: 'south-america', nation: 'Chile', name: 'Santiago', local: '圣地亚哥',
    tagline: 'A capital beneath the Andes',
    intro: 'Chile’s modern capital lies in a valley ringed by snow-capped Andes, with wine country and the Pacific coast both a short drive away.',
    stats: { population: '7M metro', region: 'Chile', time: 'UTC−4', best: 'Oct–Apr' },
    facts: [
      ['Must-see', 'Cerro San Cristóbal, Plaza de Armas, Sky Costanera, Barrio Lastarria.'],
      ['Must-eat', 'Empanadas de pino, pastel de choclo and Chilean wine.'],
      ['Getting around', 'A clean, efficient metro covers most of the city.'],
      ['Tip', 'Day-trip to colourful Valparaíso or the Casablanca wine valley.']
    ]
  },
  // Africa
  {
    id: 'cape-town', country: 'africa', nation: 'South Africa', name: 'Cape Town', local: '开普敦',
    tagline: 'Where mountain meets ocean',
    intro: 'Under flat-topped Table Mountain, Cape Town has dramatic beaches, penguin colonies and world-class vineyards on its doorstep.',
    stats: { population: '4.8M metro', region: 'South Africa', time: 'UTC+2', best: 'Nov–Mar' },
    facts: [
      ['Must-see', 'Table Mountain, the Cape of Good Hope, Boulders Beach penguins, Robben Island.'],
      ['Must-eat', 'Cape Malay curry, bobotie and wine from Stellenbosch.'],
      ['Getting around', 'Ride-hailing and the MyCiTi bus; rent a car for the peninsula.'],
      ['Tip', 'Take the cable car up Table Mountain on a clear, calm morning.']
    ]
  },
  {
    id: 'marrakech', country: 'africa', nation: 'Morocco', name: 'Marrakech', local: '马拉喀什',
    tagline: 'The red city',
    intro: 'Behind its rose-coloured walls, Marrakech is a labyrinth of souks and riads centred on Jemaa el-Fnaa, with the Atlas Mountains on the horizon.',
    stats: { population: '1M', region: 'Morocco', time: 'UTC+1', best: 'Mar–May, Oct–Nov' },
    facts: [
      ['Must-see', 'Jemaa el-Fnaa, the souks, Jardin Majorelle, Bahia Palace, Koutoubia Mosque.'],
      ['Must-eat', 'Tagine, couscous and sweet mint tea.'],
      ['Getting around', 'Walk the medina; petit taxis for the new town.'],
      ['Tip', 'Agree on a price before you shop — haggling is expected.']
    ]
  },
  {
    id: 'cairo', country: 'africa', nation: 'Egypt', name: 'Cairo', local: '开罗',
    tagline: 'City of a thousand minarets',
    intro: 'Africa’s largest city spreads along the Nile, from the Pyramids of Giza and the Sphinx to the medieval mosques and bazaars of Islamic Cairo.',
    stats: { population: '10M', region: 'Egypt', time: 'UTC+2', best: 'Oct–Apr' },
    facts: [
      ['Must-see', 'The Pyramids of Giza, the Grand Egyptian Museum, Khan el-Khalili bazaar.'],
      ['Must-eat', 'Koshari, ful medames and ta’ameya falafel.'],
      ['Getting around', 'Metro and ride-hailing; traffic can be intense.'],
      ['Tip', 'Visit the pyramids at opening time to avoid the midday heat.']
    ]
  },
  {
    id: 'nairobi', country: 'africa', nation: 'Kenya', name: 'Nairobi', local: '内罗毕',
    tagline: 'The safari capital',
    intro: 'Kenya’s capital is the only city in the world with a national park inside its borders — giraffes and zebras graze against the skyline.',
    stats: { population: '4.4M', region: 'Kenya', time: 'UTC+3', best: 'Jun–Oct' },
    facts: [
      ['Must-see', 'Nairobi National Park, the Giraffe Centre, the Sheldrick elephant orphanage.'],
      ['Must-eat', 'Nyama choma grilled meat, ugali and chapati.'],
      ['Getting around', 'Ride-hailing is easiest; book safaris with a guide.'],
      ['Tip', 'The Maasai Mara migration season peaks from July to October.']
    ]
  },
  {
    id: 'zanzibar', country: 'africa', nation: 'Tanzania', name: 'Zanzibar', local: '桑给巴尔',
    tagline: 'The spice island',
    intro: 'Stone Town’s winding alleys, carved wooden doors and Swahili, Arab and Indian heritage meet white-sand beaches on the Indian Ocean.',
    stats: { population: '700K', region: 'Tanzania', time: 'UTC+3', best: 'Jun–Oct' },
    facts: [
      ['Must-see', 'Stone Town, a spice farm tour, Nungwi beach, a dhow sunset cruise.'],
      ['Must-eat', 'Zanzibar pizza at Forodhani night market and fresh seafood.'],
      ['Getting around', 'Walk Stone Town; dala-dala minibuses or taxis around the island.'],
      ['Tip', 'Dress modestly in Stone Town, a largely Muslim community.']
    ]
  },
  {
    id: 'victoria-falls', country: 'africa', nation: 'Zimbabwe', name: 'Victoria Falls', local: '维多利亚瀑布',
    tagline: 'The smoke that thunders',
    intro: 'On the Zambezi River between Zimbabwe and Zambia, Victoria Falls is the largest sheet of falling water in the world — its spray is visible for miles.',
    stats: { population: '35K', region: 'Zimbabwe', time: 'UTC+2', best: 'Feb–May' },
    facts: [
      ['Must-see', 'The rainforest trail along the falls, Victoria Falls Bridge, a Zambezi sunset cruise.'],
      ['Must-eat', 'Sadza with stew and bream from the Zambezi.'],
      ['Getting around', 'The town is small; tours include transfers.'],
      ['Tip', 'Bring a raincoat — the spray soaks you at high water.']
    ]
  }
];

// Arrival clips: Pexels footage (src/videos.json, encoded by scripts/videos.py), plus the
// Seedance-generated Shanghai flyover.
const clips = Object.fromEntries(Object.keys(videos).map((id) => [id, `/cities/${id}/arrival.mp4`]));
clips.shanghai = '/cities/shanghai/arrival.mp4';

export const cities = cityData.map((c) => ({
  ...c,
  nation: c.nation || countries.find((r) => r.id === c.country).name,
  clip: clips[c.id],
  clipCredit: videos[c.id]
    ? { author: videos[c.id].author, url: `https://www.pexels.com/video/${videos[c.id].id}/` }
    : null,
  photos: photos[c.id].map(([id, author, username, caption], i) => ({
    src: `/cities/${c.id}/${i + 1}.jpg`,
    thumb: `/cities/${c.id}/thumb-${i + 1}.jpg`,
    caption,
    author,
    authorUrl: `https://unsplash.com/@${username}`,
    photoUrl: `https://unsplash.com/photos/${id}`
  }))
}));
