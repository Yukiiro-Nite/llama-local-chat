export const filesToBase64 = async (inputEl: HTMLInputElement): Promise<string[]> => {
  const fileDataUrls = await Promise.all(
    Array.from(inputEl.files ?? [])
      .map(file => readFileData((reader) => reader.readAsDataURL(file)) as Promise<string | undefined>)
  )

  return fileDataUrls
    .filter(Boolean) as string[]
}

const readFileData = async (callback: (reader: FileReader) => void): Promise<string | ArrayBuffer | undefined> => {
  const reader = new FileReader()
  return new Promise((resolve) => {
    reader.addEventListener('load', (event) => {
      resolve(event.target?.result || undefined)
    })
    callback(reader)
  })
}

export const getBase64FromDataUrl = (dataUrl: string): string => {
  const [, base64] = dataUrl.split(',')
  return base64
}