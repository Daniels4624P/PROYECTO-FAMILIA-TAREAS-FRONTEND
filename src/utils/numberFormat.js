export const formatNumber = (value) => {
  if (!value) return ""
  // Convertir a número y fijar a 2 decimales
  const number = Number(value).toFixed(2)
  // Separar la parte entera y decimal
  const [integerPart, decimalPart] = number.split(".")
  // Formatear la parte entera con puntos como separadores de miles
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  // Unir todo con el símbolo de peso colombiano
  return `$ ${formattedInteger},${decimalPart}`
}

export const unformatNumber = (value) => {
  if (!value) return ""
  // Eliminar el símbolo de peso y los puntos, reemplazar la coma por punto
  return value.replace(/\$/g, "").replace(/\./g, "").replace(",", ".")
}

