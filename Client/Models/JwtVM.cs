namespace API.ViewModels;

public class JwtVM
{
    // ✅ Gunakan PascalCase (huruf kapital di awal)
    public string Token { get; set; } = string.Empty;
    public int Status { get; set; }
    public string Message { get; set; } = string.Empty;
}