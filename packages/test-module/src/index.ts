import answer from 'the-answer'
import { Test } from './instance/instance'
export interface Aaaa {
  a?: string
}

const func = async () => {
  await setTimeout(() => {
    console.log(111)
  }, 1000)
  console.log(answer)
}

func()

const a: Aaaa = {
  a: 'sss'
}

const b: Test = {
  a: 'sss'
}

export { a, b }
