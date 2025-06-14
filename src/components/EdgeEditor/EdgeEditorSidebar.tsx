import { useEffect, useState } from 'react'
import type { Edge, Metavertex } from '../../types'
import AttributeList from '../AttributeList/AttributeList'

interface Props {
  edge: Edge | null
  onChange: (updated: Edge) => void
  vertices: Metavertex[]
  onAdd?: (edge: Edge) => void
  onClose?: () => void
}

const EdgeEditorSidebar: React.FC<Props> = ({
  edge,
  onChange,
  vertices,
  onAdd,
  onClose,
}) => {
  const [draft, setDraft] = useState<Edge>({
    from: '',
    to: '',
    type: 'edge',
    name: '',
    directed: true,
    attribute: [],
  })

  useEffect(() => {
    if (edge) {
      setDraft(edge)
    } else {
      setDraft({
        from: '',
        to: '',
        name: '',
        type: 'edge',
        directed: true,
        attribute: [],
      })
    }
  }, [edge])

  const isEdited =
    edge &&
    (edge.name !== draft.name ||
      edge.from !== draft.from ||
      edge.to !== draft.to ||
      edge.directed !== draft.directed ||
      JSON.stringify(edge.attribute ?? []) !==
        JSON.stringify(draft.attribute ?? []))

  const updateField = (key: keyof Edge, value: any) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="bg-light p-1">
      <h5 className="mb-3">
        Редактор ребра
        {edge ? (
          <button
            className="btn btn-light py-0 px-1 rounded"
            onClick={() => onClose?.()}
          >
            <i className="bi bi-x-square" />
          </button>
        ) : (
          <span className="text-muted" style={{ fontSize: '0.6em' }}>
            {' '}
            (добавление)
          </span>
        )}
      </h5>

      <div className="mb-3">
        <label>Имя ребра</label>
        <input
          type="text"
          className="form-control"
          value={draft.name ?? ''}
          onChange={(e) => updateField('name', e.target.value)}
          required
        />
        <div className="invalid-feedback">Необходимое поле</div>
      </div>

      <div className="mb-3">
        <form className="row g-3">
          <div className="col-md-4">
            <label>От</label>
            <select
              className="form-select"
              value={draft.from}
              onChange={(e) => updateField('from', e.target.value)}
            >
              <option value="">—</option>
              {vertices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label>Напр.</label>
            <select
              className="form-select"
              value={draft.directed ? 'true' : 'false'}
              onChange={(e) =>
                updateField('directed', e.target.value === 'true')
              }
            >
              <option value="false">↔ Не определено</option>
              <option value="true">→ Да</option>
            </select>
          </div>
          <div className="col-md-4">
            <label>К</label>
            <select
              className="form-select"
              value={draft.to}
              onChange={(e) => updateField('to', e.target.value)}
            >
              <option value="">—</option>
              {vertices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      <label>Атрибуты</label>
      <AttributeList
        attributes={draft.attribute ?? []}
        onChange={(updated) => updateField('attribute', updated)}
      />
      {!edge && onAdd && (
        <div className="mt-3 d-grid">
          <button
            className="btn btn-primary"
            disabled={!draft.from || !draft.to || !draft.name}
            onClick={() => {
              onAdd(draft)
              setDraft({
                from: '',
                to: '',
                name: '',
                type: 'edge',
                directed: true,
                attribute: [],
              })
            }}
          >
            Добавить ребро
          </button>
        </div>
      )}
      {edge && isEdited && (
        <div className="mt-3 d-grid">
          <button
            className="btn btn-outline-primary"
            onClick={() => onChange(draft)}
          >
            Сохранить изменения
          </button>
        </div>
      )}
    </div>
  )
}

export default EdgeEditorSidebar
