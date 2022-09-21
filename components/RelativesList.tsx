import { usePeopleContext } from '../context/PeopleContext'

interface RelativesListProps {
  inheritance: Record<string, string>
}

function RelativesList({ inheritance }: RelativesListProps) {
  const list = usePeopleContext()
  if (!list) return null

  const root = list['0']

  return (
    <div>
      <p>{root.name}</p>
      <Node relatives={root.relatives} inheritance={inheritance}></Node>
    </div>
  )
}

export default RelativesList

interface NodeProps {
  relatives: string[]
  inheritance: Record<string, string>
}

function Node({ relatives, inheritance }: NodeProps) {
  const list = usePeopleContext()
  if (!list) return null

  if (relatives.length === 0) {
    return null
  }

  return (
    <ul className="ml-4 list-disc">
      {relatives.map((id) => {
        const relative = list[id]
        if (!relative) return null

        return (
          <li key={relative.id}>
            {relative.id} - {relative.category}: {inheritance[relative.id] ?? 0}
            <Node relatives={relative.relatives} inheritance={inheritance} />
          </li>
        )
      })}
    </ul>
  )
}
