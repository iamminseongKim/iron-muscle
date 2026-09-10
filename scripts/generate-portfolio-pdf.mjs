import puppeteer from 'puppeteer-core';
import { readFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const htmlPath = '/Users/minseong/.gemini/antigravity/brain/4b359622-ecbd-4d96-92a5-0bfa5769ffbf/portfolio_showcase.html';
const pdfPathRepo = join('/Users/minseong/study/iron-muscle', 'IronMuscle_v3.9.0_Portfolio.pdf');
const pdfPathArtifact = '/Users/minseong/.gemini/antigravity/brain/4b359622-ecbd-4d96-92a5-0bfa5769ffbf/IronMuscle_v3.9.0_Portfolio.pdf';

console.log('Launching browser to render PDF...');
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: [
    '--enable-webgl',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--no-sandbox'
  ]
});

try {
  const page = await browser.newPage();
  // 1200px width for desktop layout
  await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });

  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  // PDF 전용 인쇄 스타일 주입 (버튼 숨김, 섹션 페이지 분할 방지, 고화질 렌더링)
  await page.addStyleTag({
    content: `
      @page {
        size: A4;
        margin: 12mm 10mm 12mm 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          background-color: #0B0C10 !important;
        }
        header button, header a {
          display: none !important;
        }
        section {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
          margin-bottom: 24px !important;
        }
        .phone-mockup {
          max-width: 250px !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important;
        }
      }
    `
  });

  await new Promise(r => setTimeout(r, 1200));

  console.log('Generating A4 PDF...');
  await page.pdf({
    path: pdfPathRepo,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '12mm',
      bottom: '12mm',
      left: '10mm',
      right: '10mm'
    }
  });

  copyFileSync(pdfPathRepo, pdfPathArtifact);
  console.log('SUCCESS: PDF exported to:', pdfPathRepo, 'and', pdfPathArtifact);
} finally {
  await browser.close();
}
