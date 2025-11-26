import RoleMenu from "../models/RoleMenu.js"

const roleMiddleware = (requiredPermission = "can_view") => {
  return async (req, res, next) => {
    try {
      const { role_id } = req.user
      const menuPath = req.baseUrl

      const permission = await RoleMenu.findOne({
        role_id,
        menu_id: menuPath,
      })

      if (!permission || !permission[requiredPermission]) {
        return res.status(403).json({ message: "Access forbidden" })
      }

      next()
    } catch (error) {
      return res.status(403).json({ message: "Access forbidden" })
    }
  }
}

export default roleMiddleware
