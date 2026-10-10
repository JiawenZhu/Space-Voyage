// "Where should I go?" — a transparent, rule-based matcher. Each city carries interest tags;
// its best months come from the guide's "Best time". Scores are explained, never a black box.

export const interests = [
  { id: 'food', label: 'Food', local: '美食' },
  { id: 'history', label: 'History & culture', local: '历史文化' },
  { id: 'nature', label: 'Nature & views', local: '自然风光' },
  { id: 'nightlife', label: 'City lights', local: '都市夜生活' },
  { id: 'beach', label: 'Beaches & coast', local: '海滨' },
  { id: 'art', label: 'Art & architecture', local: '艺术建筑' },
  { id: 'family', label: 'Family & theme parks', local: '亲子乐园' }
];

const TAGS = {
  beijing: ['history', 'food'],
  xian: ['history', 'food'],
  shanghai: ['nightlife', 'food', 'art'],
  chongqing: ['nightlife', 'food', 'nature'],
  shenzhen: ['nightlife', 'art'],
  chengdu: ['food', 'nature', 'family'],
  suzhou: ['history', 'art'],
  guilin: ['nature'],
  'new-york': ['art', 'food', 'nightlife'],
  orlando: ['family'],
  chicago: ['art', 'food'],
  'new-orleans': ['food', 'nightlife', 'history'],
  'san-francisco': ['nature', 'food', 'art'],
  washington: ['history', 'art', 'family'],
  nashville: ['nightlife', 'food'],
  'las-vegas': ['nightlife', 'nature'],
  tokyo: ['food', 'nightlife', 'art', 'family'],
  kyoto: ['history', 'art', 'nature'],
  osaka: ['food', 'nightlife', 'family'],
  nara: ['history', 'nature', 'family'],
  seoul: ['food', 'nightlife', 'history'],
  busan: ['beach', 'food'],
  singapore: ['food', 'family', 'nightlife'],
  bangkok: ['food', 'nightlife', 'history'],
  'chiang-mai': ['nature', 'history'],
  hanoi: ['food', 'history'],
  'kuala-lumpur': ['food', 'nightlife'],
  'siem-reap': ['history', 'nature'],
  paris: ['art', 'food', 'history'],
  london: ['history', 'art', 'nightlife'],
  rome: ['history', 'food', 'art'],
  barcelona: ['art', 'beach', 'food', 'nightlife'],
  amsterdam: ['art', 'nightlife'],
  prague: ['history', 'nightlife'],
  'rio-de-janeiro': ['beach', 'nature', 'nightlife'],
  'buenos-aires': ['food', 'nightlife', 'art'],
  cusco: ['history', 'nature'],
  lima: ['food', 'beach'],
  cartagena: ['beach', 'history'],
  santiago: ['nature', 'food'],
  'cape-town': ['nature', 'beach', 'food'],
  marrakech: ['history', 'food', 'art'],
  cairo: ['history'],
  nairobi: ['nature', 'family'],
  zanzibar: ['beach', 'history'],
  'victoria-falls': ['nature']
};

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "Late Mar–Apr", "May–Jun, Sep–Oct", "Nov–Feb", "Apr, Nov" → month indexes 0–11.
export function bestMonths(text) {
  const out = new Set();
  for (const part of text.split(',')) {
    const found = [...part.matchAll(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/g)].map((m) => MONTHS.indexOf(m[0]));
    if (!found.length) continue;
    const [a, b = a] = found;
    for (let m = a; ; m = (m + 1) % 12) {
      out.add(m);
      if (m === b) break;
    }
  }
  return out;
}

export const cityTags = (id) => TAGS[id] ?? [];

// Returns cities ranked by fit, with a 0–100 score and plain-language reasons.
export function rankCities(cities, { picks = [], month = null, regions = [] }) {
  const pool = regions.length ? cities.filter((c) => regions.includes(c.country)) : cities;
  const max = picks.length * 2 + (month === null ? 0 : 3) || 1;
  return pool
    .map((city) => {
      const tags = cityTags(city.id);
      const hits = picks.filter((p) => tags.includes(p));
      let score = hits.length * 2;
      const reasons = hits.map((h) => interests.find((i) => i.id === h).label);
      if (month !== null) {
        const months = bestMonths(city.stats.best);
        if (months.has(month)) {
          score += 3;
          reasons.unshift(`Best in ${MONTHS[month]}`);
        } else if (months.has((month + 1) % 12) || months.has((month + 11) % 12)) {
          score += 1;
          reasons.unshift(`Close to its best season (${city.stats.best})`);
        }
      }
      return { city, score, percent: Math.round((score / max) * 100), reasons };
    })
    .sort((a, b) => b.score - a.score || a.city.name.localeCompare(b.city.name));
}
