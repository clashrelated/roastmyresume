import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { insertResumeSchema } from '@shared/schema';
import { roastResume, analyzeResume, rewriteResume } from "./openai";
import { handleContactForm } from "./contact";
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file storage
const storage_config = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    // Generate a unique filename with timestamp
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Configure file filter to accept only PDF and DOCX
const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'));
  }
};

// Configure multer upload
const upload = multer({
  storage: storage_config,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Function to extract text from PDF files
async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF file');
  }
}

// Function to extract text from DOCX files
async function extractTextFromDOCX(filePath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX file');
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Resume upload endpoint
  app.post('/api/resume', upload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          message: 'No file uploaded or file is invalid.' 
        });
      }
      
      // Get file details
      const { filename, originalname, size, mimetype, path: filePath } = req.file;
      
      // Save resume details to storage
      const fileData = {
        filename,
        originalName: originalname,
        fileSize: size,
        mimeType: mimetype,
        filePath,
        uploadedAt: new Date(), // Use actual Date object instead of string
      };
      
      // Validate data with schema
      const resumeData = insertResumeSchema.parse(fileData);
      
      // Save resume to storage
      const savedResume = await storage.saveResume(resumeData);
      
      // Return success response
      res.status(201).json({
        message: 'Resume uploaded successfully',
        resume: savedResume,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  });

  // Endpoint for extracting text from a resume file
  app.post('/api/extract-text', upload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          message: 'No file uploaded or file is invalid.' 
        });
      }
      
      // Get file details
      const { mimetype, path: filePath } = req.file;
      
      // Extract text based on file type
      let extractedText = '';
      
      if (mimetype === 'application/pdf') {
        extractedText = await extractTextFromPDF(filePath);
      } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        extractedText = await extractTextFromDOCX(filePath);
      } else {
        // Clean up the file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        return res.status(400).json({ 
          message: 'Invalid file type. Only PDF and DOCX files are supported for text extraction.' 
        });
      }
      
      // Clean up the temporary file after extraction
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Return the extracted text
      res.status(200).json({ 
        message: 'Resume text extracted successfully',
        text: extractedText
      });
    } catch (error) {
      // Clean up file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred during text extraction' });
      }
    }
  });

  // New endpoint to roast a resume using OpenAI
  app.post('/roast', async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string' || text.trim() === '') {
        return res.status(400).json({
          message: 'Please provide valid resume text to roast'
        });
      }
      
      // Generate a humorous roast using OpenAI
      const roastText = await roastResume(text);
      
      // Return the roast
      res.status(200).json({
        message: 'Resume roasted successfully',
        roast: roastText
      });
    } catch (error) {
      console.error('Error roasting resume:', error);
      
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred during resume roasting' });
      }
    }
  });

  // New endpoint to provide professional resume analysis using OpenAI
  app.post('/analyze', async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string' || text.trim() === '') {
        return res.status(400).json({
          message: 'Please provide valid resume text to analyze'
        });
      }
      
      // Generate a professional analysis using OpenAI
      const analysis = await analyzeResume(text);
      
      // Return the analysis
      res.status(200).json({
        message: 'Resume analyzed successfully',
        analysis
      });
    } catch (error) {
      console.error('Error analyzing resume:', error);
      
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred during resume analysis' });
      }
    }
  });

  // New endpoint to rewrite a resume using OpenAI
  app.post('/rewrite', async (req, res) => {
    try {
      const { text, originalFormat, preserveFormat } = req.body;
      
      if (!text || typeof text !== 'string' || text.trim() === '') {
        return res.status(400).json({
          message: 'Please provide valid resume text to rewrite'
        });
      }
      
      // Generate rewritten resume using OpenAI, preserving format if requested
      const rewrittenText = await rewriteResume(text, { preserveFormat, originalFormat });
      
      // Return the rewritten text
      res.status(200).json({
        message: 'Resume rewritten successfully',
        rewrittenText
      });
    } catch (error) {
      console.error('Error rewriting resume:', error);
      
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred during resume rewriting' });
      }
    }
  });

  // Contact form endpoint
  app.post('/api/contact', async (req, res) => {
    console.log('Contact form endpoint hit');
    await handleContactForm(req, res);
  });

  const httpServer = createServer(app);
  return httpServer;
}
