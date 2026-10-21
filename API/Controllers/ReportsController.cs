using API.Contexts;
using API.Models;
using API.Repository.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly ReportRepositories _repo;
        private readonly MyContext _context;

        public ReportsController(ReportRepositories repo, MyContext context)
        {
            _repo = repo;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var reports = await _context.Reports
                    .Join(_context.Employees,
                        r => r.DoneBy,
                        e => e.Id,
                        (r, e) => new { r, e })
                    .Join(_context.ProjectLists,
                        x => x.r.ProjectId,
                        p => p.Id,
                        (x, p) => new ReportDto
                        {
                            Id = x.r.Id,
                            Title = x.r.Title,
                            Description = x.r.Description,
                            Date = x.r.Date,
                            ProgressReport = x.r.ProgressReport, // ✅ Sekarang int → int (match!)
                            Status = x.r.Status,
                            DoneBy = x.r.DoneBy,
                            DoneByName = x.e.FirstName + " " + x.e.LastName,
                            ProjectId = x.r.ProjectId,
                            ProjectName = p.Name
                        })
                    .ToListAsync();

                return Ok(reports);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error GetAll Reports: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Report entity)
        {
            try
            {
                var result = await _repo.Post(entity);
                return StatusCode(201, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, details = ex.InnerException?.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Report entity)
        {
            try
            {
                entity.Id = id;
                var result = await _repo.Put(entity);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, details = ex.InnerException?.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _repo.Delete(id);
                if (!result) return NotFound(new { message = "Report not found" });
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }

    // ✅ DTO Class - ProgressReport diubah dari string ke int
    public class ReportDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public DateTime Date { get; set; }

        // ✅ UBAH DARI string KE int (sesuai dengan model Report)
        public int ProgressReport { get; set; }

        public int Status { get; set; }
        public int DoneBy { get; set; }
        public string DoneByName { get; set; } = "";
        public string ProjectId { get; set; } = "";
        public string ProjectName { get; set; } = "";
    }
}