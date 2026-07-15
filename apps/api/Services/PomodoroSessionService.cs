using Api.Data;
using Api.Domain;
using Api.Endpoints;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public class PomodoroSessionService(AppDbContext db)
{
    public async Task<List<PomodoroSession>> GetAsync(string userId, Guid? taskId)
    {
        var query = db.PomodoroSessions.Where(session => session.UserId == userId);
        if (taskId is not null)
        {
            query = query.Where(session => session.TaskId == taskId);
        }

        return await query.OrderByDescending(session => session.IniciadoEm).ToListAsync();
    }

    public async Task<OperationResult<PomodoroSession>> CreateAsync(string userId, CreateSessionDto dto)
    {
        if (dto.DuracaoSegundos <= 0)
        {
            return OperationResult<PomodoroSession>.Invalid(
                "duracaoSegundos", "Duração deve ser maior que zero");
        }

        if (dto.TaskId is not null
            && !await db.Tasks.AnyAsync(task => task.Id == dto.TaskId && task.UserId == userId))
        {
            return OperationResult<PomodoroSession>.Invalid("taskId", "Tarefa não encontrada");
        }

        var session = new PomodoroSession
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TaskId = dto.TaskId,
            Tipo = dto.Tipo,
            DuracaoSegundos = dto.DuracaoSegundos,
            IniciadoEm = dto.IniciadoEm,
            CompletadoEm = dto.CompletadoEm,
            FoiInterrompido = dto.FoiInterrompido,
        };

        db.PomodoroSessions.Add(session);
        await db.SaveChangesAsync();
        return OperationResult<PomodoroSession>.Success(session);
    }
}
