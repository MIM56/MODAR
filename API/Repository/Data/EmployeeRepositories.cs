using API.Contexts;
using API.Models;
using API.Repository.Interface;
using Microsoft.EntityFrameworkCore;

namespace API.Repository.Data
{
    public class EmployeeRepositories : IRepository<Employee, int>
    {
        private readonly MyContext _context;

        public EmployeeRepositories(MyContext context)
        {
            _context = context;
        }

        public async Task<List<Employee>> Get()
        {
            return await _context.Employees.ToListAsync();
        }

        public async Task<Employee> Get(int id)
        {
            return await _context.Employees.FindAsync(id);
        }

        public async Task<Employee> Post(Employee entity)
        {
            _context.Employees.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<Employee> Put(Employee entity)
        {
            _context.Employees.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> Delete(int id)
        {
            var data = await _context.Employees.FindAsync(id);
            if (data == null) return false;

            _context.Employees.Remove(data);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}