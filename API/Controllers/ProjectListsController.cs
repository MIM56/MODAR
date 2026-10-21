using API.Models;
using API.Repository.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("AllowAll")]
    public class ProjectListsController : ControllerBase
    {
        private readonly ProjectListRepositories _repo;

        public ProjectListsController(ProjectListRepositories repo)
        {
            _repo = repo;
        }

        // GET: api/ProjectLists
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _repo.Get();
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error getting projects: {ex.Message}");
                return StatusCode(500, new { message = "Error: " + ex.Message });
            }
        }

        // GET: api/ProjectLists/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id)
        {
            try
            {
                var result = await _repo.Get(id);
                if (result == null) return NotFound(new { message = "Project not found" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error getting project: {ex.Message}");
                return StatusCode(500, new { message = "Error: " + ex.Message });
            }
        }

        // POST: api/ProjectLists
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ProjectListDto model)
        {
            try
            {
                Console.WriteLine($" Creating project: {model.Name}");

                if (string.IsNullOrEmpty(model.Name))
                {
                    return BadRequest(new { message = "The Name field is required." });
                }

                var project = new ProjectList
                {
                    Id = GenerateProjectId(),
                    Name = model.Name,
                    Description = model.Description ?? "",
                    StartDate = model.StartDate,
                    EndDate = model.EndDate,
                    Status = (Status)model.Status,
                    ManagerId = model.ManagerId ?? 0,
                    EmployeeId = model.EmployeeId ?? 0
                };

                Console.WriteLine($"Generated ID: {project.Id}");

                var result = await _repo.Post(project);

                Console.WriteLine($"✅ Project created with ID: {project.Id}");

                return StatusCode(201, new
                {
                    message = "Project created successfully",
                    data = result,
                    projectId = project.Id
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error creating project: {ex.Message}");
                return StatusCode(500, new
                {
                    message = "Internal server error",
                    error = ex.Message,
                    details = ex.InnerException?.Message
                });
            }
        }

        // PUT: api/ProjectLists/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(string id, [FromBody] ProjectList entity)
        {
            try
            {
                Console.WriteLine($"📝 PUT request received - ID: '{id}'");
                Console.WriteLine($"Entity ID from body: '{entity.Id}'");

                // Validasi ID tidak boleh kosong/spasi
                if (string.IsNullOrWhiteSpace(id))
                {
                    return BadRequest(new
                    {
                        message = "ID is required and cannot be empty or whitespace",
                        receivedId = $"'{id}'"
                    });
                }

                // Trim ID untuk hapus spasi
                id = id.Trim();

                // Set ID dari URL ke entity jika berbeda
                if (string.IsNullOrWhiteSpace(entity.Id) || entity.Id.Trim() != id)
                {
                    entity.Id = id;
                }
                else
                {
                    entity.Id = entity.Id.Trim();
                }

                Console.WriteLine($"✅ Trimmed ID: '{id}'");

                var result = await _repo.Put(entity);

                if (result == null)
                {
                    return NotFound(new { message = $"Project with ID '{id}' not found" });
                }

                Console.WriteLine($"✅ Project updated successfully: {id}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error updating project: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new
                {
                    message = "Internal server error",
                    error = ex.Message,
                    details = ex.InnerException?.Message
                });
            }
        }

        // DELETE: api/ProjectLists/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    return BadRequest(new { message = "ID is required" });
                }

                var result = await _repo.Delete(id.Trim());
                if (!result) return NotFound(new { message = "Project not found" });
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error: " + ex.Message });
            }
        }

        // Helper: Generate Unique 5-Character ID
        private string GenerateProjectId()
        {
            var random = new Random();
            var id = "P" + random.Next(1000, 9999).ToString();
            return id;
        }
    }

    // ✅ DTO untuk Project 
    public class ProjectListDto
    {
        public string Name { get; set; } = "";  // ✅ Tambahkan property Name
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Status { get; set; } = 0;
        public int? ManagerId { get; set; }
        public int? EmployeeId { get; set; }
    }
}