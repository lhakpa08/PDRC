import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Routes
app.post('/api/gemini/summarize-report', async (req, res) => {
  try {
    const { eventTitle, agency, date, participantsCount, attendanceRate, venue, feedbackNotes } = req.body;

    const prompt = `You are an executive rapporteur for the Professional Development and Research Centre (PDRC) at Tsirang, Bhutan.
Generate an official executive summary for a completed training/event report with the following details:
- Training/Event Title: ${eventTitle}
- Hosting Agency: ${agency}
- Date & Location: ${date} at ${venue}, PDRC Tsirang
- Participants Attended: ${participantsCount} (${attendanceRate}% attendance rate)
- Additional Feedback / Notes: ${feedbackNotes || 'Successful delivery with active participation.'}

Format the response as clean Markdown with the following sections:
1. Executive Overview & Objectives
2. Participation & Attendance Analysis
3. Key Learning Outcomes & Competencies Achieved
4. GNH (Gross National Happiness) & Civil Service Impact
5. Recommendations for Future Sessions

Keep the tone formal, professional, and institutional.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ success: true, summary: response.text });
  } catch (error: any) {
    console.error('Error generating summary:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate report summary' });
  }
});

app.post('/api/gemini/generate-agenda', async (req, res) => {
  try {
    const { topic, targetAgency, durationDays, targetAudience } = req.body;

    const prompt = `You are a curriculum lead at PDRC (Professional Development and Research Centre) Tsirang, Bhutan.
Create a structured day-by-day training agenda for:
- Topic: ${topic}
- Target Agency: ${targetAgency}
- Duration: ${durationDays} day(s)
- Audience: ${targetAudience}

Return a valid JSON object with the following schema:
{
  "title": "Official Training Title",
  "overview": "Short 2-sentence summary of the workshop",
  "learningOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3"],
  "schedule": [
    {
      "day": 1,
      "sessions": [
        {"time": "09:00 - 10:30 AM", "module": "Module Name", "description": "Details", "trainer": "Lead Facilitator"},
        {"time": "10:30 - 11:00 AM", "module": "Tea & Reflection Break", "description": "Networking", "trainer": "-"},
        {"time": "11:00 - 01:00 PM", "module": "Practical Application", "description": "Hands-on exercise", "trainer": "Trainer"}
      ]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, agenda: parsed });
  } catch (error: any) {
    console.error('Error generating agenda:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate training agenda' });
  }
});

app.post('/api/gemini/recommend-room', async (req, res) => {
  try {
    const { title, participantCount, requiredEquipment, format } = req.body;

    const prompt = `As the PDRC Tsirang Venue Allocation Specialist, recommend the best room setup for an event:
- Event Title: ${title}
- Participant Count: ${participantCount}
- Format: ${format} (e.g., Computer Workshop, Board Meeting, Large Conference, Interactive Seminar)
- Required Equipment: ${requiredEquipment?.join(', ') || 'Standard presentation'}

Available Rooms at PDRC Tsirang:
1. GNH Main Conference Hall (Capacity: 120, Stage, Dual Projector, PA System, Video Conf)
2. Rigsum Seminar Room A (Capacity: 45, Smartboard, Hybrid Cam, Modular Seating)
3. Druk IT & Computer Lab (Capacity: 30, 30 Workstations, Fiber Internet, Server Rack)
4. Tsirang Executive Boardroom (Capacity: 20, Ergonomic Seating, Smart Display, Audio Bar)
5. Kilkhorthang Research Lounge (Capacity: 25, Whiteboards, Soft Lounge Seating)
6. Damphu Multi-purpose Amphitheatre (Capacity: 200, Outdoor/Indoor stage, PA System)

Provide a JSON recommendation with:
{
  "recommendedRoomId": "room_id_code",
  "roomName": "Exact Room Name",
  "reasoning": "Clear explanation of why this fits capacity and equipment constraints",
  "suggestedLayout": "e.g. U-Shape / Theater / Classroom / Pods",
  "equipmentChecklist": ["Item 1", "Item 2"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, recommendation: parsed });
  } catch (error: any) {
    console.error('Error recommending room:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to recommend room' });
  }
});

// Vite Middleware for Dev Mode
async function startServer() {
  const PORT = process.env.PORT || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await import('fs').then((fs) =>
          fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8')
        );
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.use('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
