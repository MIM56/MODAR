using API.Base;
using API.Models;
using API.Repository.Data;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/roles")]
    [ApiController]
    public class RolesController : BaseController<Role, RoleRepositories, int>
    {
        public RolesController(RoleRepositories repository) : base(repository)
        {
        }
    }
}