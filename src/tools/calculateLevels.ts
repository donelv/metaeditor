import type { LevelMap, Metavertex, ParentMap, VertexMap } from '../types'

export const calculateLevelsFull = (
  parsed: any
): {
  levelMap: LevelMap
  vertexMap: VertexMap
} => {
  const levelMap: LevelMap = {}
  const vertexMap: VertexMap = {}
  const parentMap: ParentMap = {}

  const metagraph = parsed?.MetagraphRoot?.Metagraph
  if (!metagraph || typeof metagraph !== 'object') {
    console.warn('calculateLevels: нет данных метаграфа', parsed)
    return { levelMap, vertexMap }
  }

  // Сбор вершин и построение зависимостей
  const collectVertices = (_node: any, parentName?: string) => {
    const node = { ..._node }

    if (!node?.name || typeof node.name !== 'string') return

    // Нормализация Attribute → массив
    if (node.Attribute && !Array.isArray(node.Attribute)) {
      node.Attribute = [node.Attribute]
    }

    // Нормализация Edge → массив
    if (node.Edge && !Array.isArray(node.Edge)) {
      node.Edge = [node.Edge]
    }

    vertexMap[node.name] = node as Metavertex

    if (parentName) {
      if (!parentMap[node.name]) parentMap[node.name] = new Set()
      parentMap[node.name].add(parentName)
    }

    if (node.Metavertex) {
      const children = Array.isArray(node.Metavertex)
        ? node.Metavertex
        : [node.Metavertex]
      children.forEach((child: any) => collectVertices(child, node.name))
    }

    if (node.MetavertexRef) {
      const refs = Array.isArray(node.MetavertexRef)
        ? node.MetavertexRef
        : [node.MetavertexRef]
      refs.forEach((ref: any) => {
        if (!ref?.ref) return
        if (!parentMap[ref.ref]) parentMap[ref.ref] = new Set()
        parentMap[ref.ref].add(node.name)
      })
    }

    if (node.MetavertexInverseRef) {
      const refs = Array.isArray(node.MetavertexInverseRef)
        ? node.MetavertexInverseRef
        : [node.MetavertexInverseRef]
      refs.forEach((ref: any) => {
        if (!ref?.ref) return
        if (!parentMap[ref.ref]) parentMap[ref.ref] = new Set()
        parentMap[ref.ref].add(node.name)
      })
    }
  }

  const allValues = Object.values(metagraph) as any[]
  allValues.forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach((v) => collectVertices(v))
    } else if (value?.name) {
      collectVertices(value)
    }
  })

  // Расчёт уровней
  const setLevel = (name: string, newLevel: number) => {
    if (levelMap[name] === undefined || levelMap[name] < newLevel) {
      levelMap[name] = newLevel
      const node = vertexMap[name]
      if (!node) return

      if (node.Metavertex) {
        const children = Array.isArray(node.Metavertex)
          ? node.Metavertex
          : [node.Metavertex]
        children.forEach((child) => setLevel(child.name, newLevel + 1))
      }

      if (node.MetavertexRef) {
        const refs = Array.isArray(node.MetavertexRef)
          ? node.MetavertexRef
          : [node.MetavertexRef]
        refs.forEach((ref) => ref?.ref && setLevel(ref.ref, newLevel + 1))
      }

      if (node.MetavertexInverseRef) {
        const refs = Array.isArray(node.MetavertexInverseRef)
          ? node.MetavertexInverseRef
          : [node.MetavertexInverseRef]
        refs.forEach((ref) => ref?.ref && setLevel(ref.ref, newLevel + 1))
      }
    }
  }

  const updateParents = () => {
    const queue: Set<string> = new Set(Object.keys(levelMap))

    while (queue.size > 0) {
      const current = queue.values().next().value
      if (!current) continue
      queue.delete(current)

      const currentLevel = levelMap[current]
      const parents = parentMap[current]
      if (!parents) continue

      for (const parent of parents) {
        const desired = currentLevel - 1
        if (levelMap[parent] === undefined || levelMap[parent] < desired) {
          levelMap[parent] = desired
          queue.add(parent)
        }
      }
    }
  }

  const updateChildrenFromParents = () => {
    let changed = true
    while (changed) {
      changed = false
      for (const name in vertexMap) {
        const parentLevel = levelMap[name]
        if (parentLevel === undefined) continue
        const node = vertexMap[name]

        const update = (refName: string | undefined) => {
          if (!refName) return
          const current = levelMap[refName]
          const desired = parentLevel + 1
          if (current === undefined || current < desired) {
            levelMap[refName] = desired
            changed = true
          }
        }

        if (node.Metavertex) {
          const children = Array.isArray(node.Metavertex)
            ? node.Metavertex
            : [node.Metavertex]
          children.forEach((c) => update(c.name))
        }

        if (node.MetavertexRef) {
          const refs = Array.isArray(node.MetavertexRef)
            ? node.MetavertexRef
            : [node.MetavertexRef]
          refs.forEach((ref) => update(ref?.ref))
        }

        if (node.MetavertexInverseRef) {
          const refs = Array.isArray(node.MetavertexInverseRef)
            ? node.MetavertexInverseRef
            : [node.MetavertexInverseRef]
          refs.forEach((ref) => update(ref?.ref))
        }
      }
    }
  }

  // 🔁 Запуск всех фаз
  allValues.forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach((v: any) => v?.name && setLevel(v.name, 0))
    } else if (value?.name) {
      setLevel(value.name, 0)
    }
  })

  updateParents()
  updateChildrenFromParents()

  return { levelMap, vertexMap }
}
