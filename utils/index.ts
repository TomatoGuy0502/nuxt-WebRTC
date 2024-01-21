export function generateID(length: number = 10) {
  let result = ''
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  let counter = 0
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  result = `${result.slice(0, 3)}-${result.slice(3, 7)}-${result.slice(7)}`
  return result
}
