export const getUser = () => {
  return JSON.parse(localStorage.getItem("user") || "{}")
}

export const getRole = () => {
  return getUser()?.role || "viewer"
}

export const isAdmin = () => getRole() === "admin"
export const isTech = () => getRole() === "technician"