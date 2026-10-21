using API.Contexts;
using API.Handlers;
using API.Models;
using API.Repository.Interface;
using API.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace API.Repository.Data
{
    public class AccountRepositories : IRepository<Account, int>
    {
        private readonly MyContext _context;

        public AccountRepositories(MyContext context)
        {
            _context = context;
        }

        public async Task<List<Account>> Get()
        {
            return await _context.Accounts.ToListAsync();
        }

        public async Task<Account> Get(int id)
        {
            return await _context.Accounts.FindAsync(id);
        }

        public async Task<Account> Post(Account entity)
        {
            _context.Accounts.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<Account> Put(Account entity)
        {
            _context.Accounts.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> Delete(int id)
        {
            var data = await _context.Accounts.FindAsync(id);
            if (data == null) return false;

            _context.Accounts.Remove(data);
            await _context.SaveChangesAsync();
            return true;
        }

        public int Register(RegisterVM register)
        {
            int id = GenerateId();
            if (!CheckEmailPhone(register.Email, register.Phone))
            {
                return 0;
            }

            int index = register.FullName.IndexOf(' ');
            string firstName, lastName;
            if (index <= 0)
            {
                firstName = register.FullName;
                lastName = register.FullName;
            }
            else
            {
                firstName = register.FullName.Substring(0, index);
                lastName = register.FullName.Substring(index + 1);
            }

            Employee employee = new Employee()
            {
                Id = id,
                Phone = register.Phone,
                Gender = register.Gender,
                BirthDate = register.BirthDate,
                Email = register.Email,
                FirstName = firstName,
                LastName = lastName,
                ManagerId = null
            };

            _context.Employees.Add(employee);
            _context.SaveChanges();

            Account account = new Account()
            {
                Id = id,
                Password = Hashing.HashPassword(register.Password),
            };
            _context.Accounts.Add(account);
            _context.SaveChanges();

            AccountRole accountRole = new AccountRole()
            {
                AccountId = id,
                RoleId = 3
            };
            _context.AccountRoles.Add(accountRole);
            _context.SaveChanges();

            return 1;
        }

        public int Login(LoginVM login)
        {
            var result = _context.Accounts
                .Join(_context.Employees, a => a.Id, e => e.Id, (a, e) => new LoginVM
                {
                    Email = e.Email,
                    Password = a.Password
                })
                .SingleOrDefault(c => c.Email == login.Email);

            if (result == null) return 0;
            if (!Hashing.ValidatePassword(login.Password, result.Password)) return 1;
            return 2;
        }

        private bool CheckEmailPhone(string email, string phone)
        {
            return !_context.Employees.Any(s => s.Email == email || s.Phone == phone);
        }

        private int GenerateId()
        {
            var empCount = _context.Employees.OrderByDescending(e => e.Id).FirstOrDefault();
            return empCount == null ? 11111 : empCount.Id + 1;
        }

        public List<string> UserRoles(string email)
        {
            var employee = _context.Employees.SingleOrDefault(e => e.Email == email);
            if (employee == null) return new List<string>();

            return (from ar in _context.AccountRoles
                    join r in _context.Roles on ar.RoleId equals r.Id
                    where ar.AccountId == employee.Id
                    select r.Name).ToList();
        }
    }
}