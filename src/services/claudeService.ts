import { SimulationState } from '../types';
import { getCountryName } from './countryService';

interface PolicyHistoryEntry {
  id: string;
  name: string;
  startDay: number;
  endDay?: number;
}

interface SimulationContext {
  day: number;
  activeCases: number;
  totalDeaths: number;
  totalVaccinated: number;
  population: number;
  activePolicies: string[];
  policyHistory: PolicyHistoryEntry[];
  selectedCountry?: string;
  countryName?: string;
}

function formatSimulationContext(
  state: SimulationState,
  activePolicies: Set<string>,
  policyHistory: PolicyHistoryEntry[]
): SimulationContext {
  const countryName = state.selectedCountry 
    ? getCountryName(state.selectedCountry)
    : undefined;

  return {
    day: state.day,
    activeCases: state.infected,
    totalDeaths: state.deceased,
    totalVaccinated: state.totalVaccinated,
    population: state.population,
    activePolicies: Array.from(activePolicies),
    policyHistory,
    selectedCountry: state.selectedCountry,
    countryName
  };
}

interface ClaudeResponse {
  content: [{
    type: 'text';
    text: string;
  }];
  role: string;
  model: string;
  id: string;
}

export async function sendMessageToClaude(
  message: string, 
  state: SimulationState,
  activePolicies: Set<string>,
  policyHistory: PolicyHistoryEntry[] = []
): Promise<string> {
  const context = formatSimulationContext(state, activePolicies, policyHistory);
  
  const politicalLeanings = [
    'right-wing',
    'centre-right',
    'centrist',
    'centre-left',
    'left-wing'
  ];
  
  const randomLeaning = politicalLeanings[Math.floor(Math.random() * politicalLeanings.length)];
  
  const journalistContext = context.countryName 
    ? `You are a ${randomLeaning} journalist based in ${context.countryName}.`
    : `You are a news journalist, writing from a ${randomLeaning} perspective.`;
  
  const systemPrompt = `${journalistContext}

Current situation (Day ${context.day}):
- Active infections: ${context.activeCases.toLocaleString()}
- Total deaths: ${context.totalDeaths.toLocaleString()}
- Vaccination progress: ${context.totalVaccinated.toLocaleString()}
- Population: ${context.population.toLocaleString()}${context.countryName ? ` (${context.countryName})` : ''}
- Currently active measures: ${context.activePolicies.join(', ') || 'None'}

Policy History:
${context.policyHistory.length > 0 
  ? context.policyHistory.map(p => 
      `- ${p.name}: Started on Day ${p.startDay}${p.endDay ? `, Ended on Day ${p.endDay}` : ' (Still active)'}`
    ).join('\n')
  : 'No policies have been implemented yet'}

Generate a news story that reflects a ${randomLeaning} political perspective in the following JSON format:
{
  "headline": "Catchy headline here",
  "newspaper": "Name of newspaper (${context.countryName ? `choose a realistic newspaper name from ${context.countryName}` : 'choose one that matches the political perspective'}, but make it subtle and unique)",
  "content": "The main story content here. Make it concise and punchy, reflecting ${randomLeaning} views on public health, government intervention, and economic impacts${context.countryName ? ` from a ${context.countryName} perspective` : ''}. Keep it short."
}`;

  try {
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ClaudeResponse = await response.json();
    console.log('Claude API Response:', data);
    
    if (!data.content?.[0]?.text) {
      console.log('Invalid response structure:', data);
      throw new Error('Invalid response format from Claude API');
    }

    return data.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
} 