const BASE = 'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P';

export const LOGO = BASE + '/eb7e0f53-50cd-4af5-abc4-8b9a52cdc01b.svg';

// Each destination has an arrival clip (the approach footage that plays during the warp,
// whose final frame becomes the planet's backdrop) or, failing that, a still image.
const TO_MARS = BASE + '/5fc5651c-3b5d-4171-b507-87f7e635d1b4.mp4';
const TO_EARTH = BASE + '/fc3ded42-e845-41f3-a830-5cab512d79cd.mp4';
const TO_VENUS = BASE + '/b30f64d9-1637-477a-83df-d0fc6461a422.mp4';
const MERCURY = BASE + '/d6fb8b6b-c15e-4aaa-9cf7-45bbb5e33372.jpg';

export const EARTH_DIAMETER_KM = 12742;

export const planets = [
  {
    id: 'mercury',
    name: 'Mercury',
    number: '01',
    available: true,
    image: MERCURY,
    diameterKm: 4879,
    colors: ['#c9c2b8', '#6b645d'],
    stats: { gravity: '3.7 m/s²', moons: '0', day: '176 days' },
    facts: [
      ['Distance', '57.9 million km from the Sun (0.39 AU).'],
      ['Year', '88 Earth days — the fastest orbit of any planet.'],
      ['Temperature', 'From −180 °C at night to 430 °C by day.'],
      ['Atmosphere', 'Almost none: a thin exosphere of atoms knocked off the surface.']
    ]
  },
  {
    id: 'venus',
    name: 'Venus',
    number: '02',
    available: true,
    clip: TO_VENUS,
    diameterKm: 12104,
    colors: ['#f1d39a', '#a8743a'],
    stats: { gravity: '8.9 m/s²', moons: '0', day: '117 days' },
    facts: [
      ['Distance', '108.2 million km from the Sun (0.72 AU).'],
      ['Year', '225 Earth days. It spins backwards, slower than it orbits.'],
      ['Temperature', 'Around 465 °C — the hottest planet in the Solar System.'],
      ['Atmosphere', 'Extremely dense, mostly carbon dioxide, with clouds of sulfuric acid.']
    ]
  },
  {
    id: 'earth',
    name: 'Earth',
    number: '03',
    available: true,
    clip: TO_EARTH,
    diameterKm: 12742,
    colors: ['#7fb8f0', '#1f4f8a'],
    stats: { gravity: '9.8 m/s²', moons: '1', day: '24 h' },
    facts: [
      ['Distance', '149.6 million km from the Sun (1 AU).'],
      ['Year', '365.25 days.'],
      ['Temperature', 'Average surface temperature around 15 °C.'],
      ['Atmosphere', 'Mostly nitrogen and oxygen, supporting life and liquid water.']
    ]
  },
  {
    id: 'mars',
    name: 'Mars',
    number: '04',
    available: true,
    clip: TO_MARS,
    diameterKm: 6779,
    colors: ['#f08a5d', '#8a3418'],
    stats: { gravity: '3.7 m/s²', moons: '2', day: '24 h 40 m' },
    facts: [
      ['Distance', 'About 228 million km from the Sun (1.52 AU).'],
      ['Year', 'One Martian year is equal to 687 Earth days.'],
      ['Temperature', 'Around −60 °C, dropping to −125 °C at the poles in winter.'],
      ['Atmosphere', 'Very thin, 95% carbon dioxide, with frequent dust storms.']
    ]
  },
  { id: 'jupiter', name: 'Jupiter', number: '05', available: false, diameterKm: 139820, colors: ['#e8c9a0', '#9a6b45'] },
  { id: 'saturn', name: 'Saturn', number: '06', available: false, diameterKm: 116460, colors: ['#f2dfae', '#a88a52'] },
  { id: 'uranus', name: 'Uranus', number: '07', available: false, diameterKm: 50724, colors: ['#bdeef0', '#4f9aa6'] },
  { id: 'neptune', name: 'Neptune', number: '08', available: false, diameterKm: 49244, colors: ['#8fb0ff', '#2a3f9e'] }
];

// The voyage runs sunward and loops: Mars → Earth → Venus → Mercury → Mars.
export const VOYAGE = ['mars', 'earth', 'venus', 'mercury'];
