using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace API.Models;

[Table("tb_m_projectlists")]
public class ProjectList
{
    [Key, Column("id", TypeName = "nchar(5)")]
    public string Id { get; set; }
    [Required, Column("name"), MaxLength(50)]
    public string Name { get; set; }
    [Required, Column("description"), MaxLength(255)]
    public string Description { get; set; }
    [Required, Column("status")]
    public Status Status { get; set; }
    [Required, Column("start_date")]
    public DateTime StartDate { get; set; }
    [Required, Column("end_date")]
    public DateTime EndDate { get; set; }
    [Required, Column("manager_id")]
    public int ManagerId { get; set; }
    [Required, Column("employee_id")]
    public int EmployeeId { get; set; }

    // Relation
    [JsonIgnore]
    public ICollection<Report>? Reports { get; set; }
    [JsonIgnore]
    public ICollection<EmployeeProjectList>? EmployeeProjectLists { get; set; }
}

public enum Status
{
    Pending,
    OnProgress,
    Complete
}