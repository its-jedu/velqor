export const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })