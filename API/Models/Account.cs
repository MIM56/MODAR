using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace API.Models;

[Table("tb_m_accounts")]
public class Account
{
    [Key, Column("id")]
    public int Id { get; set; }

    // ✅ PERBAIKAN: Tambahkan '= null!' untuk mencegah warning CS8618
    [Required, Column("password")]
    public string Password { get; set; } = null!;

    [Column("otp")]
    public int OTP { get; set; }

    [Column("expired_token")]
    public DateTime ExpiredToken { get; set; }

    [Column("is_used")]
    public bool IsUsed { get; set; }

    // Relations
    [JsonIgnore]
    public Employee? Employee { get; set; }

    [JsonIgnore]
    public ICollection<AccountRole>? AccountRoles { get; set; }
}