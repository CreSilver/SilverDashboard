import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * POST /api/upload
 * Zpracuje nahrávaný soubor a bezpečně ho uloží na lokální disk.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Žádný soubor nebyl odeslán.' }, { status: 400 });
    }

    // Převedeme soubor na Node.js Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Cesta do public/uploads v kořeni projektu
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Pojistka: Pokud složka public/uploads neexistuje, vytvoříme ji
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Vytvoříme bezpečný unikátní název (timestamp + vyčištěné jméno)
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${safeName}`;
    const filePath = path.join(uploadDir, filename);

    // Fyzický zápis souboru na disk počítače
    fs.writeFileSync(filePath, buffer);

    // Vrátíme statickou URL adresu, kterou Next.js umí okamžitě servírovat
    return NextResponse.json({ imageUrl: `/uploads/${filename}` }, { status: 200 });
  } catch (error) {
    console.error('Chyba při nahrávání obrázku na disk:', error);
    return NextResponse.json({ error: 'Nepodařilo se uložit obrázek.' }, { status: 500 });
  }
}