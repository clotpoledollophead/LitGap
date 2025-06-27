// Module for extracting text from PDF files

// Set PDF.js worker source
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
}

import { apiService } from './apiService.js';

export const pdfExtractor = {
  async extractText(file) {
      return new Promise((resolve, reject) => {
          if (!window.pdfjsLib) {
              reject(new Error('PDF.js library not loaded'));
              return;
          }

          const fileReader = new FileReader();
          
          fileReader.onload = async (event) => {
              try {
                  const typedArray = new Uint8Array(event.target.result);
                  
                  // Initialize PDF.js
                  const loadingTask = pdfjsLib.getDocument({ data: typedArray });
                  const pdf = await loadingTask.promise;
                  
                  let fullText = '';
                  
                  // Extract text from each page
                  for (let i = 1; i <= pdf.numPages; i++) {
                      const page = await pdf.getPage(i);
                      const textContent = await page.getTextContent();
                      
                      const pageText = textContent.items.map(item => item.str).join(' ');
                      fullText += pageText + ' ';
                  }
                  
                  resolve(fullText.trim());
              } catch (error) {
                  console.error('PDF extraction error:', error);
                  reject(error);
              }
          };
          
          fileReader.onerror = (error) => {
              reject(error);
          };
          
          fileReader.readAsArrayBuffer(file);
      });
  },
  
  // Updated function to use LLM instead of regex
  async extractSections(text) {
      // Prepare a prompt for the LLM to extract sections
      const prompt = `
          Analyze the following text and extract very concise summaries for each of the following, strictly keeping each under 70 words:

          1. Methodology (max 70 words)
          2. Key findings (max 70 words)
          3. Limitations (max 70 words)

          Use compact language and bullet points where appropriate. Stay factual and neutral.
          
          IMPORTANT FORMATTING INSTRUCTIONS:
          - Use [[term]] syntax to highlight key concepts or important terms but not too frequently
          - Use **bold text** for section headings or critical points
          - Stay factual and neutral

          Format your response as JSON:
          {
          "methodology": "Brief description of methods used (max 70 words)",
          "findings": "Brief list of key findings (max 70 words)",
          "limitations": "Brief list of limitations (max 70 words)"
          }

          Paper text:
          ${text}
      `;
      
      try {
          // Call LLM to extract sections
          const extractedSections = await apiService.callLLM(prompt);
          return extractedSections;
      } catch (error) {
          console.error('Error extracting sections with LLM:', error);
          // Fallback with empty sections if LLM extraction fails
          return {
              methodology: '',
              findings: '',
              limitations: '',
              abstract: ''
          };
      }
  }
};
