namespace API.ViewModels
{
    public class MEmployeeVM
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Phone { get; set; }
        public string Gender { get; set; }
        public DateTime BirthDate { get; set; }
        public byte[]? Image { get; set; }
        public int? ManagerId { get; set; }
        public string Email { get; set; }
    }
}