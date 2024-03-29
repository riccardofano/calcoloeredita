import { ChangeEvent, useEffect, useState } from 'react'
import { useModeContext } from '../context/ModeContext'
import { useMoneyContext, useSetMoneyContext } from '../context/MoneyContext'

type PatrimonyValues = {
  total: string
  debt: string
  donations: string
}

function MoneyForm() {
  const mode = useModeContext()
  const money = useMoneyContext()
  const setMoney = useSetMoneyContext()

  const [patrimonyValues, setPatrimonyValues] = useState<PatrimonyValues>({
    total: '1000000',
    debt: '500',
    donations: '7000',
  })

  useEffect(() => {
    if (mode !== 'patrimony') return

    const { total, debt, donations } = patrimonyValues
    const intTotal = toNumber(total)
    const intDebt = toNumber(debt)
    const intDonations = toNumber(donations)

    if (allValidNumbers([intTotal, intDebt, intDonations])) {
      let total = intTotal - intDebt
      if (total < 0) {
        total = 0
      }
      setMoney((total + intDonations).toString())
    }
  }, [mode, patrimonyValues, setMoney])

  function onMoneyChange(e: ChangeEvent<HTMLInputElement>) {
    setMoney(e.target.value)
  }

  function onPatrimonyFieldChange(e: ChangeEvent<HTMLInputElement>) {
    setPatrimonyValues((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  return (
    <>
      {mode === 'inheritance' ? (
        <NumberInputField
          name="inheritance"
          value={money}
          label="Ammontare del patrimonio (opzionale)"
          placeholder="100000"
          onChange={onMoneyChange}
        />
      ) : (
        <>
          <NumberInputField
            name="total"
            value={patrimonyValues.total}
            label="Totale del patrimonio"
            placeholder="100000"
            onChange={onPatrimonyFieldChange}
          />
          <NumberInputField
            name="debt"
            value={patrimonyValues.debt}
            label="Totale dei debiti"
            placeholder="500"
            onChange={onPatrimonyFieldChange}
          />
          <NumberInputField
            name="donations"
            value={patrimonyValues.donations}
            label="Totale delle donazioni eseguite in vita"
            placeholder="7000"
            onChange={onPatrimonyFieldChange}
          />
        </>
      )}
    </>
  )
}

export default MoneyForm

interface NumberInputFieldProps {
  name: keyof PatrimonyValues | 'inheritance'
  value: string
  label: string
  placeholder: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

function NumberInputField({ name, value, label, placeholder, onChange }: NumberInputFieldProps) {
  return (
    <label className="input-label">
      {label}
      <div className="relative text-base before:absolute before:top-0 before:bottom-0 before:right-4 before:flex before:h-full before:items-center before:font-normal before:content-['€'] md:text-lg">
        <input
          className="input-field pr-8 font-normal invalid:outline invalid:outline-danger-400"
          name={name}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    </label>
  )
}

function toNumber(value: string): number {
  return value === '' ? 0 : Number(value)
}

function allValidNumbers(values: number[]): boolean {
  return values.every((v) => !isNaN(v))
}
