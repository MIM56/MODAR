using Microsoft.AspNetCore.Mvc;

namespace Client.Controllers
{
    public class ManagerController : Controller
    {
        // ✅ Helper method untuk cek auth (DRY - Don't Repeat Yourself)
        private bool CheckManagerAuth(out string userEmail, out string userRole)
        {
            userEmail = HttpContext.Session.GetString("UserEmail");
            userRole = HttpContext.Session.GetString("UserRole");
            var isLoggedIn = HttpContext.Session.GetString("IsLoggedIn");

            if (string.IsNullOrEmpty(isLoggedIn))
            {
                var cookieEmail = Request.Cookies["UserEmail"];
                var cookieLoggedIn = Request.Cookies["IsLoggedIn"];
                var cookieRole = Request.Cookies["UserRole"];

                if (string.IsNullOrEmpty(cookieEmail) || cookieLoggedIn != "true")
                {
                    userEmail = null;
                    userRole = null;
                    return false;
                }

                userEmail = cookieEmail;
                userRole = cookieRole;
            }

            if (userRole?.ToLower() != "manager" && userRole?.ToLower() != "admin")
            {
                return false;
            }

            return true;
        }

        public IActionResult Index()
        {
            if (!CheckManagerAuth(out string userEmail, out string userRole))
            {
                return RedirectToAction("Index", "Login");
            }

            ViewBag.UserEmail = userEmail;
            ViewBag.UserRole = userRole;
            return View();
        }

        public IActionResult Projects()
        {
            if (!CheckManagerAuth(out string userEmail, out string userRole))
            {
                return RedirectToAction("Index", "Login");
            }

            ViewBag.UserEmail = userEmail;
            ViewBag.UserRole = userRole;
            return View();
        }

        // URL: /Manager/Reports
        // View: Views/Manager/MReports.cshtml
        public IActionResult Reports()
        {
            if (!CheckManagerAuth(out string userEmail, out string userRole))
            {
                return RedirectToAction("Index", "Login");
            }

            ViewBag.UserEmail = userEmail;
            ViewBag.UserRole = userRole;

            // ✅ Explicitly return view MReports.cshtml
            return View("MReports");
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