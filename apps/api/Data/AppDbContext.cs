using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<PomodoroSession> PomodoroSessions => Set<PomodoroSession>();
    public DbSet<UserProgress> Progress => Set<UserProgress>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TaskItem>(entity =>
        {
            entity.Property(task => task.Titulo).HasMaxLength(200);
            entity.Property(task => task.Status).HasConversion<string>().HasMaxLength(20);
        });

        modelBuilder.Entity<PomodoroSession>(entity =>
        {
            entity.Property(session => session.Tipo).HasConversion<string>().HasMaxLength(20);
            entity
                .HasOne(session => session.Task)
                .WithMany()
                .HasForeignKey(session => session.TaskId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<UserProgress>(entity =>
        {
            entity.Property(progress => progress.PersonagemAtual).HasMaxLength(100);
        });
    }
}
