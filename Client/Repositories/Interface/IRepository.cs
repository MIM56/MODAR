using System.Net;

namespace Client.Repositories.Interface
{
    public interface IRepository<TEntity, TId> where TEntity : class
    {
        Task<List<TEntity>> Get();
        Task<TEntity> Get(TId id);
        Task<HttpStatusCode> Post(TEntity entity);
        Task<HttpStatusCode> Put(TEntity entity);
        Task<HttpStatusCode> Delete(TId id);
    }
}