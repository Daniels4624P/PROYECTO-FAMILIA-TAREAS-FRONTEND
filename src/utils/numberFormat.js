export const formatNumber = (value) => {
  if (!value) return ""
  // Convertir a número y fijar a 0 decimales (pesos colombianos no usan centavos normalmente)
  const number = Number(value).toFixed(0)
  // Formatear con puntos como separadores de miles
  const formattedNumber = number.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  // Añadir el símbolo de pesos colombianos al final
  return `${formattedNumber} COP`
}

export const unformatNumber = (value) => {
  if (!value) return ""
  // Eliminar el símbolo de peso y los puntos
  return value.replace(/\s?COP/g, "").replace(/\./g, "")
}

