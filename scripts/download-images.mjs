import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '..', 'public', 'recipes');

// Curated Unsplash food photos matched to each recipe
const images = {
  'salsicciapasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=600&fit=crop', // sausage pasta
  'schnitzel': 'https://images.unsplash.com/photo-1599921841143-819065a55cc6?w=600&h=600&fit=crop', // schnitzel
  'fiskpinnar': 'https://images.unsplash.com/photo-1580217593608-61931ceaa710?w=600&h=600&fit=crop', // fish sticks
  'falukorv': 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&h=600&fit=crop', // sausage dish
  'arabiata': 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&h=600&fit=crop', // pasta arrabbiata
  'fisk-remoulad': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=600&fit=crop', // pan fried fish
  'indisk-gryta': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=600&fit=crop', // curry
  'matvete-sallad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=600&fit=crop', // grain salad bowl
  'svamprisotto': 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&h=600&fit=crop', // risotto
  'fiskgryta': 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&h=600&fit=crop', // fish stew
  'broccoli-carbonara': 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&h=600&fit=crop', // carbonara
  'hamburgare': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=600&fit=crop', // hamburger
  'linssoppa': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=600&fit=crop', // lentil soup
  'korv-stroganoff': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=600&fit=crop', // stroganoff-style
  'halloumi-zucchini': 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=600&h=600&fit=crop', // halloumi
  'gronsakssoppa': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=600&fit=crop', // vegetable soup
  'panerad-fisk': 'https://images.unsplash.com/photo-1580217593608-61931ceaa710?w=600&h=600&fit=crop', // breaded fish
  'fisktacos': 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=600&fit=crop', // fish tacos
  'kottbullar-pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=600&fit=crop', // meatball pasta
  'fiskbullar': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=600&fit=crop', // fish balls/patties
  'veggo-carbonara': 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=600&h=600&fit=crop', // veggie pasta
  'zucchini-parmesan': 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=600&h=600&fit=crop', // zucchini dish
};

async function downloadImage(id, url) {
  const outputPath = path.join(outputDir, `${id}.jpg`);
  if (fs.existsSync(outputPath)) {
    console.log(`  Skipping ${id} (exists)`);
    return;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);
    console.log(`  Downloaded ${id} (${(buffer.length / 1024).toFixed(0)}KB)`);
  } catch (err) {
    console.error(`  FAILED ${id}: ${err.message}`);
  }
}

async function main() {
  console.log(`Downloading ${Object.keys(images).length} food images...\n`);
  await Promise.all(Object.entries(images).map(([id, url]) => downloadImage(id, url)));
  console.log('\nDone!');
}

main();
