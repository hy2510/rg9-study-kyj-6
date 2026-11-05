import { useCallback, useEffect, useRef, useState } from 'react'

import type { DragEvent, PointerEvent } from 'react'

const DRAG_THRESHOLD_PX = 8
const SLOT_ATTR = 'data-wa1-slot'

type UseWritingActivity1SlotInteractionArgs = {
  selectedCount: number
  isChecked: boolean
  onReorder: (fromIndex: number, toIndex: number) => void
  onRemove: (index: number) => void
  onDragStart?: () => void
  onDragEnd?: () => void
}

function readSlotIndex(x: number, y: number, selectedCount: number) {
  const node = document.elementFromPoint(x, y)?.closest(`[${SLOT_ATTR}]`)
  if (!node) return null
  const index = Number(node.getAttribute(SLOT_ATTR))
  if (!Number.isInteger(index) || index < 0 || index >= selectedCount) {
    return null
  }
  return index
}

export function useWritingActivity1SlotInteraction({
  selectedCount,
  isChecked,
  onReorder,
  onRemove,
  onDragStart,
  onDragEnd,
}: UseWritingActivity1SlotInteractionArgs) {
  const [isCoarsePointer, setIsCoarsePointer] = useState(false)
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const dragFromRef = useRef<number | null>(null)
  const movedRef = useRef(false)
  const startRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const media = window.matchMedia('(pointer: coarse)')
    const update = () => setIsCoarsePointer(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (isChecked) {
      setDragFromIndex(null)
      setDragOverIndex(null)
    }
  }, [isChecked])

  const finishPointerDrag = useCallback(() => {
    dragFromRef.current = null
    movedRef.current = false
    setDragFromIndex(null)
    setDragOverIndex(null)
    onDragEnd?.()
  }, [onDragEnd])

  const getSlotProps = useCallback(
    (index: number, filled: boolean) => {
      const canMove = !isChecked && filled

      return {
        'data-wa1-slot': index,
        $draggable: canMove,
        $isDragging: dragFromIndex === index,
        $isDragOver: dragOverIndex === index && dragOverIndex !== dragFromIndex,
        draggable: canMove && !isCoarsePointer,
        onClick: () => {
          if (isCoarsePointer || !canMove) return
          onRemove(index)
        },
        onDragStart: (event: DragEvent<HTMLElement>) => {
          if (!canMove || isCoarsePointer) return
          event.stopPropagation()
          event.dataTransfer.effectAllowed = 'move'
          event.dataTransfer.setData('text/plain', String(index))
          setDragFromIndex(index)
          onDragStart?.()
        },
        onDragOver: (event: DragEvent<HTMLElement>) => {
          if (isChecked || dragFromIndex === null) return
          if (index >= selectedCount) return
          event.preventDefault()
          event.dataTransfer.dropEffect = 'move'
          setDragOverIndex(index)
        },
        onDragLeave: () => {
          setDragOverIndex((prev) => (prev === index ? null : prev))
        },
        onDrop: (event: DragEvent<HTMLElement>) => {
          event.preventDefault()
          event.stopPropagation()
          if (dragFromIndex === null || dragFromIndex === index) return
          if (index >= selectedCount) return
          onReorder(dragFromIndex, index)
          setDragFromIndex(null)
          setDragOverIndex(null)
          onDragEnd?.()
        },
        onDragEnd: () => {
          setDragFromIndex(null)
          setDragOverIndex(null)
          onDragEnd?.()
        },
        onPointerDown: (event: PointerEvent<HTMLElement>) => {
          if (!isCoarsePointer || !canMove || event.button !== 0) return
          dragFromRef.current = index
          movedRef.current = false
          startRef.current = { x: event.clientX, y: event.clientY }
          event.currentTarget.setPointerCapture(event.pointerId)
        },
        onPointerMove: (event: PointerEvent<HTMLElement>) => {
          if (!isCoarsePointer || dragFromRef.current === null) return
          const deltaX = event.clientX - startRef.current.x
          const deltaY = event.clientY - startRef.current.y
          if (
            !movedRef.current &&
            Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD_PX
          ) {
            return
          }
          if (!movedRef.current) {
            movedRef.current = true
            setDragFromIndex(dragFromRef.current)
            onDragStart?.()
          }
          setDragOverIndex(
            readSlotIndex(event.clientX, event.clientY, selectedCount),
          )
        },
        onPointerUp: (event: PointerEvent<HTMLElement>) => {
          if (!isCoarsePointer || dragFromRef.current === null) return
          const fromIndex = dragFromRef.current
          dragFromRef.current = null

          if (movedRef.current) {
            const toIndex = readSlotIndex(
              event.clientX,
              event.clientY,
              selectedCount,
            )
            if (toIndex !== null && toIndex !== fromIndex) {
              onReorder(fromIndex, toIndex)
            }
            finishPointerDrag()
            return
          }

          onRemove(fromIndex)
          finishPointerDrag()
        },
        onPointerCancel: () => {
          if (!isCoarsePointer) return
          finishPointerDrag()
        },
      }
    },
    [
      dragFromIndex,
      dragOverIndex,
      finishPointerDrag,
      isChecked,
      isCoarsePointer,
      onDragEnd,
      onDragStart,
      onRemove,
      onReorder,
      selectedCount,
    ],
  )

  return {
    getSlotProps,
    isHolding: dragFromIndex !== null,
  }
}
