import { Modal } from 'bootstrap'
import { useEffect, useRef, useState, type JSX } from 'react'
interface Attribute {
  name: string
  type?: string
  system?: string | boolean
  ['#text']?: string
}

interface AttributeListProps {
  attributes: Attribute[]
  onChange?: (updated: Attribute[]) => void
}

const AttributeList = ({
  attributes,
  onChange,
}: AttributeListProps): JSX.Element => {
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [draftAttr, setDraftAttr] = useState<Attribute | null>(null)

  const updateAttr = (i: number, key: keyof Attribute, value: any) => {
    if (!onChange) return
    const updated = [...attributes]
    updated[i][key] = value
    onChange(updated)
  }

  const cancelEdit = () => setEditIndex(null)
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(
    null
  )

  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (pendingDeleteIndex !== null && modalRef.current) {
      const modal = new Modal(modalRef.current)
      modal.show()

      const handleHidden = () => {
        setPendingDeleteIndex(null)
      }

      modalRef.current.addEventListener('hidden.bs.modal', handleHidden)

      return () => {
        modalRef.current?.removeEventListener('hidden.bs.modal', handleHidden)
      }
    }
  }, [pendingDeleteIndex])

  const list = Array.isArray(attributes) ? attributes : [attributes]

  return (
    <>
      {list.map((attr, i) => {
        const isEditing = editIndex === i

        if (isEditing) {
          return (
            <div key={i} className="mb-2 border rounded p-2 bg-white">
              <div className="row mb-3">
                <div className="col-md-3 pe-0">
                  <input
                    type="text"
                    className="form-control"
                    value={attr.name}
                    placeholder="name"
                    onChange={(e) => updateAttr(i, 'name', e.target.value)}
                  />
                </div>
                <div className="col-md-1 text-center px-0">=</div>
                <div className="col-md-8 ps-0">
                  <input
                    type="text"
                    className="form-control"
                    value={attr['#text'] ?? ''}
                    placeholder="value"
                    onChange={(e) => updateAttr(i, '#text', e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group mb-3">
                <label className="input-group-text">Тип</label>
                <select
                  className="form-select"
                  value={attr.type ?? ''}
                  onChange={(e) => updateAttr(i, 'type', e.target.value)}
                >
                  <option value="">Выберите тип...</option>
                  <option value="int">int</option>
                  <option value="float">float</option>
                  <option value="string">string</option>
                </select>
              </div>

              <div className="d-flex align-items-center">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`check-${i}`}
                    checked={attr.system === 'true' || attr.system === true}
                    onChange={(e) => updateAttr(i, 'system', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor={`check-${i}`}>
                    <i
                      className="bi bi-gear-fill me-1"
                      style={{ color: '#8b8f93' }}
                    />
                    Системный
                  </label>
                </div>
                <div className="d-flex gap-2 ms-auto">
                  <button
                    className="btn btn-light py-0 px-1 rounded"
                    onClick={cancelEdit}
                  >
                    Отменить
                  </button>
                  <button
                    className="btn btn-outline-danger py-0 px-1 rounded"
                    onClick={() => setPendingDeleteIndex(i)}
                    // onClick={() => {
                    //   const updated = [...attributes]
                    //   updated.splice(i, 1)
                    //   onChange?.(updated)
                    //   setEditIndex(null)
                    // }}
                  >
                    <i className="bi bi-trash-fill" />
                  </button>

                  <button
                    className="btn btn-outline-primary py-0 px-1 rounded"
                    onClick={cancelEdit}
                  >
                    <i className="bi bi-floppy-fill" />
                  </button>
                </div>
              </div>
            </div>
          )
        }

        // View Mode
        return (
          <div
            key={i}
            className="bg-light px-2 py-1 rounded border d-flex align-items-center mb-2"
          >
            {attr.system === 'true' || attr.system === true ? (
              <i
                className="bi bi-gear-fill me-1 align-self-start"
                style={{ color: '#8b8f93' }}
              />
            ) : null}
            <strong className="me-1 align-self-start">{attr.name}</strong>:{' '}
            {attr['#text']}
            <div className="d-flex gap-1 ms-auto">
              <button
                className="btn btn-light py-0 px-1 rounded"
                onClick={() => setEditIndex(i)}
              >
                <i className="bi bi-pencil-fill" style={{ color: '#8b8f93' }} />
              </button>
            </div>
          </div>
        )
      })}
      {draftAttr && editIndex === -1 && (
        <div className="mb-2 border rounded p-2 bg-white">
          {/* редактирование черновика — аналогично обычному */}
          <div className="row mb-3">
            <div className="col-md-3 pe-0">
              <input
                type="text"
                className="form-control"
                value={draftAttr.name}
                placeholder="name"
                onChange={(e) =>
                  setDraftAttr({ ...draftAttr, name: e.target.value })
                }
              />
            </div>
            <div className="col-md-1 text-center px-0">=</div>
            <div className="col-md-8 ps-0">
              <input
                type="text"
                className="form-control"
                value={draftAttr['#text']}
                placeholder="value"
                onChange={(e) =>
                  setDraftAttr({ ...draftAttr, ['#text']: e.target.value })
                }
              />
            </div>
          </div>

          <div className="input-group mb-3">
            <label className="input-group-text">Тип</label>
            <select
              className="form-select"
              value={draftAttr.type ?? ''}
              onChange={(e) =>
                setDraftAttr({ ...draftAttr, type: e.target.value })
              }
            >
              <option value="">Выберите тип...</option>
              <option value="int">int</option>
              <option value="float">float</option>
              <option value="string">string</option>
            </select>
          </div>

          <div className="d-flex align-items-center">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="draftSystem"
                checked={draftAttr.system === true}
                onChange={(e) =>
                  setDraftAttr({ ...draftAttr, system: e.target.checked })
                }
              />
              <label className="form-check-label" htmlFor="draftSystem">
                <i
                  className="bi bi-gear-fill me-1"
                  style={{ color: '#8b8f93' }}
                />
                Системный
              </label>
            </div>

            <div className="d-flex gap-2 ms-auto">
              <button
                className="btn btn-light py-0 px-1 rounded"
                onClick={() => {
                  setDraftAttr(null)
                  setEditIndex(null)
                }}
              >
                Отменить
              </button>

              <button
                className="btn btn-outline-primary py-0 px-1 rounded"
                onClick={() => {
                  if (!draftAttr.name) return // можно добавить валидацию
                  const updated = Array.isArray(attributes)
                    ? [...attributes]
                    : []
                  updated.push(draftAttr)
                  onChange?.(updated)
                  setDraftAttr(null)
                  setEditIndex(null)
                }}
              >
                <i className="bi bi-floppy-fill" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Добавление нового атрибута */}
      <div
        className="px-2 py-1 rounded d-flex"
        style={{ border: '2px dotted var(--bs-gray-500)' }}
      >
        <div className="d-flex gap-1 ms-auto">
          <button
            className="btn btn-light py-0 px-1 rounded"
            onClick={() => {
              setDraftAttr({ name: '', '#text': '', type: '', system: false })
              setEditIndex(-1) // 🔢 зарезервированный индекс для черновика
              // const updated = [...attributes, { name: '', '#text': '' }]
              // onChange?.(updated)
              // setEditIndex(updated.length - 1)
            }}
          >
            <i
              className="bi bi-plus-square-dotted"
              style={{ color: '#8b8f93' }}
            />
          </button>
        </div>
      </div>

      <div
        className="modal fade"
        tabIndex={-1}
        ref={modalRef}
        id="deleteAttrModal"
        aria-labelledby="deleteAttrLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="deleteAttrLabel">
                Удаление атрибута
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <p>
                Удалить атрибут{' '}
                <strong>{attributes[pendingDeleteIndex!]?.name}</strong>?
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Отмена
              </button>
              <button
                type="button"
                className="btn btn-danger"
                data-bs-dismiss="modal"
                onClick={() => {
                  const updated = [...attributes]
                  updated.splice(pendingDeleteIndex!, 1)
                  onChange?.(updated)
                  setEditIndex(null)
                }}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AttributeList
