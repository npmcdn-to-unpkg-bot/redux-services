import chalk                            from 'chalk'

export const middleware = (getState) => () => (next) => (action) => {
  const result = next(action)
  const state = getState()
  if (!state.enabled) return result
  if (action.__ns__ != 'journal') return result
  const doc = state.docs[state.docs.length - 1]
  if (doc) {
    const { timeDiff, type, text, tags } = doc
    let a = []

    if (timeDiff > 200) {
      if (timeDiff > 999) {
        a.push(chalk.bgRed(`>999 ms`))
        a.push(chalk.bgRed(`>999 ms`))
      }
      else {
        const timeText = `   ${timeDiff}`.slice(-3)
        a.push(chalk.bgRed(`+${timeText} ms`))
      }
    } else {
      const timeText = `   ${timeDiff}`.slice(-3)
      a.push(`+${timeText} ms`)
    }

    if (tags) {
      const tagsText = (tags + Array(60).join(' ')).slice(0, 60)
      a.push(tagsText)
    } else {
      const tagsText = Array(61).join(' ').slice(0, 60)
      a.push(tagsText)
    }

    a.push(text)
    const result = a.join(' - ')

    if (type == 'error') {
      console.error(chalk.bgRed(result))
    } else if (type == 'warning') {
      console.warn(chalk.bgYellow(result))
    } else {
      console.log(chalk.bgWhite.black(result))
    }
  }
  return result
}
