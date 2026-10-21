namespace API.ViewModels
{
    public class MProjectVM
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public Status Status { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int ManagerId { get; set; }
        public string Manager { get; set; }
        public string Employee { get; set; }
        public string StringStatus { get; set; }
    }
}