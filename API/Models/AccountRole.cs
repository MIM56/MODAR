using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace API.Models;

[Table("tb_r_accountroles")]
public class AccountRole
{
    [Key, Column("id")]
    public int Id { get; set; }
    [Required, Column("account_id")]
    public int AccountId { get; set; }
    [Required, Column("role_id")]
    public int RoleId { get; set; }

    // Relation
    [JsonIgnore]
    [ForeignKey("AccountId")]
    public Account? Account { get; set; }
    [JsonIgnore]
    [ForeignKey("RoleId")]
    public Role? Role { get; set; }
}