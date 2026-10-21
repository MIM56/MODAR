using API.Models;
namespace API.ViewModels;

public class RegisterVM
{
    public string FullName { get; set; }
    public string Phone { get; set; }
    public Gender Gender { get; set; }
    public DateTime BirthDate { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
}