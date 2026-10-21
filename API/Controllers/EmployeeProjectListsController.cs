using API.Base;
using API.Models;
using API.Repository.Data;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/employeeprojectlists")]
    [ApiController]
    public class EmployeeProjectListsController : BaseController<EmployeeProjectList, EmployeeProjectListRepositories, int>
    {
        public EmployeeProjectListsController(EmployeeProjectListRepositories repository) : base(repository)
        {
        }
    }
}