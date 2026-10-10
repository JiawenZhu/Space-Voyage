import photos from './photos.json';

// Countries in display order. Add a region by appending here with `available: true`
// and adding its cities below.
export const countries = [
  { id: 'china', name: 'China', local: '中国', available: true },
  { id: 'usa', name: 'USA', local: '美国', available: true },
  { id: 'europe', name: 'Europe', local: '欧洲', available: false },
  { id: 'southeast-asia', name: 'Southeast Asia', local: '东南亚', available: false }
];

// Sources: Wikipedia city articles (population, history) checked October 2026.
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
];

// Optional Seedance arrival clips, added city by city once approved.
const clips = {
  shanghai: '/cities/shanghai/arrival.mp4' // sample — awaiting approval
};

export const cities = cityData.map((c) => ({
  ...c,
  clip: clips[c.id],
  photos: photos[c.id].map(([id, author, username, caption], i) => ({
    src: `/cities/${c.id}/${i + 1}.jpg`,
    thumb: `/cities/${c.id}/thumb-${i + 1}.jpg`,
    caption,
    author,
    authorUrl: `https://unsplash.com/@${username}`,
    photoUrl: `https://unsplash.com/photos/${id}`
  }))
}));
