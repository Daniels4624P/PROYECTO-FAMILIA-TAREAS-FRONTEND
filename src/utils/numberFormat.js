export const formatNumber = (value) => {
  if (!value) return "";

  // Permitir solo números y el signo negativo
  const cleanValue = value.replace(/[^\d-]/g, "");

  // Si no hay números, devolver vacío
  if (cleanValue === "" || cleanValue === "-") return "";

  // Convertir a número
  const number = Number(cleanValue);

  // Formatear con puntos para separar miles
  const formattedNumber = number.toLocaleString("es-CO");

  return formattedNumber; // Sin "COP" para no afectar la edición en vivo
};
