import { ChangeEvent, useEffect, useState } from 'react'

interface PatrimonyFormProps {
  updatePatrimony: (patrimony: number) => void
}

function PatrimonyForm({ updatePatrimony }: PatrimonyFormProps) {
  const [quotas, setQuotas] = useState({
    total: 0,
    debt: 0,
    donations: 0,
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuotas({ ...quotas, [e.target.name]: e.target.value })
  }

  useEffect(() => {
    updatePatrimony(+quotas.total - +quotas.debt + +quotas.donations)
  }, [updatePatrimony, quotas])

  return (
    <form>
      <label htmlFor="total">Somma del valore di tutti i beni relitti</label>
      <br />
      <input
        style={{
          padding: '0.25rem 1rem',
          border: '1px solid rgb(226, 232, 240)',
          borderRadius: '5px',
          margin: '0.5rem 0 0.75rem',
        }}
        name="total"
        type="number"
        value={quotas.total}
        onChange={handleChange}
      />
      <br />

      <label htmlFor="debt">Somma dei debiti</label>
      <br />
      <input
        style={{
          padding: '0.25rem 1rem',
          border: '1px solid rgb(226, 232, 240)',
          borderRadius: '5px',
          margin: '0.5rem 0 0.75rem',
        }}
        name="debt"
        type="number"
        value={quotas.debt}
        onChange={handleChange}
      />
      <br />

      <label htmlFor="donations">Valore donazioni fatte in vita</label>
      <br />
      <input
        style={{
          padding: '0.25rem 1rem',
          border: '1px solid rgb(226, 232, 240)',
          borderRadius: '5px',
          margin: '0.5rem 0 0.75rem',
        }}
        name="donations"
        type="number"
        value={quotas.donations}
        onChange={handleChange}
      />
    </form>
  )
}

export default PatrimonyForm
