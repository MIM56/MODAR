using Microsoft.AspNetCore.Mvc;

namespace Client.Controllers
{
    public class LoginController : Controller
    {
        public IActionResult Index()
        {
            // Cek jika sudah login, redirect ke dashboard sesuai role
            var isLoggedIn = HttpContext.Session.GetString("IsLoggedIn");
            var userRole = HttpContext.Session.GetString("UserRole");

            if (isLoggedIn == "true" && !string.IsNullOrEmpty(userRole))
            {
                if (userRole.ToLower() == "admin")
                    return RedirectToAction("Index", "Admin");
                else if (userRole.ToLower() == "manager")
                    return RedirectToAction("Index", "Manager");
                else if (userRole.ToLower() == "employee")
                    return RedirectToAction("Index", "Employees");
            }

            return View();
        }

        public IActionResult Register()
        {
            return View();
        }

        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            Response.Cookies.Delete("UserEmail");
            Response.Cookies.Delete("IsLoggedIn");
            Response.Cookies.Delete("UserRole");
            return RedirectToAction("Index", "Login");
        }
    }
}