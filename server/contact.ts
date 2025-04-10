import { Request, Response } from 'express';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Verify Resend API key is loaded
console.log('Environment Check:', {
  RESEND_API_KEY_SET: !!process.env.RESEND_API_KEY,
  CONTACT_EMAIL_SET: !!process.env.CONTACT_EMAIL
});

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function handleContactForm(req: Request, res: Response) {
  try {
    console.log('Received contact form submission:', req.body);
    const { name, email, subject, message }: ContactFormData = req.body;

    if (!name || !email || !subject || !message) {
      console.error('Missing required fields:', { name, email, subject, message });
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Verify API key is set
    if (!process.env.RESEND_API_KEY) {
      console.error('Missing Resend API key');
      throw new Error('Email configuration is missing');
    }

    const emailContent = `
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
    `;

    const htmlContent = `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Subject:</strong> ${subject}</p>
<h3>Message:</h3>
<p>${message.replace(/\n/g, '<br>')}</p>
    `;

    console.log('Attempting to send email via Resend...');

    const data = await resend.emails.send({
      from: 'Resume Roaster <onboarding@resend.dev>',
      to: [process.env.CONTACT_EMAIL || 'bhabishyabhattnepal@gmail.com'],
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      text: emailContent,
      html: htmlContent,
    });

    console.log('Email sent successfully via Resend:', data);

    res.status(200).json({ message: 'Contact form submitted successfully' });
  } catch (error) {
    console.error('Error processing contact form:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Detailed error:', errorMessage);
    
    res.status(500).json({ 
      error: 'Failed to process contact form submission',
      details: errorMessage
    });
  }
} 