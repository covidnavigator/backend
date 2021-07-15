export function filterByKeywords(
  entityArray: any,
  searchKeywords: string | string[]
): any {
  let keywords = []
  Array.isArray(searchKeywords)
    ? (keywords = searchKeywords)
    : keywords.push(searchKeywords)

  const filteredEntity = entityArray.filter(entity =>
    keywords.every(keyword => entity.keywords.includes(keyword))
  )

  return filteredEntity
}

export function addHTTPSProtocol(url: string): string {
  if (url === undefined || url === null) return ''
  return url === '' || /^(http|https)\:\/\//.test(url) ? url : `http://${url}`
}
