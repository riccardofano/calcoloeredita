import Fraction from 'fraction.js'

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)

  if (b > a) {
    const temp = a
    a = b
    b = temp
  }

  while (true) {
    a %= b
    if (a === 0) {
      return b
    }
    b %= a
    if (b === 0) {
      return a
    }
  }
}

function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b)
}

export function toCommonDenominator(list: Record<string, string>) {
  if (Object.entries(list).length < 2) {
    return
  }

  let denominator = 1
  for (const str of Object.values(list)) {
    const current = new Fraction(str)
    denominator = lcm(denominator, current.d)
  }

  for (const [key, value] of Object.entries(list)) {
    const current = new Fraction(value)
    const difference = denominator / current.d

    current.n *= difference
    current.d = denominator

    list[key] = current.toFraction(false)
  }
}
