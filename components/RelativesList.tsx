import { Dispatch, SetStateAction } from 'react'
import { usePeopleContext } from '../context/PeopleContext'

interface RelativesListProps {
  inheritance: Record<string, string>
  setEditing: Dispatch<SetStateAction<boolean>>
}

function RelativesList({ inheritance, setEditing }: RelativesListProps) {
  const list = usePeopleContext()
  if (!list) return null

  const root = list['0']

  return (
    <div>
      <p className="text-lg">
        Eredità della famiglia di: <span className="font-semibold">{root.name}</span>
      </p>
      <div className="-ml-4 my-4">
        <Node relatives={root.relatives} inheritance={inheritance}></Node>
      </div>

      <button className="btn btn-inverted" onClick={() => setEditing(true)}>
        Riprova
      </button>
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
    <ul className="ml-4 space-y-2">
      {relatives.map((id) => {
        const relative = list[id]
        if (!relative) return null

        return (
          <li key={relative.id} className="space-y-2">
            <p className="flex justify-between p-2 rounded-md border">
              {relative.id} - {relative.category}
              <span>{inheritance[relative.id] ?? 0}</span>
            </p>
            <Node relatives={relative.relatives} inheritance={inheritance} />
          </li>
        )
      })}
    </ul>
  )
}
