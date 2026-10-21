using Microsoft.AspNetCore.Mvc;

namespace Client.Controllers
{
    public class EmployeesController : Controller
    {
        public IActionResult Index()
        {
            // Cek session login
            var isLoggedIn = HttpContext.Session.GetString("IsLoggedIn");
            var userEmail = HttpContext.Session.GetString("UserEmail");
            var userRole = HttpContext.Session.GetString("UserRole");

            // Jika tidak ada session, cek cookie
            if (string.IsNullOrEmpty(isLoggedIn))
            {
                var cookieEmail = Request.Cookies["UserEmail"];
                var cookieLoggedIn = Request.Cookies["IsLoggedIn"];
                var cookieRole = Request.Cookies["UserRole"];

                if (string.IsNullOrEmpty(cookieEmail) || cookieLoggedIn != "true")
                {
                    return RedirectToAction("Index", "Login");
                }

                userEmail = cookieEmail;
                userRole = cookieRole;
            }

            // Cek role - hanya employee yang bisa akses
            if (userRole?.ToLower() != "employee" && userRole?.ToLower() != "admin")
            {
                return RedirectToAction("Index", "Login");
            }

            ViewBag.UserEmail = userEmail;
            ViewBag.UserRole = userRole;
            return View();
        }

        public IActionResult Projects()
        {
            var isLoggedIn = HttpContext.Session.GetString("IsLoggedIn");
            var userEmail = HttpContext.Session.GetString("UserEmail");
            var userRole = HttpContext.Session.GetString("UserRole");

            if (string.IsNullOrEmpty(isLoggedIn))
            {
                var cookieEmail = Request.Cookies["UserEmail"];
                var cookieLoggedIn = Request.Cookies["IsLoggedIn"];
                var cookieRole = Request.Cookies["UserRole"];

                if (string.IsNullOrEmpty(cookieEmail) || cookieLoggedIn != "true")
                {
                    return RedirectToAction("Index", "Login");
                }

                userEmail = cookieEmail;
                userRole = cookieRole;
            }

            if (userRole?.ToLower() != "employee" && userRole?.ToLower() != "admin")
            {
                return RedirectToAction("Index", "Login");
            }

            ViewBag.UserEmail = userEmail;
            ViewBag.UserRole = userRole;
            return View();
        }

        public IActionResult Reports()
        {
            var isLoggedIn = HttpContext.Session.GetString("IsLoggedIn");
            var userEmail = HttpContext.Session.GetString("UserEmail");
            var userRole = HttpContext.Session.GetString("UserRole");

            if (string.IsNullOrEmpty(isLoggedIn))
            {
                var cookieEmail = Request.Cookies["UserEmail"];
                var cookieLoggedIn = Request.Cookies["IsLoggedIn"];
                var cookieRole = Request.Cookies["UserRole"];

                if (string.IsNullOrEmpty(cookieEmail) || cookieLoggedIn != "true")
                {
                    return RedirectToAction("Index", "Login");
                }

                userEmail = cookieEmail;
                userRole = cookieRole;
            }

            if (userRole?.ToLower() != "employee" && userRole?.ToLower() != "admin")
            {
                return RedirectToAction("Index", "Login");
            }

            ViewBag.UserEmail = userEmail;
            ViewBag.UserRole = userRole;
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