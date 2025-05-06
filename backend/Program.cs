using Microsoft.EntityFrameworkCore;
using backend.data;  // Replace with your actual namespace if different

namespace EduSync.Backend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            // Register DbContext with retry logic for transient errors
            builder.Services.AddDbContext<EduSyncDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
                    sqlOptions => sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 3,           // Number of retry attempts
                        maxRetryDelay: TimeSpan.FromSeconds(5), // Delay between retries
                        errorNumbersToAdd: null)    // Specify any specific error codes if needed
                )
            );

            // Add controllers to the container
            builder.Services.AddControllers();

            // Configure Swagger/OpenAPI
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();

            // Map the controllers (API routes)
            app.MapControllers();

            app.Run();
        }
    }
}
