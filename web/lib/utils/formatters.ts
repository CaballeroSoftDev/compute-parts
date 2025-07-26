export const formatCurrency = (amount: number): string => {
  return `MX$${amount.toLocaleString()}`
}

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString()
}

export const getStockStatus = (stock: number): "empty" | "low" | "normal" => {
  if (stock === 0) return "empty"
  if (stock < 10) return "low"
  return "normal"
}

export const getStockColor = (stock: number): string => {
  const status = getStockStatus(stock)
  switch (status) {
    case "empty":
      return "text-red-600"
    case "low":
      return "text-yellow-600"
    default:
      return "text-green-600"
  }
}
