namespace Client.Models
{
    public class LoginApiResponse
    {
        public int statusCode { get; set; }
        public string message { get; set; }
        public LoginData data { get; set; }
    }

    public class LoginData
    {
        public string token { get; set; }
        public string email { get; set; }
        public List<string> roles { get; set; }
    }

    public class LoginViewModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}