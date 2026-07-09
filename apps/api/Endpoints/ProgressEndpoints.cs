using Api.Data;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints;

public static class ProgressEndpoints
{
    public static RouteGroupBuilder MapProgressEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/progress");

        group.MapGet("/", async (AppDbContext db) => await GetOrCreateProgress(db));

        group.MapPost("/xp", async (AddXpDto dto, AppDbContext db) =>
        {
            var progress = await GetOrCreateProgress(db);
            progress.XpTotal = Math.Max(0, progress.XpTotal + dto.Xp);
            progress.Nivel = Leveling.NivelParaXp(progress.XpTotal);
            await db.SaveChangesAsync();
            return progress;
        });

        return group;
    }

    private static async Task<UserProgress> GetOrCreateProgress(AppDbContext db)
    {
        var progress = await db.Progress.FirstOrDefaultAsync();
        if (progress is not null) return progress;

        progress = new UserProgress
        {
            Id = Guid.NewGuid(),
            Nivel = 1,
            PersonagemAtual = string.Empty,
        };
        db.Progress.Add(progress);
        await db.SaveChangesAsync();
        return progress;
    }
}
