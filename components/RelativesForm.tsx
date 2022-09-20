import { ChangeEvent, Dispatch, SetStateAction } from 'react'
import { usePeopleContext, usePeopleDispatchContext } from '../context/PeopleContext'
import { CategoryName } from '../utils/types/Category'
import { Person, PersonList } from '../utils/types/Person'
import RelativeCard from './RelativeCard'

interface RelativesFormProps {
  id: string
  setSelectedId: Dispatch<SetStateAction<string>>
}

function RelativesForm({ id, setSelectedId }: RelativesFormProps) {
  const list = usePeopleContext()
  const dispatch = usePeopleDispatchContext()
  if (!list) return null

  const me = list[id]
  const isRoot = me.id === '0'

  const categories = allowedCategories(me.category, me.degree)
  const categoriesChecked = checkedCategories(list, me.relatives)
  const categoriesDisabled = disabledCategories(categoriesChecked)
  const pagination = getPagination(list, me)

  function onNameChange(e: ChangeEvent<HTMLInputElement>) {
    if (!dispatch) return
    dispatch({ type: 'UPDATE_NAME', payload: { id, name: e.target.value } })
  }

  function onCheckChange(e: ChangeEvent<HTMLInputElement>, category: CategoryName) {
    if (!dispatch) return
    dispatch({ type: 'TOGGLE_CATEGORY', payload: { parentId: id, category, checked: e.target.checked } })
  }

  function onAdd(category: CategoryName) {
    if (!dispatch) return
    dispatch({ type: 'ADD_RELATIVE', payload: { parentId: id, category } })
  }

  const header = isRoot ? (
    <>
      <label className="text-xs" htmlFor="deceased-name">
        Nome del defunto
      </label>
      <input
        className="px-2 py-2 mr-2 w-full border rounded-md shadow-sm"
        type="text"
        id="deceased-name"
        value={me.name}
        onChange={onNameChange}
      />
    </>
  ) : (
    <nav>
      {pagination.reverse().map((p) => (
        <span key={p.id}>
          <button onClick={() => setSelectedId(p.id)}>{p.name}</button>
          <span> / </span>
        </span>
      ))}
    </nav>
  )

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <header>{header}</header>
      {categories.map((category) => (
        <section title={category} key={`${me.id} - ${category}`}>
          <label
            className={`${
              categoriesDisabled.includes(category) ? 'opacity-40 cursor-not-allowed' : ''
            } capitalize text-lg font-medium`}
          >
            <input
              className="mr-2"
              type="checkbox"
              checked={categoriesChecked[category]}
              disabled={categoriesDisabled.includes(category)}
              onChange={(e) => onCheckChange(e, category)}
            />
            {category}
          </label>
          <ul className="ml-4">
            {me.relatives
              .filter((relativeId) => list[relativeId].category === category)
              .map((relativeId) => (
                <RelativeCard key={relativeId} id={relativeId} setSelectedId={setSelectedId} />
              ))}
            {categoriesChecked[category] && (
              <button className="pt-3 text-blue-400 font-medium leading-none" onClick={() => onAdd(category)}>
                + Aggiungi discendente
              </button>
            )}
          </ul>
        </section>
      ))}

      {isRoot ? (
        <button className="px-4 py-2 bg-blue-400 text-white rounded-md" type="submit">
          Calcola eredità
        </button>
      ) : (
        <button
          className="px-4 py-2 border border-blue-400 text-blue-400 rounded-md"
          onClick={() => {
            if (!me.root) return
            setSelectedId(me.root)
          }}
        >
          Indietro
        </button>
      )}
    </form>
  )
}

export default RelativesForm

function allowedCategories(category: CategoryName, degree: number): CategoryName[] {
  if (degree === 0) {
    return ['children', 'spouse', 'ascendants', 'bilateral', 'unilateral', 'others']
  }
  switch (category) {
    case 'children':
    case 'bilateral': {
      return ['children']
    }
    case 'ascendants': {
      if (degree === 1) {
        return ['ascendants']
      }
      return ['children', 'ascendants']
    }
    default: {
      return []
    }
  }
}

type CategoryChecklist = { [key in CategoryName]: boolean }

function checkedCategories(list: PersonList, relativeIDs: string[]): CategoryChecklist {
  const categories: CategoryChecklist = {
    children: false,
    spouse: false,
    ascendants: false,
    bilateral: false,
    unilateral: false,
    others: false,
  }

  // When a category is checked it auto adds one person to the relatives
  // so if there is a person with that category it must be on
  for (const relativeID of relativeIDs) {
    const relative = list[relativeID]
    categories[relative.category] = true
  }
  return categories
}

function disabledCategories(checkedCategories: CategoryChecklist): CategoryName[] {
  if (checkedCategories['children']) {
    return ['ascendants', 'bilateral', 'unilateral', 'others']
  }

  if (['spouse', 'ascendants', 'bilateral', 'unilateral'].some((c) => checkedCategories[c as CategoryName])) {
    return ['others']
  }

  return []
}

function getPagination(list: PersonList, me: Person): { id: string; name: string }[] {
  const pagination = [{ id: me.id, name: me.name }]
  let root = me.root
  while (root !== null) {
    const parent = list[root]
    pagination.push({ id: parent.id, name: parent.name })
    root = parent.root
  }

  return pagination
}
