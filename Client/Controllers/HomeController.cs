using Microsoft.AspNetCore.Mvc;

namespace Client.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            // ✅ TIDAK ADA REDIRECT PAKSA KE LOGIN
            // Halaman Home bisa diakses siapa saja (public)

            // Cek apakah user sudah login (untuk tampilkan info di UI)
            var isLoggedIn = HttpContext.Session.GetString("IsLoggedIn");
            var userEmail = HttpContext.Session.GetString("UserEmail");

            if (string.IsNullOrEmpty(isLoggedIn))
            {
                var cookieEmail = Request.Cookies["UserEmail"];
                var cookieLoggedIn = Request.Cookies["IsLoggedIn"];

                if (!string.IsNullOrEmpty(cookieEmail) && cookieLoggedIn == "true")
                {
                    userEmail = cookieEmail;
                    ViewBag.IsLoggedIn = true;
                }
                else
                {
                    ViewBag.IsLoggedIn = false;
                }
            }
            else
            {
                ViewBag.IsLoggedIn = true;
            }

            ViewBag.UserEmail = userEmail;
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