export type Tier = 'POWER4' | 'UPPER_MID' | 'MID' | 'LOW_MAJOR';

export interface TeamSummary { id: number; name: string; mascot?: string; conference: string; conferenceId: number; tier: Tier; prestige: number; record: string }
export interface ConferenceSummary { id: number; name: string; tier: Tier; prestige: number; memberCount: number; mediaDealValue: number }
export interface PlayerSummary { id: number; name: string; team: string; teamId: number; position: string; classYear: string; overall: number; heightInches: number }
export interface CoachSummary { id: number; name: string; role: string; team: string; overall: number; recruiting: number; development: number }
export interface RecruitSummary { id: number; name: string; position: string; starRating: number; compositeScore: number; state: string; scoutedOverallRange: [number, number]; scoutedPotentialRange: [number, number] }

export interface Paginated<T> { page: number; pageSize: number; total: number; data: T[] }
