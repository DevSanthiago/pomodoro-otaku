using Api.Data;
using Api.Domain;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public class ProgressService(AppDbContext db)
{
    public async Task<UserProgress> GetOrCreateAsync()
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

    public async Task<UserProgress> AddXpAsync(int xp)
    {
        var progress = await GetOrCreateAsync();
        progress.XpTotal = Math.Max(0, progress.XpTotal + xp);
        progress.Nivel = Leveling.NivelParaXp(progress.XpTotal);
        await db.SaveChangesAsync();
        return progress;
    }
}
