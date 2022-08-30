import { calculatePatrimony } from '../patrimony'
import { newDeceased, newPerson } from './common'

// test('Only one child', () => {
//   // If there's only one child, they get 1/2 and 1/2 remains available
//   const deceased = newDeceased({
//     children: [newPerson({ id: '2', name: 'Figlio', alive: true, category: 'children' })],
//   })
//   const result = calculatePatrimony(deceased)

//   expect(result[deceased.children[0].id]).toBe('1/2')
//   expect(result.available).toBe('1/2')
// })

// test('Two or more children', () => {
//   // If there are two or more children 2/3 get divided among them and 1/3 remains available
//   const deceased = newDeceased({
//     children: [
//       newPerson({ id: '2', name: 'Figlio', alive: true, category: 'children' }),
//       newPerson({ id: '3', name: 'Figlia', alive: true, category: 'children' }),
//     ],
//   })
//   const result = calculatePatrimony(deceased)

//   expect(result[deceased.children[0].id]).toBe('1/3')
//   expect(result[deceased.children[1].id]).toBe('1/3')
//   expect(result.available).toBe('1/3')
// })

test('Two or more children, one of them has descendants', () => {
  // If a child is dead the reserve goes to their descendants
  const deceased = newDeceased({
    children: [
      newPerson({
        id: '2',
        name: 'Figlio',
        alive: false,
        category: 'children',
        children: [
          newPerson({ id: '4', name: 'Nipote 1', alive: true, category: 'children' }),
          newPerson({ id: '5', name: 'Nipote 2', alive: true, category: 'children' }),
        ],
      }),
      newPerson({ id: '3', name: 'Figlia', alive: true, category: 'children' }),
    ],
  })
  const result = calculatePatrimony(deceased)

  expect(result[deceased.children[0].children[0].id]).toBe('1/6')
  expect(result[deceased.children[0].children[1].id]).toBe('1/6')
  expect(result[deceased.children[1].id]).toBe('1/3')
  expect(result.available).toBe('1/3')
})

// test('Only spouse', () => {
//   // If only the spouse is alive 1/2 of the patrimony goes to them, 1/2 remains available
//   const deceased = newDeceased({
//     spouse: [newPerson({ id: '2', name: 'Coniuge', alive: true, category: 'spouse' })],
//   })
//   const result = calculatePatrimony(deceased)

//   expect(result[deceased.spouse[0].id]).toBe('1/2')
//   expect(result.available).toBe('1/2')
// })

// test('Only ascendants', () => {
//   // If only the ascendants are alive 1/3 of the patrimony goes to them, 2/3 remain available
//   const deceased = newDeceased({
//     parents: [
//       newPerson({ id: '2', name: 'Mamma', alive: true, category: 'parents' }),
//       newPerson({ id: '3', name: 'Papà', alive: true, category: 'parents' }),
//     ],
//   })
//   const result = calculatePatrimony(deceased)

//   expect(result[deceased.parents[0].id]).toBe('1/6')
//   expect(result[deceased.parents[1].id]).toBe('1/6')
//   expect(result.available).toBe('2/3')
// })

// test('Only spouse and ascendants', () => {
//   // The spouse receives 1/2,
//   // the ascendants 1/4
//   // 1/4 remains available
//   const deceased = newDeceased({
//     spouse: [newPerson({ id: '2', name: 'Coniuge', alive: true, category: 'spouse' })],
//     parents: [newPerson({ id: '3', name: 'Mamma', alive: true, category: 'parents' })],
//   })
//   const result = calculatePatrimony(deceased)

//   expect(result[deceased.spouse[0].id]).toBe('1/2')
//   expect(result[deceased.parents[0].id]).toBe('1/4')
//   expect(result.available).toBe('1/4')
// })

// test('Spouse and one child', () => {
//   // The spouse receives 1/3,
//   // the child receives 1/3,
//   // 1/3 remains available
//   const deceased = newDeceased({
//     spouse: [newPerson({ id: '2', name: 'Coniuge', alive: true, category: 'spouse' })],
//     children: [newPerson({ id: '3', name: 'Figlia', alive: true, category: 'children' })],
//   })
//   const result = calculatePatrimony(deceased)

//   expect(result[deceased.spouse[0].id]).toBe('1/3')
//   expect(result[deceased.children[0].id]).toBe('1/3')
//   expect(result.available).toBe('1/3')
// })

// test('Spouse and two or more children', () => {
//   // The spouse receives 1/3,
//   // the children receive 1/2 divided among them evenly,
//   // 1/4 remains available
//   const deceased = newDeceased({
//     spouse: [newPerson({ id: '2', name: 'Coniuge', alive: true, category: 'spouse' })],
//     children: [
//       newPerson({ id: '3', name: 'Figlia', alive: true, category: 'children' }),
//       newPerson({ id: '4', name: 'Figlio', alive: true, category: 'children' }),
//     ],
//   })
//   const result = calculatePatrimony(deceased)

//   expect(result[deceased.spouse[0].id]).toBe('1/3')
//   expect(result[deceased.children[0].id]).toBe('1/4')
//   expect(result[deceased.children[1].id]).toBe('1/4')
//   expect(result.available).toBe('1/4')
// })
