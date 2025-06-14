import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { createAppAsyncThunk } from './withTypes'
import { XMLParser } from 'fast-xml-parser'
import type { Edge, Metavertex } from '../types'

export interface MetagraphRoot {
  Metagraph: Metavertex[]
}

export interface MetagraphState {
  metagraph: {
    MetagraphRoot?: MetagraphRoot
  }
}

const initialState: MetagraphState = {
  metagraph: {},
}

export const getXML = createAppAsyncThunk(
  'metaeditor/requestXML',
  async (_, thunkAPI) => {
    try {
      const response = await fetch('/example_courses_iu5.xml')
      const xmlString = await response.text()

      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
      })

      const jsonObj = parser.parse(xmlString)

      return jsonObj
    } catch (error) {
      return thunkAPI.rejectWithValue('Ошибка загрузки XML')
    }
  }
)

export const metagraphSlice = createSlice({
  name: 'metaeditor',
  initialState,
  reducers: {
    addMetavertex: (state, action: PayloadAction<Metavertex>) => {
      const list = state.metagraph.MetagraphRoot?.Metagraph
      if (list) {
        list.push(action.payload)
      } else {
        state.metagraph.MetagraphRoot = { Metagraph: [action.payload] }
      }
    },

    deleteMetavertex: (state, action: PayloadAction<string>) => {
      const name = action.payload
      const list = state.metagraph.MetagraphRoot?.Metagraph
      if (!list) return

      state.metagraph.MetagraphRoot!.Metagraph = list.filter(
        (v) => v.name !== name
      )
    },

    updateMetavertex: (state, action: PayloadAction<Metavertex>) => {
      const updated = action.payload
      const list = state.metagraph.MetagraphRoot?.Metagraph
      if (!list) return

      const index = list.findIndex((v) => v.name === updated.name)
      if (index !== -1) list[index] = updated
    },

    addEdge: (state, action: PayloadAction<Edge>) => {
      const edge = action.payload
      const list = state.metagraph.MetagraphRoot?.Metagraph
      if (!list) return

      // ищем первую вершину, у которой есть Edge[]
      const container = list.find((v) => Array.isArray(v.Edge) || v.Edge)
      if (!container) return

      if (!container.Edge) {
        container.Edge = [
          edge.raw ?? {
            name: edge.name,
            StartVertexRef: { ref: edge.from },
            EndVertexRef: { ref: edge.to },
          },
        ]
      } else if (Array.isArray(container.Edge)) {
        container.Edge.push(
          edge.raw ?? {
            name: edge.name,
            StartVertexRef: { ref: edge.from },
            EndVertexRef: { ref: edge.to },
          }
        )
      } else {
        container.Edge = [
          container.Edge,
          edge.raw ?? {
            name: edge.name,
            StartVertexRef: { ref: edge.from },
            EndVertexRef: { ref: edge.to },
          },
        ]
      }
    },

    deleteEdge: (state, action: PayloadAction<string>) => {
      const name = action.payload
      const list = state.metagraph.MetagraphRoot?.Metagraph
      if (!list) return

      const container = list.find((v) => v.Edge)
      if (!container || !container.Edge) return

      if (Array.isArray(container.Edge)) {
        container.Edge = container.Edge.filter((e: any) => e.name !== name)
      } else if ((container.Edge as any)?.name === name) {
        delete container.Edge
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getXML.fulfilled, (state, action) => {
      state.metagraph = action.payload
    })
  },
})

export default metagraphSlice.reducer
