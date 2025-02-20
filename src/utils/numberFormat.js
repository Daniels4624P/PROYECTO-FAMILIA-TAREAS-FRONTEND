export const formatNumber = (value) => {
  if (!value) {
    return "0.00"
  }

  const number = parseFloat(value) // Convertir a número para manejar negativos
  const formattedNumber = number.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return formattedNumber
}

export const unformatNumber = (value) => {
  if (!value) {
    return "0"
  }

  const number = parseFloat(value.replace(/[^0-9,-]/g, '').replace(',', '.'));
  return number.toString();
};
