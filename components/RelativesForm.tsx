import { ChangeEvent } from 'react'
import { usePeopleContext, usePeopleDispatchContext } from '../context/PeopleContext'
import { CategoryName } from '../utils/types/Category'
import { PersonList } from '../utils/types/Person'

interface RelativesFormProps {
  id: string
}

function RelativesForm({ id }: RelativesFormProps) {
  const people = usePeopleContext()
  const dispatch = usePeopleDispatchContext()
  if (!people) return null

  const me = people[id]
  const isRoot = me.id === '0'

  const categories = allowedCategories(me.category, me.degree)
  const categoriesChecked = checkedCategories(people, me.relatives)
  const categoriesDisabled = disabledCategories(categoriesChecked)

  function onNameChange(e: ChangeEvent<HTMLInputElement>) {
    if (!dispatch) return
    dispatch({ type: 'UPDATE_NAME', payload: { id, name: e.target.value } })
  }

  function onCheckChange(e: ChangeEvent<HTMLInputElement>, category: CategoryName) {
    if (!dispatch) return
    dispatch({ type: 'TOGGLE_CATEGORY', payload: { id, category, checked: e.target.checked } })
  }

  const header = isRoot ? (
    <label>
      Nome del defunto
      <br />
      <input type="text" value={me.name} onChange={onNameChange} />
    </label>
  ) : (
    <p>{me.name}</p>
  )

  return (
    <form>
      {header}
      {categories.map((category) => (
        <div key={category}>
          <label>
            <input
              type="checkbox"
              checked={categoriesChecked[category]}
              disabled={categoriesDisabled.includes(category)}
              onChange={(e) => onCheckChange(e, category)}
            />
            {category}
          </label>
          {me.relatives
            .filter((id) => people[id].category === category)
            .map((id) => (
              <p key={id}>{people[id].name}</p>
            ))}
        </div>
      ))}
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
