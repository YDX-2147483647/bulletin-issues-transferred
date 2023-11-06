export function to_form_data (dict: { [key: string]: string | boolean | null }): FormData {
  const form = new FormData()
  for (const [key, value] of Object.entries(dict)) {
    form.append(key, value?.toString() ?? '')
  }
  return form
}
