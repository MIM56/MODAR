using API.Contexts;
using API.Models;
using API.Repository.Interface;
using Microsoft.EntityFrameworkCore;

namespace API.Repository.Data
{
    public class ReportRepositories : IRepository<Report, int>
    {
        private readonly MyContext _context;

        public ReportRepositories(MyContext context)
        {
            _context = context;
        }

        public async Task<List<Report>> Get()
        {
            return await _context.Reports.ToListAsync();
        }

        public async Task<Report> Get(int id)
        {
            return await _context.Reports.FindAsync(id);
        }

        public async Task<Report> Post(Report entity)
        {
            _context.Reports.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<Report> Put(Report entity)
        {
            _context.Reports.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> Delete(int id)
        {
            var data = await _context.Reports.FindAsync(id);
            if (data == null) return false;

            _context.Reports.Remove(data);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}