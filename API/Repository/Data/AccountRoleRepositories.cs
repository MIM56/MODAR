using API.Contexts;
using API.Models;
using API.Repository.Interface;
using Microsoft.EntityFrameworkCore;

namespace API.Repository.Data
{
    public class AccountRoleRepositories : IRepository<AccountRole, int>
    {
        private readonly MyContext _context;

        public AccountRoleRepositories(MyContext context)
        {
            _context = context;
        }

        public async Task<List<AccountRole>> Get()
        {
            return await _context.AccountRoles.ToListAsync();
        }

        public async Task<AccountRole> Get(int id)
        {
            return await _context.AccountRoles.FindAsync(id);
        }

        public async Task<AccountRole> Post(AccountRole entity)
        {
            _context.AccountRoles.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<AccountRole> Put(AccountRole entity)
        {
            _context.AccountRoles.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> Delete(int id)
        {
            var data = await _context.AccountRoles.FindAsync(id);
            if (data == null) return false;

            _context.AccountRoles.Remove(data);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}