using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace API.Models;

[Table("tb_r_employeeprojectlists")]
public class EmployeeProjectList
{
    [Key, Column("id")]
    public int Id { get; set; }
    [Required, Column("employee_id")]
    public int EmployeeId { get; set; }
    [Required, Column("projectlist_id", TypeName = "nchar(5)")]
    public string ProjectListId { get; set; }

    // Relation
    [JsonIgnore]
    [ForeignKey("EmployeeId")]
    public Employee? Employee { get; set; }
    [JsonIgnore]
    [ForeignKey("ProjectListId")]
    public ProjectList? ProjectList { get; set; }
}