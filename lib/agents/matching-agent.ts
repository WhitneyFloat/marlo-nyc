import Anthropic from '@anthropic-ai/sdk'
import type { ChildProfile, MatchResult } from '@/types'
import type { Program } from '@/types'

const client = new Anthropic()

interface MatchAgentProgram {
  id: string
  name: string
  category: string
  neighborhood: string | null
  priceMonthly: number | null
  scheduleDays: string[]
  scheduleTime: string | null
  spotsRemaining: number | null
  tags: string[]
  ageMin: number | null
  ageMax: number | null
  earlyDropoff: boolean
  earlyDropoffTime?: string | null
  allergySafe: boolean
  allergyNotes?: string | null
  description: string | null
}

function toAgentProgram(p: Program): MatchAgentProgram {
  return {
    id:              p.id,
    name:            p.name,
    category:        p.category,
    neighborhood:    p.provider?.neighborhood ?? null,
    priceMonthly:    p.price_monthly,
    scheduleDays:    p.schedule_days,
    scheduleTime:    p.schedule_time,
    spotsRemaining:  p.spots_remaining,
    tags:            p.tags,
    ageMin:          p.age_min,
    ageMax:          p.age_max,
    earlyDropoff:    p.early_dropoff,
    earlyDropoffTime: p.early_dropoff_time,
    allergySafe:     p.allergy_safe,
    allergyNotes:    p.allergy_notes,
    description:     p.description,
  }
}

const SYSTEM_PROMPT = `You are Marlo's matching agent. Your job is to find the best activity programs for a specific child based on their profile and a parent's request.

You must return EXACTLY 3 matches, ranked from best fit to third-best fit.
You must return valid JSON only — no preamble, no explanation outside the JSON.

Scoring criteria (weight each):
- Schedule compatibility: Does the program's days/times work for the child? (25%)
- Interest alignment: Does the category match the child's interests? (25%)
- Budget fit: Is the price within the family's budget? (20%)
- Safety requirements: Allergy-safe, accommodations available? (20%)
- Location proximity: Is the neighborhood close to the family? (10%)

Return format:
{
  "matches": [
    {
      "programId": "uuid",
      "matchScore": 94,
      "matchReasons": ["schedule_fit", "allergy_safe", "interest_align", "budget_match"],
      "explanation": "Brooklyn Soccer Academy offers early drop-off from 7:45am, has confirmed peanut-free facilities, and fits within your $200/month budget — all matching Maya's profile exactly."
    }
  ]
}`

export async function runMatchingAgent(
  child: ChildProfile,
  query: string,
  programs: Program[]
): Promise<MatchResult[]> {
  const agentPrograms = programs.map(toAgentProgram)

  const userMessage = `
CHILD PROFILE:
Name: ${child.name}
Age: ${child.age}
Interests: ${child.interests.join(', ')}
Available days: ${child.schedule.join(', ')}
Allergies: ${child.allergies.join(', ') || 'none'}
Special needs: ${child.needs.join(', ') || 'none'}
Monthly budget: $${child.budgetMax}
Neighborhood: ${child.neighborhood}

PARENT REQUEST:
"${query}"

AVAILABLE PROGRAMS:
${JSON.stringify(agentPrograms, null, 2)}

Return the 3 best matches as JSON.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type from matching agent')

  const parsed = JSON.parse(content.text)
  if (!Array.isArray(parsed.matches)) throw new Error('Matching agent returned invalid format')

  return parsed.matches.slice(0, 3)
}
