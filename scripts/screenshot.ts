import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const projects = [
  { name: 'tuklas', url: 'https://tuklasjobs.vercel.app' },
  { name: 'strenghtswriter', url: 'https://strenghtswriter.vercel.app/' },
  { name: 'dev-frame', url: 'https://dev-frame-nine.vercel.app' },
];

const outputDir = join(process.cwd(), 'public', 'static', 'projects');

async function captureScreenshots() {
  console.log('🚀 Starting screenshot capture...');

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set a common desktop viewport
  await page.setViewportSize({ width: 1280, height: 720 });

  for (const project of projects) {
    const outputPath = join(outputDir, `${project.name}.png`);
    
    console.log(`📸 Capturing ${project.name} from ${project.url}...`);
    
    try {
      await page.goto(project.url, { waitUntil: 'networkidle', timeout: 60000 });
      
      // Wait a bit for any late-loading animations
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: outputPath });
      console.log(`✅ Saved to ${outputPath}`);
    } catch (error) {
      console.error(`❌ Failed to capture ${project.name}:`, error);
    }
  }

  await browser.close();
  console.log('✨ All screenshots captured!');
}

captureScreenshots().catch(console.error);
