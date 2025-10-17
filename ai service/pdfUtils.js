import fs from 'fs/promises';
import { existsSync } from 'fs';

/**
 * Read a PDF file and convert to base64
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} Base64 encoded PDF content
 */
export async function readPdfAsBase64(filePath) {
  try {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const buffer = await fs.readFile(filePath);
    return buffer.toString('base64');
  } catch (error) {
    console.error('Error reading PDF file:', error);
    throw error;
  }
}

/**
 * Generate questions from a PDF file
 * @param {string} pdfPath - Path to the PDF file
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Generated questions
 */
export async function generateQuestionsFromPDF(pdfPath, options = {}) {
  const { generateQuestions } = await import('./questionGenerator.js');
  
  const pdfContent = await readPdfAsBase64(pdfPath);
  
  return await generateQuestions({
    pdfContent,
    pdfMimeType: 'application/pdf',
    ...options
  });
}

export default {
  readPdfAsBase64,
  generateQuestionsFromPDF
};
