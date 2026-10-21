using API.ViewModels;

namespace Client.Repositories.Data;

public class LoginRepository
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public LoginRepository(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    // ✅ METHOD INI YANG HARUS ADA
    public async Task<JwtVM?> Login(LoginVM loginVM)
    {
        try
        {
            var baseUrl = _configuration["BaseUrl"] ?? "https://localhost:7261";
            var response = await _httpClient.PostAsJsonAsync(
                $"{baseUrl}/api/Accounts/Login",
                loginVM);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<JwtVM>();
                return result;
            }

            return null;
        }
        catch (Exception)
        {
            return null;
        }
    }

    public async Task<bool> Register(RegisterVM registerVM)
    {
        try
        {
            var baseUrl = _configuration["BaseUrl"] ?? "https://localhost:7261";
            var response = await _httpClient.PostAsJsonAsync(
                $"{baseUrl}/api/Accounts/Register",
                registerVM);

            return response.IsSuccessStatusCode;
        }
        catch (Exception)
        {
            return false;
        }
    }
}