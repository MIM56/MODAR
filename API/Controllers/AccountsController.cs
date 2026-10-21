using API.Models;
using API.Repository.Data;
using API.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        private readonly AccountRepositories _repo;

        public AccountsController(AccountRepositories repo)
        {
            _repo = repo;
        }

        [HttpPost]
        [Route("Login")]
        public IActionResult Login(LoginVM model)
        {
            var result = _repo.Login(model);
            return Ok(result); // Return integer: 2=success, 1=wrong pass, 0=email not found
        }

        [HttpPost]
        [Route("Register")]
        public IActionResult Register(RegisterVM model)
        {
            var result = _repo.Register(model);
            return Ok(result);
        }

        // ✅ ENDPOINT BARU: Get User Roles by Email
        [HttpGet]
        [Route("UserRoles")]
        public IActionResult UserRoles([FromQuery] string email)
        {
            var roles = _repo.UserRoles(email);
            return Ok(roles); // Return List<string> seperti ["Admin"] atau ["Employee"]
        }
    }
}