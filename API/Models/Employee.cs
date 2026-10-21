using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace API.Models;

[Table("tb_m_employees")]
public class Employee
{
    // ✅ PERBAIKAN: Tambahkan [ForeignKey] untuk memperjelas relationship dengan Account
    [Key, Column("id"), ForeignKey(nameof(Account))]
    public int Id { get; set; }

    [Required, Column("first_name"), MaxLength(20)]
    public string FirstName { get; set; } = null!;

    [Column("last_name"), MaxLength(20)]
    public string? LastName { get; set; }

    [Required, Column("gender")]
    public Gender Gender { get; set; }

    [Required, Column("email"), MaxLength(50)]
    public string Email { get; set; } = null!;

    [Required, Column("phone_number"), MaxLength(15)]
    public string Phone { get; set; } = null!;

    [Required, Column("birth_date")]
    public DateTime BirthDate { get; set; }

    [Column("image")]
    public byte[]? Image { get; set; }

    [Column("manager_id")]
    public int? ManagerId { get; set; }

    // Relations
    [JsonIgnore]
    public Account? Account { get; set; }

    [JsonIgnore]
    public Employee? Manager { get; set; }

    [JsonIgnore]
    public ICollection<EmployeeProjectList>? EmployeeProjectList { get; set; }
}

public enum Gender
{
    Male,
    Female
}