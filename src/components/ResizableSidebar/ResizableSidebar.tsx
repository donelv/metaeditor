import React, { useRef, useState, useEffect, type JSX } from 'react'

interface Props {
  children: React.ReactNode
  defaultWidth?: number
  minWidth?: number
}

const LOCAL_KEY = 'metagraph.sidebar.width'

const ResizableSidebar = ({
  children,
  defaultWidth = 320,
  minWidth = 200,
}: Props): JSX.Element => {
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem(LOCAL_KEY)
    return saved ? parseInt(saved) : defaultWidth
  })

  const isDragging = useRef(false)

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      const newWidth = window.innerWidth - e.clientX
      const clamped = Math.max(minWidth, Math.min(newWidth, 600))
      setWidth(clamped)
      localStorage.setItem(LOCAL_KEY, String(clamped))
    }

    const onMouseUp = () => {
      isDragging.current = false
      document.body.style.userSelect = 'auto'
      document.body.style.cursor = 'auto'
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [minWidth])

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Зона перетягивания */}
      <div
        onMouseDown={() => {
          isDragging.current = true
          document.body.style.userSelect = 'none'
          document.body.style.cursor = 'col-resize'
        }}
        style={{
          width: '2px',
          cursor: 'col-resize',
          backgroundColor: '#a5a5a5',
          zIndex: 10,
          height: '100%',
        }}
      />

      {/* Сайдбар */}
      <div
        className="border-start bg-light p-3"
        style={{
          width: `${width}px`,
          minWidth: `${minWidth}px`,
          maxWidth: '600px',
          height: '100%',
          overflowY: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default ResizableSidebar
