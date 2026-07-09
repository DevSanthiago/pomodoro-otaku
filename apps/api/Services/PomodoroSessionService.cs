using Api.Data;
using Api.Domain;
using Api.Endpoints;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public class PomodoroSessionService(AppDbContext db)
{
    public async Task<List<PomodoroSession>> GetAsync(Guid? taskId)
    {
        var query = db.PomodoroSessions.AsQueryable();
        if (taskId is not null)
        {
            query = query.Where(session => session.TaskId == taskId);
        }

        return await query.OrderByDescending(session => session.IniciadoEm).ToListAsync();
    }

    public async Task<OperationResult<PomodoroSession>> CreateAsync(CreateSessionDto dto)
    {
        if (dto.DuracaoSegundos <= 0)
        {
            return OperationResult<PomodoroSession>.Invalid(
                "duracaoSegundos", "Duração deve ser maior que zero");
        }

        if (dto.TaskId is not null && !await db.Tasks.AnyAsync(task => task.Id == dto.TaskId))
        {
            return OperationResult<PomodoroSession>.Invalid("taskId", "Tarefa não encontrada");
        }

        var session = new PomodoroSession
        {
            Id = Guid.NewGuid(),
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
