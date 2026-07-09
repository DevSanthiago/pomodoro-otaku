using Api.Data;
using Api.Domain;
using Api.Endpoints;
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
            Nivel = OneForAll.NivelParaXp(0),
            PersonagemAtual = OneForAll.PersonagemParaXp(0),
            AtualizadaEm = DateTime.UtcNow,
        };
        db.Progress.Add(progress);
        await db.SaveChangesAsync();
        return progress;
    }

    public async Task<UserProgress> UpsertAsync(PutProgressDto dto)
    {
        var progress = await GetOrCreateAsync();
        if (dto.AtualizadaEm < progress.AtualizadaEm) return progress;

        progress.XpTotal = Math.Max(0, dto.XpTotal);
        progress.FocosConcluidos = Math.Max(0, dto.FocosConcluidos);
        progress.TarefasConcluidas = Math.Max(0, dto.TarefasConcluidas);
        progress.StreakAtual = Math.Max(0, dto.StreakAtual);
        progress.StreakRecorde = Math.Max(0, dto.StreakRecorde);
        progress.UltimoDiaFoco = dto.UltimoDiaFoco;
        progress.ConquistasDesbloqueadas = dto.ConquistasDesbloqueadas;
        progress.AtualizadaEm = dto.AtualizadaEm;
        progress.Nivel = OneForAll.NivelParaXp(progress.XpTotal);
        progress.PersonagemAtual = OneForAll.PersonagemParaXp(progress.XpTotal);

        await db.SaveChangesAsync();
        return progress;
    }
}
