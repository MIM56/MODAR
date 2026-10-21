using API.Contexts;
using API.Models;
using API.Repository.Interface;
using Microsoft.EntityFrameworkCore;

namespace API.Repository.Data
{
    public class RoleRepositories : IRepository<Role, int>
    {
        private readonly MyContext _context;

        public RoleRepositories(MyContext context)
        {
            _context = context;
        }

        public async Task<List<Role>> Get()
        {
            return await _context.Roles.ToListAsync();
        }

        public async Task<Role> Get(int id)
        {
            return await _context.Roles.FindAsync(id);
        }

        public async Task<Role> Post(Role entity)
        {
            _context.Roles.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<Role> Put(Role entity)
        {
            _context.Roles.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> Delete(int id)
        {
            var data = await _context.Roles.FindAsync(id);
            if (data == null) return false;

            _context.Roles.Remove(data);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}