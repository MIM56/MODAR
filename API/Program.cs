using API.Contexts;
using API.Repository.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Core Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 2. Swagger Configuration
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "MODAR API", Version = "v1" });
    c.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());
});

// 3. Database Connection
// ⚠️ PASTIKAN "ModarConnection" ADA DI appsettings.json
builder.Services.AddDbContext<MyContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ModarConnection")));

// 4. ✅ CORS Configuration - WAJIB untuk Client-Server communication
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 5. Register ALL Repositories
builder.Services.AddScoped<AccountRepositories>();
builder.Services.AddScoped<AccountRoleRepositories>();
builder.Services.AddScoped<EmployeeRepositories>();
builder.Services.AddScoped<EmployeeProjectListRepositories>();
builder.Services.AddScoped<ProjectListRepositories>();
builder.Services.AddScoped<ReportRepositories>();
builder.Services.AddScoped<RoleRepositories>();

var app = builder.Build();

// 6. Configure HTTP Request Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// ✅ PENTING: UseCors HARUS sebelum UseAuthentication & UseAuthorization
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// 7. Run Application
app.Run();