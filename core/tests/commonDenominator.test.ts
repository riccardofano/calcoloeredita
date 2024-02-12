import { toCommonDenominator } from '../commonDenominator'

test('Should handle 1 number in the list', () => {
  const list = {
    '0': '1/3',
  }

  toCommonDenominator(list)

  expect(list['0']).toBe('1/3')
})

test('Should handle 2 numbers in the list', () => {
  const list = {
    '0': '1/3',
    '1': '1/2',
  }

  toCommonDenominator(list)

  expect(list['0']).toBe('2/6')
  expect(list['1']).toBe('3/6')
})

test('Should handle 3 numbers in the list', () => {
  const list = {
    '0': '1/3',
    '1': '1/2',
    '2': '1/6',
  }

  toCommonDenominator(list)

  expect(list['0']).toBe('2/6')
  expect(list['1']).toBe('3/6')
  expect(list['2']).toBe('1/6')
})

test('Should handle a lot of numbers in the list', () => {
  const list = {
    '0': '1/3',
    '1': '1/2',
    '2': '1/6',
    '3': '1/17',
    '4': '1/5',
    '5': '1/10',
    '6': '1/70',
    '7': '1/32',
  }

  toCommonDenominator(list)

  expect(list['0']).toBe('19040/57120')
  expect(list['1']).toBe('28560/57120')
  expect(list['2']).toBe('9520/57120')
  expect(list['3']).toBe('3360/57120')
  expect(list['4']).toBe('11424/57120')
  expect(list['5']).toBe('5712/57120')
  expect(list['6']).toBe('816/57120')
  expect(list['7']).toBe('1785/57120')
})

test('Should handle 1 correctly', () => {
  const list = {
    '0': '1',
    '1': '1/2',
    '2': '1/6',
  }

  toCommonDenominator(list)

  expect(list['0']).toBe('6/6')
  expect(list['1']).toBe('3/6')
  expect(list['2']).toBe('1/6')
})

test('Should be able to return whole numbers', () => {
  const list = {
    '0': '1',
    '1': '1',
  }

  toCommonDenominator(list)

  expect(list['0']).toBe('1')
  expect(list['1']).toBe('1')
})

test('Should handle 0 correctly', () => {
  const list = {
    '0': '0',
    '1': '1/2',
    '2': '1/6',
  }

  toCommonDenominator(list)

  expect(list['0']).toBe('0/6')
  expect(list['1']).toBe('3/6')
  expect(list['2']).toBe('1/6')
})

test('Should be able to handle big numbers', () => {
  const list = {
    '0': '1/9',
    '1': '1/54',
    '2': '1/47',
  }

  toCommonDenominator(list)

  expect(list['0']).toBe('282/2538')
  expect(list['1']).toBe('47/2538')
  expect(list['2']).toBe('54/2538')
})
