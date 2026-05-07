import { useCallback, useEffect, useMemo, useState } from 'react'
import { getEventLabels } from '../api/eventLabelsApi'
import { DEFAULT_EVENT_LABEL_COLOR, EventLabel } from '../data/events'

interface UseEventLabelsResult {
  labels: EventLabel[]
  isLoadingLabels: boolean
  colorByLabel: Record<string, string>
  getLabelColor: (name: string) => string
  refreshLabels: () => Promise<void>
}

export const useEventLabels = (): UseEventLabelsResult => {
  const [labels, setLabels] = useState<EventLabel[]>([])
  const [isLoadingLabels, setIsLoadingLabels] = useState(true)

  const fetchLabels = useCallback(async (): Promise<void> => {
    setIsLoadingLabels(true)
    try {
      const data = await getEventLabels()
      setLabels(data)
    } catch (error) {
      console.error('Error cargando etiquetas de evento:', error)
    } finally {
      setIsLoadingLabels(false)
    }
  }, [])

  useEffect(() => {
    fetchLabels()
  }, [fetchLabels])

  const colorByLabel = useMemo(
    () =>
      labels.reduce<Record<string, string>>((acc, label) => {
        acc[label.name] = label.color || DEFAULT_EVENT_LABEL_COLOR
        return acc
      }, {}),
    [labels]
  )

  const getLabelColor = useCallback(
    (name: string): string => colorByLabel[name] ?? DEFAULT_EVENT_LABEL_COLOR,
    [colorByLabel]
  )

  return {
    labels,
    isLoadingLabels,
    colorByLabel,
    getLabelColor,
    refreshLabels: fetchLabels
  }
}
