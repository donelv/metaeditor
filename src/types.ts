export interface Metavertex {
  name: string
  Attribute?: Attribute[]
  Metavertex?: Metavertex[] | Metavertex
  MetavertexRef?: any
  MetavertexInverseRef?: { ref: string } | { ref: string }[]
  Edge?: { to: string } | { to: string }[]
}

export interface LevelMap {
  [name: string]: number
}
export interface ParentMap {
  [childName: string]: Set<string>
}

export interface VertexMap {
  [name: string]: Metavertex
}

export type Edge = {
  from: string
  to: string
  type: 'edge'
  name?: string
  directed?: boolean
  attribute?: any
  raw?: any // полное исходное содержимое ребра
}

export interface Attribute {
  name: string
  type?: string
  system?: string | boolean
  ['#text']?: string
}
