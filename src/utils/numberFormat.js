export const formatNumber = (value, displayCurrency = true) => {
  if (!value) return ""

  const number = parseFloat(value); // Convertir a número para manejar negativos

  // Si es NaN o no es un número finito, retornar una cadena vacía
  if (isNaN(number) || !Number.isFinite(number)) {
    return "";
  }

  const formattedNumber = number.toLocaleString("es-CO");

  // Añadir el símbolo de pesos colombianos al final si displayCurrency es true
  return displayCurrency ? `${formattedNumber} COP` : formattedNumber;
};

export const unformatNumber = (value) => {
  if (!value) return ""
  // Eliminar el símbolo de peso, los puntos y cualquier espacio
  return value
    .replace(/\s?COP/g, "")
    .replace(/\./g, "")
    .trim()
}
