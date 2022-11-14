import { Dispatch, SetStateAction, useState } from 'react'
import Fraction from 'fraction.js'
import { Person, PersonList } from '../utils/types/Person'
import { CategoryName } from '../utils/types/Category'

import { useModeContext } from '../context/ModeContext'
import { useMoneyContext } from '../context/MoneyContext'
import { usePeopleContext } from '../context/PeopleContext'

function getOrderedRelatives(id: string, list: PersonList): string[] {
  function recurse(person: Person): string[] {
    const sortedDirectRelatives = [...person.relatives].sort((a, b) => relativesSort(list[a], list[b]))

    const allSubRelatives = []
    for (const relativeId of sortedDirectRelatives) {
      allSubRelatives.push(relativeId, ...recurse(list[relativeId]))
    }
    return allSubRelatives
  }

  return recurse(list[id])
}

function relativesSort(a: Person, b: Person): number {
  const categoryOrder: CategoryName[] = ['children', 'spouse', 'ascendants', 'bilateral', 'unilateral', 'others']
  return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
}

const categoryRelation: Record<CategoryName, string> = {
  children: 'Figlio/a di',
  spouse: 'Coniuge di',
  ascendants: 'Genitore di',
  bilateral: 'Fratello/Sorella di',
  unilateral: 'Fratello/Sorella unil. di',
  others: 'Parente di',
}

interface ResultsProps {
  inheritance: Record<string, string>
  setEditing: Dispatch<SetStateAction<boolean>>
}

function Results({ inheritance, setEditing }: ResultsProps) {
  const [showMoney, setShowMoney] = useState(false)

  const mode = useModeContext()
  const list = usePeopleContext()
  const money = useMoneyContext()

  const root = list['0']
  const intMoney = Number(money) ?? 0
  const moneyIsValid = !isNaN(intMoney) && intMoney > 0

  const currencyFormatter = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })
  const availableInFraction = inheritance['available'] ?? '0'
  const available = currencyFormatter.format(new Fraction(availableInFraction).valueOf() * intMoney)

  const allRelatives = getOrderedRelatives('0', list)

  return (
    <div className="max-w-xl">
      <h2 className="text-xl">
        Eredità della famiglia di: <span className="font-medium">{root.name}</span>
      </h2>

      {mode === 'patrimony' && moneyIsValid && (
        <div className="mt-2 text-blue-100 p-4 bg-blue-900 rounded-md">
          <p className="pb-2 text-base border-b border-white/10">
            Valore totale:
            <span className="font-medium text-xl text-white"> {currencyFormatter.format(intMoney)}</span>
          </p>
          <p className="text-base pt-2">
            Valore disponibile:
            <span className="font-medium text-xl text-white"> {showMoney ? available : availableInFraction}</span>
          </p>
        </div>
      )}

      {moneyIsValid && (
        <label className="flex items-center mt-4">
          <input
            className="mr-2"
            type="checkbox"
            checked={showMoney}
            onChange={(e) => setShowMoney(e.target.checked)}
          />
          Mostra eredità in €
        </label>
      )}

      <table className="mt-5 w-full border table-auto">
        <thead className="border bg-gray-50 text-left">
          <tr>
            <th className="p-4">Nome</th>
            <th className="p-4 w-20">Quota</th>
          </tr>
        </thead>
        <tbody>
          {allRelatives.map((relativeId) => {
            const relative = list[relativeId]
            if (relative.root === null) return

            const relativeInheritance = inheritance[relativeId]
            const width = `${new Fraction(relativeInheritance).valueOf() * 100}%`

            const relation = categoryRelation[relative.category]

            return (
              <tr key={relativeId} className="border-t">
                <td className="px-4 py-2">
                  <p className="font-medium text-gray-800">{relative.name}</p>
                  <p className="text-sm text-gray-500">
                    {relation} {list[relative.root].name}
                  </p>
                </td>
                <td className="px-4 py-2">
                  <p className="text-gray-800 text-center">{relativeInheritance ?? 0}</p>
                  <p className="relative h-2 w-16 rounded-sm overflow-hidden bg-gray-200">
                    <span className="absolute left-0 inset-y-0 bg-green-500" style={{ width }}></span>
                  </p>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <p className="max-w-prose mx-auto border p-4 rounded-md mt-5 text-gray-600 border-yellow-500 bg-yellow-50/50">
        Ricordiamo che questi risultati so approssimativi, molte leggi che protrebbero influenzare i risultati per
        questo consigliamo di contattare un nostro esperto per avera una panoramica più completa.
      </p>

      <div className="flex justify-between">
        <button className="mt-5 btn btn-inverted" onClick={() => setEditing(true)}>
          Riprova
        </button>
        <button className="mt-5 btn btn-primary">Contatta un&apos;esperto</button>
      </div>
    </div>
  )
}

export default Results
