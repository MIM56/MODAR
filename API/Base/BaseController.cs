using API.Repository.Interface;
using Microsoft.AspNetCore.Mvc;

namespace API.Base
{
    [Route("api/[controller]")]
    [ApiController]
    public abstract class BaseController<TEntity, TRepository, TId> : ControllerBase
        where TEntity : class
        where TRepository : IRepository<TEntity, TId>
    {
        protected readonly TRepository _repository;

        protected BaseController(TRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public virtual async Task<IActionResult> GetAll()
        {
            var result = await _repository.Get();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public virtual async Task<IActionResult> Get(TId id)
        {
            var result = await _repository.Get(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public virtual async Task<IActionResult> Post([FromBody] TEntity entity)
        {
            var result = await _repository.Post(entity);
            return StatusCode(201, result);
        }

        [HttpPut("{id}")]
        public virtual async Task<IActionResult> Put(TId id, [FromBody] TEntity entity)
        {
            var result = await _repository.Put(entity);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public virtual async Task<IActionResult> Delete(TId id)
        {
            var result = await _repository.Delete(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}