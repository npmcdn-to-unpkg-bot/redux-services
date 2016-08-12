export const select = (state) => {
  const status = ()       => state.status.value
  const error  = ()       => state.status.error

  let docs = {}
  docs.all     = ()       => state.docs
  docs.byIndex = (index)  => state.docs[index]
  docs.find    = (filter) => state.docs.find(filter)
  docs.first   = ()       => state.docs[0]
  docs.last    = ()       => state.docs[state.docs.length - 1]
  docs.length  = ()       => state.docs.length

  let config = {}

  return { config, docs, status, error }
}
