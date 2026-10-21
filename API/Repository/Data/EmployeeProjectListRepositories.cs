using API.Contexts;
using API.Models;
using API.Repository.Interface;
using Microsoft.EntityFrameworkCore;

namespace API.Repository.Data
{
    public class EmployeeProjectListRepositories : IRepository<EmployeeProjectList, int>
    {
        private readonly MyContext _context;

        public EmployeeProjectListRepositories(MyContext context)
        {
            _context = context;
        }

        public async Task<List<EmployeeProjectList>> Get()
        {
            return await _context.EmployeeProjectLists.ToListAsync();
        }

        public async Task<EmployeeProjectList> Get(int id)
        {
            return await _context.EmployeeProjectLists.FindAsync(id);
        }

        public async Task<EmployeeProjectList> Post(EmployeeProjectList entity)
        {
            _context.EmployeeProjectLists.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<EmployeeProjectList> Put(EmployeeProjectList entity)
        {
            _context.EmployeeProjectLists.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> Delete(int id)
        {
            var data = await _context.EmployeeProjectLists.FindAsync(id);
            if (data == null) return false;

            _context.EmployeeProjectLists.Remove(data);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}