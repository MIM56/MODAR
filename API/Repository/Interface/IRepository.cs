namespace API.Repository.Interface
{
    public interface IRepository<TEntity, TId> where TEntity : class
    {
        Task<List<TEntity>> Get();
        Task<TEntity> Get(TId id);
        Task<TEntity> Post(TEntity entity);
        Task<TEntity> Put(TEntity entity);
        Task<bool> Delete(TId id);
    }
}