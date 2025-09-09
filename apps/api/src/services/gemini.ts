const schema = {
  fileId: 'string',
  fileName: 'string',
  vendor: { name: 'string', address: 'string?', taxId: 'string?' },
  invoice: {
    number: 'string',
    date: 'string',
    currency: 'string?',
    subtotal: 'number?',
    taxPercent: 'number?',
    total: 'number?',
    poNumber: 'string?',
    poDate: 'string?',
    lineItems: 'Array<{ description: string, unitPrice: number, quantity: number, total: number }>'
  },
  createdAt: 'string',
  updatedAt: 'string?'
};

function buildPrompt(): string {
  return `You are an expert at parsing invoices from PDFs. Extract JSON exactly in this TypeScript-like shape without extra commentary:\n${JSON.stringify(
    schema,
    null,
    2
  )}\nRules:\n- Only output minified JSON.\n- Dates as ISO-8601 (YYYY-MM-DD if day known, else YYYY-MM).\n- Numbers as numbers, not strings.\n- If unknown, omit optional fields.`;
}

export async function extractInvoice(pdfBuffer: Buffer): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY missing');

  const prompt = buildPrompt();
  const base64Data = pdfBuffer.toString('base64');

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: 'application/pdf',
              data: base64Data
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      topK: 32,
      topP: 1,
      maxOutputTokens: 4096,
    }
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const text = result.candidates[0].content.parts[0].text;
    
    // Try to extract JSON even if model returns with code fences
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : text;
    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse JSON response from Gemini: ${error.message}`);
    }
    throw error;
  }
}