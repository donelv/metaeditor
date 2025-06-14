// import type { LevelMap, VertexMap, Metavertex } from './calculateLevelsFull'

// import type { LevelMap } from "../types"
import type { LevelMap, Metavertex, VertexMap } from './calculateLevels'

export const groupByLevel = (
  levelMap: LevelMap,
  vertexMap: VertexMap
): Record<number, Metavertex[]> => {
  const grouped: Record<number, Metavertex[]> = {}
  for (const name in levelMap) {
    const level = levelMap[name]
    const vertex = vertexMap[name]
    if (!grouped[level]) grouped[level] = []
    grouped[level].push(vertex)
  }
  return grouped
}
