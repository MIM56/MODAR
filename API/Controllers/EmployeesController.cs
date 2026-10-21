using API.Contexts;
using API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("AllowAll")]
    public class EmployeesController : ControllerBase
    {
        private readonly MyContext _context;

        public EmployeesController(MyContext context)
        {
            _context = context;
        }

        // GET: api/Employees
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var employees = await _context.Employees
                    .Join(_context.AccountRoles,
                        emp => emp.Id,
                        accRole => accRole.AccountId,
                        (emp, accRole) => new { emp, accRole })
                    .GroupJoin(_context.Roles,
                        x => x.accRole.RoleId,
                        role => role.Id,
                        (x, roles) => new { x.emp, x.accRole, Roles = roles })
                    .SelectMany(
                        x => x.Roles.DefaultIfEmpty(),
                        (x, role) => new EmployeeDto
                        {
                            Id = x.emp.Id,
                            FirstName = x.emp.FirstName,
                            LastName = x.emp.LastName,
                            Email = x.emp.Email,
                            Phone = x.emp.Phone,
                            Gender = (int)x.emp.Gender,
                            BirthDate = x.emp.BirthDate,
                            ManagerId = x.emp.ManagerId,
                            RoleId = x.accRole.RoleId,
                            RoleName = role != null ? role.Name : "Employee",
                            Status = "Active" // Default status
                        })
                    .ToListAsync();

                // ✅ Update status dari database jika ada field status
                foreach (var emp in employees)
                {
                    var account = await _context.Accounts.FindAsync(emp.Id);
                    if (account != null)
                    {
                        // Cek apakah account masih aktif (berdasarkan IsUsed atau field lain)
                        emp.Status = account.IsUsed ? "Inactive" : "Active";
                    }
                }

                Console.WriteLine($"✅ Returning {employees.Count} employees with roles");
                return Ok(employees);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // GET: api/Employees/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                var employee = await _context.Employees
                    .Join(_context.AccountRoles,
                        emp => emp.Id,
                        accRole => accRole.AccountId,
                        (emp, accRole) => new { emp, accRole })
                    .Join(_context.Roles,
                        x => x.accRole.RoleId,
                        role => role.Id,
                        (x, role) => new EmployeeDto
                        {
                            Id = x.emp.Id,
                            FirstName = x.emp.FirstName,
                            LastName = x.emp.LastName,
                            Email = x.emp.Email,
                            Phone = x.emp.Phone,
                            Gender = (int)x.emp.Gender,
                            BirthDate = x.emp.BirthDate,
                            ManagerId = x.emp.ManagerId,
                            RoleId = x.accRole.RoleId,
                            RoleName = role.Name,
                            Status = "Active"
                        })
                    .FirstOrDefaultAsync(e => e.Id == id);

                if (employee == null) return NotFound(new { message = "Employee not found" });

                // Update status dari Account
                var account = await _context.Accounts.FindAsync(id);
                if (account != null)
                {
                    employee.Status = account.IsUsed ? "Inactive" : "Active";
                }

                return Ok(employee);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // POST: api/Employees
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] EmployeeCreateDto model)
        {
            try
            {
                Console.WriteLine($"📝 Creating employee: {model.Email}, Role: {model.Role}");

                if (string.IsNullOrEmpty(model.Email) || string.IsNullOrEmpty(model.Password))
                {
                    return BadRequest(new { message = "Email and Password are required" });
                }

                var maxId = await _context.Accounts.MaxAsync(a => (int?)a.Id) ?? 0;
                int newId = maxId + 1;

                var account = new Account
                {
                    Id = newId,
                    Password = model.Password,
                    IsUsed = false // ✅ Default Active
                };
                _context.Accounts.Add(account);
                await _context.SaveChangesAsync();

                var employee = new Employee
                {
                    Id = newId,
                    FirstName = model.FirstName ?? "",
                    LastName = model.LastName ?? "",
                    Email = model.Email,
                    Phone = model.Phone ?? "",
                    Gender = (Gender)model.Gender,
                    BirthDate = model.BirthDate != null ? (DateTime)model.BirthDate : DateTime.Now,
                    ManagerId = model.ManagerId
                };
                _context.Employees.Add(employee);

                var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == model.Role);
                if (role == null)
                {
                    return BadRequest(new { message = $"Role '{model.Role}' not found" });
                }

                var accountRole = new AccountRole
                {
                    AccountId = newId,
                    RoleId = role.Id
                };
                _context.AccountRoles.Add(accountRole);

                await _context.SaveChangesAsync();

                Console.WriteLine($"✅ Employee created: ID={newId}, Role={role.Name}");

                return StatusCode(201, new
                {
                    message = "Employee created successfully",
                    data = new EmployeeDto
                    {
                        Id = newId,
                        Email = model.Email,
                        FirstName = model.FirstName,
                        LastName = model.LastName,
                        RoleId = role.Id,
                        RoleName = role.Name,
                        Status = "Active"
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error: {ex.Message}");
                return StatusCode(500, new { message = ex.Message, details = ex.InnerException?.Message });
            }
        }

        // PUT: api/Employees/5 - FIXED STATUS UPDATE
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] EmployeeUpdateDto model)
        {
            try
            {
                Console.WriteLine($"📝 PUT request - ID: {id}, New Role: {model.Role}, Status: {model.Status}");

                var employee = await _context.Employees.FindAsync(id);
                if (employee == null)
                {
                    return NotFound(new { message = "Employee not found" });
                }

                employee.FirstName = model.FirstName ?? employee.FirstName;
                employee.LastName = model.LastName ?? employee.LastName;
                employee.Email = model.Email ?? employee.Email;
                employee.Phone = model.Phone ?? employee.Phone;

                // ✅ UPDATE STATUS DI TABEL ACCOUNT
                var account = await _context.Accounts.FindAsync(id);
                if (account != null)
                {
                    // Status "Inactive" = IsUsed = true, "Active" = IsUsed = false
                    account.IsUsed = model.Status?.ToLower() == "inactive";
                    Console.WriteLine($"✅ Status updated: {model.Status} -> IsUsed={account.IsUsed}");
                }

                var accountRole = await _context.AccountRoles
                    .FirstOrDefaultAsync(ar => ar.AccountId == id);

                var newRole = await _context.Roles
                    .FirstOrDefaultAsync(r => r.Name == model.Role);

                if (newRole == null)
                {
                    return BadRequest(new { message = $"Role '{model.Role}' not found" });
                }

                if (accountRole != null)
                {
                    Console.WriteLine($"🔄 Updating role from {accountRole.RoleId} to {newRole.Id} ({model.Role})");
                    accountRole.RoleId = newRole.Id;
                }
                else
                {
                    Console.WriteLine($"➕ Creating new account role: AccountId={id}, RoleId={newRole.Id}");
                    _context.AccountRoles.Add(new AccountRole
                    {
                        AccountId = id,
                        RoleId = newRole.Id
                    });
                }

                await _context.SaveChangesAsync();

                Console.WriteLine($"✅ Employee {id} updated successfully with role: {model.Role}, Status: {model.Status}");

                return Ok(new
                {
                    message = "Employee updated successfully",
                    data = new EmployeeDto
                    {
                        Id = employee.Id,
                        Email = employee.Email,
                        FirstName = employee.FirstName,
                        LastName = employee.LastName,
                        RoleId = newRole.Id,
                        RoleName = newRole.Name,
                        Status = model.Status ?? "Active"
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error: {ex.Message}");
                return StatusCode(500, new { message = ex.Message, details = ex.InnerException?.Message });
            }
        }

        // DELETE: api/Employees/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var accountRole = await _context.AccountRoles
                    .FirstOrDefaultAsync(ar => ar.AccountId == id);
                if (accountRole != null)
                {
                    _context.AccountRoles.Remove(accountRole);
                }

                var employee = await _context.Employees.FindAsync(id);
                if (employee == null) return NotFound(new { message = "Employee not found" });
                _context.Employees.Remove(employee);

                var account = await _context.Accounts.FindAsync(id);
                if (account != null)
                {
                    _context.Accounts.Remove(account);
                }

                await _context.SaveChangesAsync();

                Console.WriteLine($"✅ Employee {id} deleted");
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }

    // DTOs - ✅ TAMBAH STATUS
    public class EmployeeDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string Email { get; set; } = "";
        public string Phone { get; set; } = "";
        public int Gender { get; set; }
        public DateTime BirthDate { get; set; }
        public int? ManagerId { get; set; }
        public int RoleId { get; set; }
        public string RoleName { get; set; } = "";
        public string Status { get; set; } = "Active"; // ✅ TAMBAH STATUS
    }

    public class EmployeeCreateDto
    {
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
        public string Role { get; set; } = "Employee";
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public int Gender { get; set; } = 0;
        public DateTime? BirthDate { get; set; }
        public int? ManagerId { get; set; }
    }

    public class EmployeeUpdateDto
    {
        public string Email { get; set; } = "";
        public string Role { get; set; } = "Employee";
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public string? Status { get; set; } // ✅ TAMBAH STATUS
    }
}