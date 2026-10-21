using Client.Repositories.Interface;
using Microsoft.AspNetCore.Mvc;

namespace Client.Base
{
    public class BaseController<TEntity, TRepository, TId> : Controller
        where TEntity : class
        where TRepository : IRepository<TEntity, TId>
    {
        private readonly TRepository _repository;

        public BaseController(TRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _repository.Get();
            return Json(result);
        }

        [HttpGet]
        public async Task<IActionResult> Get(TId id)
        {
            var result = await _repository.Get(id);
            return Json(result);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] TEntity entity)
        {
            var result = await _repository.Post(entity);
            return Json(new { status = result });
        }

        [HttpPut]
        public async Task<IActionResult> Put([FromBody] TEntity entity)
        {
            var result = await _repository.Put(entity);
            return Json(new { status = result });
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(TId id)
        {
            var result = await _repository.Delete(id);
            return Json(new { status = result });
        }
    }
}