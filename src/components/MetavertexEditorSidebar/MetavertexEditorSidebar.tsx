import React, { useState } from 'react'
import type { Metavertex } from '../../types'

interface Props {
  vertex: Metavertex | null
  onClose?: () => void
  onLinkAdd: (type: 'nest' | 'ref' | 'inv', target: string) => void
  allVertices: Metavertex[]
}

const MetavertexEditorSidebar: React.FC<Props> = ({
  vertex,
  onClose,
  onLinkAdd,
  allVertices,
}) => {
  const [newName, setNewName] = useState('')

  const extractRefs = (data: any): string[] => {
    if (!data) return []
    const arr = Array.isArray(data) ? data : [data]
    return arr.map((item) => item?.ref ?? item?.name).filter(Boolean)
  }

  const existingRefs = new Set([
    ...extractRefs(vertex?.Metavertex),
    ...extractRefs(vertex?.MetavertexRef),
    ...extractRefs(vertex?.MetavertexInverseRef),
    vertex?.name,
  ])

  return (
    <div className="bg-light p-2">
      <h5 className="d-flex align-items-center justify-content-between mb-3">
        Редактор метавершины{' '}
        {vertex ? (
          <span className="text-primary">{vertex.name}</span>
        ) : (
          <span className="text-muted" style={{ fontSize: '0.7em' }}>
            (добавление)
          </span>
        )}
        {vertex && (
          <button className="btn btn-light py-0 px-1 rounded" onClick={onClose}>
            <i className="bi bi-x-square" />
          </button>
        )}
      </h5>

      {/* Вложенность */}
      <div className="mb-3">
        <details className="mt-2">
          <summary className="btn btn-sm btn-outline-primary">
            <i className="bi bi-plus-square" /> Добавить метавершину
          </summary>
          <div className="mt-2">
            <label className="form-label small">Выбрать из существующих:</label>
            <select
              className="form-select form-select-sm mb-2"
              onChange={(e) => {
                const value = e.target.value
                if (value) onLinkAdd('nest', value)
              }}
            >
              <option value="">— Выберите —</option>
              {allVertices
                .filter((v) => !existingRefs.has(v.name))
                .map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name}
                  </option>
                ))}
            </select>

            <label className="form-label small">Создать новую:</label>
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Имя новой вершины"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button
                className="btn btn-sm btn-outline-success"
                disabled={!newName}
                onClick={() => {
                  onLinkAdd('nest', newName)
                  setNewName('')
                }}
              >
                <i className="bi bi-check2" />
              </button>
            </div>
            <label className="form-label small">Тип вложенности:</label>
            <select
              className="form-select form-select-sm mb-2"
              onChange={(e) => {
                const value = e.target.value
                if (value) onLinkAdd('nest', value)
              }}
            >
              <option value="">Прямая</option>
              <option value="">Ссылка</option>
              <option value="">Обратная ссылка</option>
            </select>
          </div>
        </details>
      </div>
      <div className="mb-3">
        <strong className="text-muted">Прямые вложения:</strong>
        <ul className="list-group list-group-flush small">
          {extractRefs(vertex?.Metavertex).map((name, i) => (
            <li className="list-group-item" key={`nest-${i}`}>
              <i className="bi bi-chevron-right me-1" /> {name}
            </li>
          ))}
        </ul>
      </div>

      {/* Ссылки и обратные ссылки — только если выбрана вершина */}

      <>
        <div className="mb-3">
          <strong className="text-muted">Ссылки:</strong>
          <ul className="list-group list-group-flush small">
            {extractRefs(vertex?.MetavertexRef).map((name, i) => (
              <li className="list-group-item" key={`ref-${i}`}>
                <i className="bi bi-link-45deg me-1" /> {name}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-3">
          <strong className="text-muted">Обратные ссылки:</strong>
          <ul className="list-group list-group-flush small">
            {extractRefs(vertex?.MetavertexInverseRef).map((name, i) => (
              <li className="list-group-item" key={`inv-${i}`}>
                <i className="bi bi-arrow-return-left me-1" /> {name}
              </li>
            ))}
          </ul>
        </div>
      </>
    </div>
  )
}

export default MetavertexEditorSidebar
