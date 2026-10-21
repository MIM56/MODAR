namespace API.ViewModels;  // ✅ Namespace harus sesuai

public class JwtVM
{
    public string Token { get; set; } = string.Empty;   // ✅ PascalCase
    public int Status { get; set; }
    public string Message { get; set; } = string.Empty;
}