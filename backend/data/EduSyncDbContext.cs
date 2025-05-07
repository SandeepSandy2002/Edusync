using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.data
{
    public class EduSyncDbContext : DbContext
    {
        public EduSyncDbContext(DbContextOptions<EduSyncDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<QuizResult> Results { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<QuizResult>()
                .Property(r => r.Answers)
                .HasColumnType("nvarchar(max)");
        }
    }
}
