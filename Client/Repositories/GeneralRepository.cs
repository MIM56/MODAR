using Client.Base;
using Client.Repositories.Interface;
using Newtonsoft.Json;
using System.Net;
using System.Text;

namespace Client.Repositories
{
    public class GeneralRepository<TEntity, TId> : IRepository<TEntity, TId> where TEntity : class
    {
        private readonly Address _address;
        private readonly string _request;
        private readonly HttpClient _httpClient;

        public GeneralRepository(Address address, string request)
        {
            _address = address;
            _request = request;

            _httpClient = new HttpClient
            {
                BaseAddress = new Uri(_address.Link)
            };
        }

        public async Task<HttpStatusCode> Delete(TId id)
        {
            var result = await _httpClient.DeleteAsync($"{_request}Delete?id={id}");
            return result.StatusCode;
        }

        public async Task<List<TEntity>> Get()
        {
            var response = await _httpClient.GetAsync(_request);
            if (response.IsSuccessStatusCode)
            {
                string apiResponse = await response.Content.ReadAsStringAsync();
                return JsonConvert.DeserializeObject<List<TEntity>>(apiResponse) ?? new List<TEntity>();
            }
            return new List<TEntity>();
        }

        public async Task<TEntity> Get(TId id)
        {
            var response = await _httpClient.GetAsync($"{_request}Search?id={id}");
            if (response.IsSuccessStatusCode)
            {
                string apiResponse = await response.Content.ReadAsStringAsync();
                return JsonConvert.DeserializeObject<TEntity>(apiResponse);
            }
            return null;
        }

        public async Task<HttpStatusCode> Put(TEntity entity)
        {
            StringContent content = new StringContent(
                JsonConvert.SerializeObject(entity),
                Encoding.UTF8,
                "application/json"
            );
            var result = await _httpClient.PutAsync(_request, content);
            return result.StatusCode;
        }

        public async Task<HttpStatusCode> Post(TEntity entity)
        {
            StringContent content = new StringContent(
                JsonConvert.SerializeObject(entity),
                Encoding.UTF8,
                "application/json"
            );
            var result = await _httpClient.PostAsync(_request, content);
            return result.StatusCode;
        }
    }
}