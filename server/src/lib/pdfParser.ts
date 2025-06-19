// src/lib/pdfParser.ts
import pdf from 'pdf-parse'

export async function getTextFromPdf(fileBuffer: Buffer): Promise<string> {
  try {
    const data = await pdf(fileBuffer)
    return data.text
  } catch (error) {
    console.error('Failed to parse PDF:', error)
    throw new Error('Could not process the PDF file.')
  }
}
