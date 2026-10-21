using API.Base;
using API.Models;
using API.Repository.Data;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/accountroles")]
    [ApiController]

    public class AccountRolesController : BaseController<AccountRole, AccountRoleRepositories, int>
    {
        public AccountRolesController(AccountRoleRepositories repository) : base(repository)
        {
        }
    }
}