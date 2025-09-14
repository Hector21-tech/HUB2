// Utility functions for handling player data transformations

export interface PlayerData {
  id: string
  tenantId: string
  firstName: string
  lastName: string
  dateOfBirth?: Date | null
  nationality?: string | null
  position?: string | null
  club?: string | null
  height?: number | null
  weight?: number | null
  notes?: string | null
  tags: string[]
  rating?: number | null
  createdAt: Date
  updatedAt: Date
}

export interface EnhancedPlayer extends Omit<PlayerData, 'position' | 'tags'> {
  positions: string[]
  avatarUrl?: string
  tags: string[]
}

/**
 * Transform database player data to enhanced player with positions array and avatar URL
 */
export function transformDatabasePlayer(dbPlayer: PlayerData): EnhancedPlayer {
  // Extract avatar URL from tags
  const avatarTag = dbPlayer.tags.find(tag => tag.startsWith('avatar:'))
  const avatarUrl = avatarTag ? avatarTag.replace('avatar:', '') : undefined

  // Remove avatar tag from regular tags
  const regularTags = dbPlayer.tags.filter(tag => !tag.startsWith('avatar:'))

  // Convert position string to positions array
  const positions = dbPlayer.position
    ? dbPlayer.position.split(', ').map(p => p.trim()).filter(p => p.length > 0)
    : []

  return {
    ...dbPlayer,
    positions,
    avatarUrl,
    tags: regularTags
  }
}

/**
 * Transform enhanced player data back to database format
 */
export function transformToDatabase(player: Partial<EnhancedPlayer>): Partial<PlayerData> {
  const { positions, avatarUrl, tags = [], ...rest } = player

  return {
    ...rest,
    position: positions && positions.length > 0 ? positions.join(', ') : null,
    tags: [...tags, ...(avatarUrl ? [`avatar:${avatarUrl}`] : [])]
  }
}

/**
 * Get avatar URL from player tags
 */
export function getAvatarUrl(tags: string[]): string | undefined {
  const avatarTag = tags.find(tag => tag.startsWith('avatar:'))
  return avatarTag ? avatarTag.replace('avatar:', '') : undefined
}

/**
 * Get positions array from position string
 */
export function getPositionsArray(position: string | null | undefined): string[] {
  if (!position) return []
  return position.split(', ').map(p => p.trim()).filter(p => p.length > 0)
}