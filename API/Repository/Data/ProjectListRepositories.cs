using API.Contexts;
using API.Models;
using API.Repository.Interface;
using Microsoft.EntityFrameworkCore;

namespace API.Repository.Data
{
    public class ProjectListRepositories : IRepository<ProjectList, string>
    {
        private readonly MyContext _context;

        public ProjectListRepositories(MyContext context)
        {
            _context = context;
        }

        public async Task<List<ProjectList>> Get()
        {
            return await _context.ProjectLists.ToListAsync();
        }

        public async Task<ProjectList> Get(string id)
        {
            return await _context.ProjectLists.FindAsync(id);
        }

        public async Task<ProjectList> Post(ProjectList entity)
        {
            _context.ProjectLists.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<ProjectList> Put(ProjectList entity)
        {
            _context.ProjectLists.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> Delete(string id)
        {
            var data = await _context.ProjectLists.FindAsync(id);
            if (data == null) return false;

            _context.ProjectLists.Remove(data);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}