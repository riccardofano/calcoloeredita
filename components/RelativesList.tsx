import Fraction from 'fraction.js'
import { Dispatch, ReactNode, SetStateAction, useState } from 'react'
import { useMoneyContext } from '../context/MoneyContext'
import { usePeopleContext } from '../context/PeopleContext'
import { PersonList } from '../utils/types/Person'

interface RelativesListProps {
  inheritance: Record<string, string>
  setEditing: Dispatch<SetStateAction<boolean>>
}

function RelativesList({ inheritance, setEditing }: RelativesListProps) {
  const [showMoney, setShowMoney] = useState(false)

  const list = usePeopleContext()
  const money = useMoneyContext()
  if (!list || !money) return null

  const root = list['0']
  const intMoney = Number(money)
  const moneyIsValid = !isNaN(intMoney) && intMoney > 0

  function node(relatives: string[], list: PersonList): ReactNode {
    return (
      <ul className="ml-4 space-y-2">
        {relatives.map((id) => {
          const relative = list[id]
          if (!relative) return null

          const relativeInheritance = inheritance[relative.id] ?? '0'
          const shownValue = showMoney
            ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(
                new Fraction(relativeInheritance).valueOf() * intMoney
              )
            : relativeInheritance

          return (
            <li key={relative.id} className="space-y-2">
              <p className="flex justify-between p-2 rounded-md border">
                {relative.id} - {relative.category}
                <span>{shownValue}</span>
              </p>
              {node(relative.relatives, list)}
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div>
      <p className="text-lg">
        Eredità della famiglia di: <span className="font-semibold">{root.name}</span>
      </p>
      {moneyIsValid && (
        <label className="flex items-center">
          <input
            className="mr-2"
            type="checkbox"
            checked={showMoney}
            onChange={(e) => setShowMoney(e.target.checked)}
          />
          Mostra eredità in €
        </label>
      )}
      <div className="-ml-4 my-4">{node(root.relatives, list)}</div>

      <button className="btn btn-inverted" onClick={() => setEditing(true)}>
        Riprova
      </button>
    </div>
  )
}

export default RelativesList
