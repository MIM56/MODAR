using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Contexts;

public class MyContext : DbContext
{
    public MyContext(DbContextOptions<MyContext> options) : base(options)
    {
    }

    public DbSet<Account> Accounts { get; set; }
    public DbSet<AccountRole> AccountRoles { get; set; }
    public DbSet<Employee> Employees { get; set; }
    public DbSet<EmployeeProjectList> EmployeeProjectLists { get; set; }
    public DbSet<ProjectList> ProjectLists { get; set; }
    public DbSet<Report> Reports { get; set; }
    public DbSet<Role> Roles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Employee>().HasIndex(e => e.Phone).IsUnique();
        modelBuilder.Entity<Employee>().HasIndex(e => e.Email).IsUnique();

        modelBuilder.Entity<Employee>()
            .HasOne(e => e.Account)
            .WithOne(a => a.Employee)
            .HasForeignKey<Employee>(e => e.Id);

        modelBuilder.Entity<Employee>()
            .HasOne(e => e.Manager)
            .WithMany()
            .HasForeignKey(e => e.ManagerId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.NoAction);

        // ✅ PENTING: Employee.Id tidak auto-generate
        modelBuilder.Entity<Employee>().Property(e => e.Id).ValueGeneratedNever();

        // ✅ PENTING: Account.Id juga tidak auto-generate (karena kita set manual)
        modelBuilder.Entity<Account>().Property(a => a.Id).ValueGeneratedNever();
    }
}