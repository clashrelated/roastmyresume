import { Document, Packer, Paragraph, TextRun } from 'docx';
import { jsPDF } from "jspdf";

/**
 * Generates a DOCX document from text and triggers a download
 * @param text Content to be included in the document
 * @param filename Name of the file to download
 */
export const generateAndDownloadDocx = async (text: string, filename: string = 'resume'): Promise<void> => {
  try {
    // Split the text into paragraphs
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    
    // Create a new document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs.map(paragraph => 
            new Paragraph({
              children: [
                new TextRun({
                  text: paragraph,
                  size: 24, // 12pt font
                }),
              ],
            })
          ),
        },
      ],
    });
    
    // Generate the document as a blob
    const blob = await Packer.toBlob(doc);
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.docx`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating DOCX:', error);
    return Promise.reject(error);
  }
};

/**
 * Generates a PDF document from text and triggers a download
 * @param text Content to be included in the document
 * @param filename Name of the file to download
 */
export const generateAndDownloadPdf = (text: string, filename: string = 'resume'): void => {
  try {
    const doc = new jsPDF();
    
    // Split the text by newlines
    const lines = text.split('\n');
    
    let yPos = 10;
    const lineHeight = 7;
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth() - (margin * 2);
    
    lines.forEach(line => {
      if (line.trim() === '') {
        yPos += lineHeight / 2;
        return;
      }
      
      // Add text with word wrapping
      const textLines = doc.splitTextToSize(line, pageWidth);
      textLines.forEach((textLine: string) => {
        // Check if we need a new page
        if (yPos > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.text(textLine, margin, yPos);
        yPos += lineHeight;
      });
    });
    
    // Save the PDF
    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};