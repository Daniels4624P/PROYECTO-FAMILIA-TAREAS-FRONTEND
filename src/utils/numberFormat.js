export const formatNumber = (value) => {
  if (!value) return ""
  // Eliminar cualquier carácter que no sea dígito
  const cleanValue = value.replace(/[^\d]/g, "")
  // Si no hay dígitos, devolver una cadena vacía
  if (cleanValue === "") return ""
  // Convertir a número
  const number = Number.parseInt(cleanValue, 10)
  // Formatear con puntos como separadores de miles
  const formattedNumber = number.toLocaleString("es-CO")
  // Añadir el símbolo de pesos colombianos al final
  return `${formattedNumber} COP`
}

export const unformatNumber = (value) => {
  if (!value) return ""
  // Eliminar el símbolo de peso, los puntos y cualquier espacio
  return value
    .replace(/\s?COP/g, "")
    .replace(/\./g, "")
    .trim()
}
