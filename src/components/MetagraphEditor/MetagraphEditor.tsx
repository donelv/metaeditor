import { useEffect, useRef, useState, type JSX } from 'react'
import { calculateLevelsFull } from '../../tools/calculateLevels'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { groupByLevel } from '../../tools/groupByLevel'
import type { Edge, LevelMap, Metavertex, VertexMap } from '../../types'
import EdgeEditorSidebar from '../EdgeEditor/EdgeEditorSidebar'
import ResizableSidebar from '../ResizableSidebar/ResizableSidebar'
import AttributeList from '../AttributeList/AttributeList'
import MetavertexEditorSidebar from '../MetavertexEditorSidebar/MetavertexEditorSidebar'
import { getXML } from '../../redux/metagraph-reducer'

const MetagraphViewer = (): JSX.Element => {
  const dispatch = useAppDispatch()
  const metagraph = useAppSelector((s) => s.metagraphPage.metagraph)
  const [grouped, setGrouped] = useState<Record<number, Metavertex[]>>({})
  const [levelMap, setLevelMap] = useState<LevelMap>({})
  const [vertexMap, setVertexMap] = useState<VertexMap>({})
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [childToParent, setChildToParent] = useState<Record<string, string>>({})
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
  const [selectedVertex, setSelectedVertex] = useState<Metavertex | null>(null)

  const [zoom, setZoom] = useState(1)

  const handleZoomIn = () =>
    setZoom((z) => Number(Math.min(z + 0.1, 2).toPrecision(1)))
  const handleZoomOut = () =>
    setZoom((z) => Number(Math.max(z - 0.1, 0.5).toPrecision(1)))

  useEffect(() => {
    dispatch(getXML())
  }, [])
  useEffect(() => {
    if (metagraph) {
      const { levelMap, vertexMap } = calculateLevelsFull(metagraph)
      setLevelMap(levelMap)
      setVertexMap(vertexMap)
      const groupedBy = groupByLevel(levelMap, vertexMap)
      setGrouped(groupedBy)

      const c2p: Record<string, string> = {}
      Object.values(vertexMap).forEach((parent) => {
        const children = Array.isArray(parent.Metavertex)
          ? parent.Metavertex
          : parent.Metavertex
          ? [parent.Metavertex]
          : []
        children.forEach((child) => {
          c2p[child.name] = parent.name
        })
      })
      setChildToParent(c2p)

      const nextEdges: Edge[] = []
      Object.values(vertexMap).forEach((node) => {
        const edgeList = (node as any).Edge

        if (edgeList) {
          const edgesArray = Array.isArray(edgeList) ? edgeList : [edgeList]
          edgesArray.forEach((e) => {
            const from = e?.StartVertexRef?.ref
            const to = e?.EndVertexRef?.ref
            if (from && to) {
              nextEdges.push({
                from,
                to,
                type: 'edge',
                name: e.name,
                directed: e.directed === 'true',
                attribute: e.Attribute ?? [],
                raw: e,
              })
            }
          })
        }
      })

      setEdges(nextEdges)
    }
  }, [metagraph])

  const renderEdgeLinks = (v: Metavertex): JSX.Element | null => {
    const currentLevel = levelMap[v.name]
    const linksOut = edges.filter(
      (e): e is { from: string; to: string; type: 'edge' } =>
        e.from === v.name && e.type === 'edge'
    )
    const linksIn = edges.filter(
      (e): e is { from: string; to: string; type: 'edge' } =>
        e.to === v.name && e.type === 'edge'
    )

    const top = linksOut.filter((e) => levelMap[e.to] < currentLevel)
    const bottom = linksOut.filter((e) => levelMap[e.to] > currentLevel)
    const side = linksOut.filter((e) => levelMap[e.to] === currentLevel)

    const topIn = linksIn.filter((e) => levelMap[e.from] < currentLevel)
    const bottomIn = linksIn.filter((e) => levelMap[e.from] > currentLevel)

    const edgesTotal =
      top.length + bottom.length + side.length + topIn.length + bottomIn.length

    const renderSet = (
      items: Edge[],
      symbol: string,
      className: string,
      extract: (e: Edge) => string
    ) => (
      <div className={`d-flex flex-column small text-muted ${className}`}>
        {items.map((e, i) => {
          const arrow = e.directed ? '→' : '↔'
          const target = extract(e)
          return (
            <div
              key={i}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setSelectedEdge(e)
              }}
            >
              <div className="badge bg-light border text-dark">
                {e.name ?? 'без имени'}
                {arrow}
                <span className="text-decoration-underline me-1">
                  {target}
                  <span className="text-muted">({symbol})</span>
                </span>
              </div>
            </div>
          )
        })}
      </div>
    )

    return (
      <div className="accordion mt-3" id="accordionEdges">
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingOne">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={'#' + v.name}
              aria-expanded="false"
              aria-controls={v.name}
            >
              Рёбра {edgesTotal}шт.
            </button>
          </h2>
          <div
            id={v.name}
            className="accordion-collapse collapse"
            aria-labelledby="headingOne"
            data-bs-parent="#accordionEdges"
          >
            <div className="accordion-body" style={{ overflow: 'auto' }}>
              {topIn.length > 0 &&
                renderSet(
                  topIn,
                  '↓ входящее',
                  // 'position-absolute top-0 start-0 ps-2',
                  'ps-2',
                  (e) => e.from
                )}
              {top.length > 0 &&
                renderSet(
                  top,
                  '↑',
                  // 'position-absolute top-0 end-0 pe-2',
                  'ps-2',
                  (e) => e.to
                )}
              {bottom.length > 0 &&
                renderSet(
                  bottom,
                  '↓',
                  // 'position-absolute bottom-0 end-0 pe-2',
                  'ps-2',
                  (e) => e.to
                )}
              {side.length > 0 &&
                renderSet(
                  side,
                  '→',
                  // 'position-absolute top-50 end-0 translate-middle-y',
                  'ps-2',
                  (e) => e.to
                )}
              {bottomIn.length > 0 &&
                renderSet(
                  bottomIn,
                  '↑ входящее',
                  // 'position-absolute bottom-0 start-0 ps-2',
                  'ps-2',
                  (e) => e.from
                )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderChildren = (v: Metavertex): JSX.Element | null => {
    const blocks: {
      name: string
      label: string
      level?: number
      type: 'nest' | 'ref' | 'inv'
    }[] = []
    const push = (items: any, label: string, type: 'nest' | 'ref' | 'inv') => {
      const array = Array.isArray(items) ? items : [items]
      array.forEach((item: any) => {
        const name = item?.ref ?? item?.name
        if (name) blocks.push({ name, label, level: levelMap[name], type })
      })
    }
    push(v.Metavertex, 'вложенность', 'nest')
    push(v.MetavertexRef, 'ссылка', 'ref')
    push(v.MetavertexInverseRef, 'обратная ссылка', 'inv')

    if (!blocks.length) return null
    const badgeClass = (type: string) =>
      type === 'nest'
        ? 'bg-primary'
        : type === 'ref'
        ? 'bg-success'
        : 'bg-warning text-dark'
    return (
      <div className="accordion" id="accordionChildren">
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingTwo">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#${v.name}-children`}
              aria-expanded="false"
              aria-controls={v.name}
            >
              Связи {blocks.length}шт.
            </button>
          </h2>
          <div
            id={`${v.name}-children`}
            className="accordion-collapse collapse"
            aria-labelledby="headingTwo"
            data-bs-parent="#accordionChildren"
          >
            <div className="accordion-body">
              <ul className="ps-3 mb-0">
                {blocks.map((b, i) => (
                  <li key={i} className="small">
                    <i className="bi bi-link-45deg text-muted me-1" />
                    <span
                      className="text-decoration-underline me-2"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedLevel(levelMap[b.name] ?? null)}
                    >
                      {b.name}
                    </span>
                    <span className={`badge border ${badgeClass(b.type)}`}>
                      {b.label}
                      {b.level !== undefined ? ` · уровень ${b.level}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      // <div className="mt-2">
      //   <div className="fw-bold small text-secondary">Связи:</div>
      //   <ul className="ps-3 mb-0">

      //   </ul>
      // </div>
    )
    return (
      <div className="mt-2">
        <div className="fw-bold small text-secondary">Связи:</div>
        <ul className="ps-3 mb-0">
          {blocks.map((b, i) => (
            <li key={i} className="small">
              <i className="bi bi-link-45deg text-muted me-1" />
              <span
                className="text-decoration-underline me-2"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedLevel(levelMap[b.name] ?? null)}
              >
                {b.name}
              </span>
              <span className={`badge border ${badgeClass(b.type)}`}>
                {b.label}
                {b.level !== undefined ? ` · уровень ${b.level}` : ''}
              </span>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  const levels = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b)
  const displayedLevels = selectedLevel !== null ? [selectedLevel] : levels
  return (
    <>
      <div className="d-flex" style={{ height: '100vh' }}>
        <div className="flex-grow-1  p-3 overflow-auto">
          {displayedLevels.map((level) => {
            const vertices = grouped[level]
            const groupedByParent: Record<string, Metavertex[]> = {}
            vertices.forEach((v) => {
              const parent = childToParent[v.name] ?? '—'
              if (!groupedByParent[parent]) groupedByParent[parent] = []
              groupedByParent[parent].push(v)
            })
            return (
              <div className="mb-4" key={level}>
                <h5 className="text-center text-primary">Уровень {level}</h5>
                {Object.entries(groupedByParent).map(([parentName, verts]) => (
                  <div
                    key={parentName}
                    className="rounded p-3 my-3 d-flex flex-chr gap-2 flex-wrap metavertex-container"
                  >
                    {parentName !== '—' && (
                      <div className="small fw-bold mb-1 metavertex-name">
                        {parentName}
                      </div>
                    )}
                    {verts.map((v) => (
                      <div
                        key={v.name}
                        className={`metavertex-wrapper`}
                        style={{
                          width: `${300 * zoom}px`,
                          minWidth: `${220 * zoom}px`,
                          // maxHeight: '360px',
                          // height: `${zoom * 100}%`,
                          overflow: 'visible',
                        }}
                      >
                        <div
                          className={`card shadow-sm p-0 metavertex ${
                            v.name === selectedVertex?.name ? 'selected' : ''
                          }`}
                          style={{
                            transform: `scale(${zoom})`,
                            transformOrigin: 'top left',
                            width: '300px', // базовая ширина до скейла
                          }}
                          ref={(el) => {
                            cardRefs.current[v.name] = el
                          }}
                        >
                          <div
                            className="card-header"
                            onClick={() => setSelectedVertex(v)}
                          >
                            <strong>{v.name}</strong>
                          </div>
                          <div className="card-body">
                            <span className="card-title text-body-tertiary">
                              Атрибуты
                            </span>
                            <AttributeList attributes={v.Attribute ?? []} />
                            {renderEdgeLinks(v)}
                          </div>
                          <div className="card-footer">{renderChildren(v)}</div>
                        </div>
                      </div>
                    ))}

                    {/* {verts.map((v) => (
                      <div
                        key={v.name}
                        className={
                          `card shadow-sm p-0 metavertex ${
                            v.name === selectedVertex?.name ? 'selected' : ''
                          }`
                        }
                        style={cardScale}
                        ref={(el) => {
                          cardRefs.current[v.name] = el
                        }}
                      >
                        <div
                          className="card-header"
                          onClick={() => setSelectedVertex(v)}
                        >
                          <strong>{v.name}</strong>
                        </div>
                        <div className="card-body">
                          <span className="card-title text-body-tertiary">
                            Атрибуты
                          </span>
                          <AttributeList attributes={v.Attribute ?? []} />
                          {renderEdgeLinks(v)}
                        </div>
                        <div className="card-footer">{renderChildren(v)}</div>
                      </div>
                    ))} */}
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {/* Правая панель — уровни + редактор */}
        <ResizableSidebar>
          <h6 className="text-secondary">Действия</h6>
          <div
            className="mb-3 d-flex gap-2 align-items-center"
            style={{ zIndex: 1000 }}
          >
            <button className="btn btn-outline-secondary btn-sm" title="Redo">
              <i className="bi bi-arrow-90deg-left"></i>
            </button>
            <button className="btn btn-outline-secondary btn-sm" title="Undo">
              <i className="bi bi-arrow-90deg-right"></i>
            </button>

            <button
              className="btn btn-outline-secondary btn-sm ms-auto"
              onClick={handleZoomOut}
              title="Уменьшить масштаб"
            >
              <i className="bi bi-zoom-out"></i>
            </button>
            <span>{zoom * 100}%</span>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={handleZoomIn}
              title="Увеличить масштаб"
            >
              <i className="bi bi-zoom-in"></i>
            </button>
          </div>

          <hr className="hr" />
          <h6 className="text-secondary">Уровни</h6>
          <ul className="list-group mb-3">
            <li
              className={`list-group-item list-group-item-action ${
                selectedLevel === null ? 'active' : ''
              }`}
              onClick={() => setSelectedLevel(null)}
              style={{ cursor: 'pointer' }}
            >
              Показать все
            </li>
            {levels.map((level) => (
              <li
                key={level}
                className={`list-group-item list-group-item-action ${
                  selectedLevel === level ? 'active' : ''
                }`}
                onClick={() => setSelectedLevel(level)}
                style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Уровень {level}
              </li>
            ))}
          </ul>
          <hr className="hr" />
          <MetavertexEditorSidebar
            vertex={selectedVertex}
            onClose={() => setSelectedVertex(null)}
            onLinkAdd={(type, target) => {
              console.log('Добавить', type, '→', target)
            }}
            allVertices={Object.values(vertexMap)}
          />
          <hr className="hr" />

          {/* Редактор ребра */}
          <EdgeEditorSidebar
            edge={selectedEdge}
            onChange={(updatedEdge) => {
              setEdges((prev) =>
                prev.map((e) => (e === selectedEdge ? updatedEdge : e))
              )
              setSelectedEdge(updatedEdge)
            }}
            vertices={Object.values(vertexMap)}
            onAdd={(newEdge) => {
              setEdges((prev) => [...prev, newEdge])
              setSelectedEdge(null)
            }}
            onClose={() => setSelectedEdge(null)}
          />
        </ResizableSidebar>
      </div>
    </>
  )
}

export default MetagraphViewer
