import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

const router = express.Router();
dotenv.config();

router.use(cors());
router.use(express.json());

router.get('/test-env', (req, res) => {
  res.json({
    hasKey: !!process.env.CLAUDE_API_KEY,
    keyLength: process.env.CLAUDE_API_KEY?.length || 0,
    keyStart: process.env.CLAUDE_API_KEY?.slice(0, 10) + '...'
  });
});

interface ClaudeAPIResponse {
  content: [{
    type: 'text';
    text: string;
  }];
  role: string;
  model: string;
  id: string;
  error?: {
    message: string;
  };
}

router.post('/claude', async (req, res) => {
  try {
    console.log('Request to Claude API:', req.body);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `${req.body.messages[0].content}\n\n${req.body.messages[1].content}`
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    console.log('Response from Claude API:', data);

    // Check for API error response
    if (!response.ok || data.error) {
      throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
    }

    res.json(data);
  } catch (error) {
    console.error('Error proxying to Claude API:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to communicate with Claude API'
    });
  }
});

export default router; 