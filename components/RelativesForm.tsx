import { usePeopleContext } from '../context/PeopleContext'
import { CategoryName } from '../utils/types/Category'
import { PersonList } from '../utils/types/Person'

interface RelativesFormProps {
  id: string
}

function RelativesForm({ id }: RelativesFormProps) {
  const people = usePeopleContext()
  if (!people) return null

  const me = people[id]
  const isRoot = me.id === '0'

  const categories = allowedCategories(me.category, me.degree)
  const categoriesChecked = checkedCategories(people, me.relatives)
  const categoriesDisabled = disabledCategories(categoriesChecked)

  const header = isRoot ? (
    <label>
      Nome del defunto
      <br />
      <input
        type="text"
        value={me.name}
        onChange={() => {
          console.log('do nothing')
        }}
      />
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
              onChange={() => {
                console.log('changed')
              }}
            />
            {category}
          </label>
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

  if (category === 'children' || category === 'bilateral') {
    return ['children']
  }

  if (category === 'ascendants') {
    if (degree === 1) {
      return ['ascendants']
    }
    return ['ascendants', 'children']
  }
  return []
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
  for (const id in relativeIDs) {
    const relative = list[id]
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
