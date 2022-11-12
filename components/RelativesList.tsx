import Fraction from 'fraction.js'
import { Dispatch, ReactNode, SetStateAction, useState } from 'react'
import { PersonList } from '../utils/types/Person'

import { useModeContext } from '../context/ModeContext'
import { useMoneyContext } from '../context/MoneyContext'
import { usePeopleContext } from '../context/PeopleContext'
import { toNonEmptyName } from './RelativesForm'
import { motion } from 'framer-motion'

interface RelativesListProps {
  inheritance: Record<string, string>
  setEditing: Dispatch<SetStateAction<boolean>>
}

function RelativesList({ inheritance, setEditing }: RelativesListProps) {
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

  function node(relatives: string[], list: PersonList): ReactNode {
    return (
      <ul className="ml-4 space-y-2">
        {relatives.map((id, i) => {
          const relative = list[id]
          if (!relative) return null

          const relativeInheritance = inheritance[relative.id] ?? '0'

          return (
            <li key={relative.id} className="space-y-2">
              <p className="flex items-center justify-between p-2 rounded-md border">
                {toNonEmptyName(relative.name)}
                {showMoney ? (
                  <span>{currencyFormatter.format(new Fraction(relativeInheritance).valueOf() * intMoney)}</span>
                ) : (
                  <ProgressRing fraction={relativeInheritance} index={i} />
                )}
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
      {mode === 'patrimony' && moneyIsValid && (
        <div className="mt-2">
          <p>Valore totale del patrimonio: {currencyFormatter.format(intMoney)}</p>
          <p>Valore disponibile: {showMoney ? available : availableInFraction}</p>
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
      <div className="-ml-4 my-4">{node(root.relatives, list)}</div>

      <button className="btn btn-inverted" onClick={() => setEditing(true)}>
        Riprova
      </button>
    </div>
  )
}

export default RelativesList

interface ProgressRingProps {
  fraction: string
  index: number
}

function ProgressRing({ fraction, index }: ProgressRingProps) {
  const radius = 16
  const stroke = 3

  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI

  const progress = new Fraction(fraction).valueOf()
  const strokeDashoffset = circumference - progress * circumference

  return (
    <span className="flex items-center">
      {fraction}
      <svg className="ml-1 text-green-600 -rotate-90" width={radius * 2} height={radius * 2}>
        <circle
          className="text-green-200"
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ strokeDashOffset: { duration: 0.5 }, delay: index * 0.2 + 0.3 }}
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeLinecap: 'round' }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
    </span>
  )
}
