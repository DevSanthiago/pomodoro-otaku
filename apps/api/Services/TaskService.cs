using Api.Data;
using Api.Domain;
using Api.Endpoints;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public class TaskService(AppDbContext db)
{
    public async Task<List<TaskItem>> GetAllAsync() =>
        await db.Tasks.OrderByDescending(task => task.CriadaEm).ToListAsync();

    public async Task<TaskItem?> GetAsync(Guid id) => await db.Tasks.FindAsync(id);

    public async Task<OperationResult<TaskItem>> CreateAsync(CreateTaskDto dto)
    {
        var error = TaskRules.ValidateTitulo(dto.Titulo);
        if (error is not null) return OperationResult<TaskItem>.Invalid("titulo", error);

        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            Titulo = TaskRules.NormalizeTitulo(dto.Titulo),
            Descricao = TaskRules.NormalizeDescricao(dto.Descricao),
            Status = TaskItemStatus.Pendente,
            PomodorosEstimados = TaskRules.ClampEstimados(dto.PomodorosEstimados),
            PomodorosCompletados = 0,
            CriadaEm = DateTime.UtcNow,
        };

        db.Tasks.Add(task);
        await db.SaveChangesAsync();
        return OperationResult<TaskItem>.Success(task);
    }

    public async Task<OperationResult<TaskItem>> UpdateAsync(Guid id, UpdateTaskDto dto)
    {
        var error = TaskRules.ValidateTitulo(dto.Titulo);
        if (error is not null) return OperationResult<TaskItem>.Invalid("titulo", error);

        var task = await db.Tasks.FindAsync(id);
        if (task is null) return OperationResult<TaskItem>.NotFound();

        task.Titulo = TaskRules.NormalizeTitulo(dto.Titulo);
        task.Descricao = TaskRules.NormalizeDescricao(dto.Descricao);
        task.Status = dto.Status;
        task.PomodorosEstimados = TaskRules.ClampEstimados(dto.PomodorosEstimados);
        task.PomodorosCompletados = TaskRules.ClampCompletados(dto.PomodorosCompletados);

        await db.SaveChangesAsync();
        return OperationResult<TaskItem>.Success(task);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var task = await db.Tasks.FindAsync(id);
        if (task is null) return false;

        db.Tasks.Remove(task);
        await db.SaveChangesAsync();
        return true;
    }
}
