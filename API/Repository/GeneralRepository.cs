using API.Repository.Interface; // ✅ TAMBAHKAN BARIS INI
using Microsoft.EntityFrameworkCore;

namespace API.Repository.Data
{
    public class GeneralRepository<C, TEntity, T> : IRepository<TEntity, T>
        where TEntity : class
        where C : DbContext
    {
        private readonly C _context;

        public GeneralRepository(C context)
        {
            _context = context;
        }

        public async Task<List<TEntity>> Get()
        {
            return await _context.Set<TEntity>().ToListAsync();
        }

        public async Task<TEntity> Get(T id)
        {
            return await _context.Set<TEntity>().FindAsync(id);
        }

        public async Task<TEntity> Post(TEntity entity)
        {
            _context.Set<TEntity>().Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<TEntity> Put(TEntity entity)
        {
            _context.Set<TEntity>().Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> Delete(T id)
        {
            var data = await _context.Set<TEntity>().FindAsync(id);
            if (data == null) return false;

            _context.Set<TEntity>().Remove(data);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}