import Lob from "lob"

let lob: ReturnType<typeof Lob> | null = null

export function getLob() {
  if (!lob) {
    const apiKey = process.env.LOB_API_KEY
    if (!apiKey) {
      throw new Error("LOB_API_KEY is not set")
    }
    lob = Lob(apiKey)
  }
  return lob
}
