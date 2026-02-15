import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const recipesPath = path.join(__dirname, '..', 'src', 'data', 'recipes.json');
const outputDir = path.join(__dirname, '..', 'public', 'recipes');

const API_KEY = 'AIzaSyCfM0rtvoIX2e4OphgWbdLQ0nFzzxWG2pg';
const MODEL = 'gemini-2.5-flash-image';

const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf-8'));

async function generateImage(recipe) {
  const outputPath = path.join(outputDir, `${recipe.id}.jpg`);

  const prompt = `Generate an image: beautiful overhead food photography of "${recipe.name}" - a Swedish home-cooked dinner. The dish contains: ${recipe.ingredients.join(', ')}. Shot on a warm wooden table with natural light, styled like a cozy Scandinavian home kitchen. Appetizing, rustic, inviting. Photo-realistic. No text or watermarks.`;

  console.log(`  Generating ${recipe.id}...`);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`  FAILED ${recipe.id}: ${response.status} ${errorText.slice(0, 200)}`);
    return false;
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find(p => p.inlineData);

  if (!imagePart) {
    console.error(`  No image in response for ${recipe.id}`);
    return false;
  }

  const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
  fs.writeFileSync(outputPath, imageBuffer);
  console.log(`  Saved ${recipe.id} (${(imageBuffer.length / 1024).toFixed(0)}KB)`);
  return true;
}

async function main() {
  // Skip salsicciapasta since we just generated it
  const toGenerate = recipes.filter(r => r.id !== 'salsicciapasta');
  console.log(`Generating ${toGenerate.length} food images (salsicciapasta already done)...\n`);

  let success = 1; // counting salsicciapasta
  for (const recipe of toGenerate) {
    try {
      const ok = await generateImage(recipe);
      if (ok) success++;
    } catch (err) {
      console.error(`  ERROR ${recipe.id}:`, err.message);
    }
    // Delay to respect rate limits
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log(`\nDone! ${success}/${recipes.length} images generated.`);
}

main();
