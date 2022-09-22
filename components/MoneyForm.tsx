import { ChangeEvent } from 'react'
import { useMoneyContext, useSetMoneyContext } from '../context/MoneyContext'

function MoneyForm() {
  const money = useMoneyContext()
  const setMoney = useSetMoneyContext()

  function onMoneyChange(e: ChangeEvent<HTMLInputElement>) {
    if (!setMoney) return
    setMoney(e.target.value)
  }

  return (
    <div>
      <label className="text-xs">
        Ammontare del patrimonio (opzionale)
        <input
          className="input-field invalid:outline invalid:outline-red-400"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="100000"
          value={money ?? 0}
          onChange={onMoneyChange}
        />
      </label>
    </div>
  )
}

export default MoneyForm
