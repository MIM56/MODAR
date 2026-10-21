using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace API.Models;

[Table("tb_m_reports")]
public class Report
{
    [Key, Column("id")]
    public int Id { get; set; }

    [Required, Column("title"), MaxLength(100)]
    public string Title { get; set; } = null!;

    [Column("description"), MaxLength(500)]
    public string? Description { get; set; }

    [Required, Column("date")]
    public DateTime Date { get; set; }

    // ✅ UBAH DARI string KE int (sesuai database)
    // ✅ HAPUS [MaxLength] karena tidak perlu untuk int
    [Required, Column("progress_report")]
    public int ProgressReport { get; set; }

    [Column("status")]
    public int Status { get; set; }

    [Column("done_by")]
    public int DoneBy { get; set; }

    [Column("project_id")]
    public string ProjectId { get; set; } = null!;

    // Relations
    [JsonIgnore]
    public Employee? Employee { get; set; }

    [JsonIgnore]
    public ProjectList? ProjectList { get; set; }
}