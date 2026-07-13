using Api.Data;
using Api.Domain;
using Api.Endpoints;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public class TaskService(AppDbContext db)
{
    public async Task<List<TaskItem>> GetAllAsync(string userId) =>
        await db.Tasks
            .Where(task => task.UserId == userId)
            .OrderByDescending(task => task.CriadaEm)
            .ToListAsync();

    public async Task<TaskItem?> GetAsync(string userId, Guid id) =>
        await db.Tasks.FirstOrDefaultAsync(task => task.Id == id && task.UserId == userId);

    public async Task<OperationResult<TaskItem>> CreateAsync(string userId, CreateTaskDto dto)
    {
        var error = TaskRules.ValidateTitulo(dto.Titulo);
        if (error is not null) return OperationResult<TaskItem>.Invalid("titulo", error);

        var now = DateTime.UtcNow;
        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Titulo = TaskRules.NormalizeTitulo(dto.Titulo),
            Descricao = TaskRules.NormalizeDescricao(dto.Descricao),
            Status = TaskItemStatus.Pendente,
            PomodorosEstimados = TaskRules.ClampEstimados(dto.PomodorosEstimados),
            PomodorosCompletados = 0,
            CriadaEm = now,
            AtualizadaEm = now,
        };

        db.Tasks.Add(task);
        await db.SaveChangesAsync();
        return OperationResult<TaskItem>.Success(task);
    }

    public async Task<OperationResult<TaskItem>> UpsertAsync(string userId, Guid id, PutTaskDto dto)
    {
        var error = TaskRules.ValidateTitulo(dto.Titulo);
        if (error is not null) return OperationResult<TaskItem>.Invalid("titulo", error);

        var task = await db.Tasks.FirstOrDefaultAsync(item => item.Id == id);

        if (task is not null && task.UserId != userId)
        {
            return OperationResult<TaskItem>.Invalid("id", "Tarefa pertence a outro usuário");
        }

        if (task is null)
        {
            task = new TaskItem { Id = id, UserId = userId, CriadaEm = dto.CriadaEm };
            db.Tasks.Add(task);
        }
        else if (dto.AtualizadaEm < task.AtualizadaEm)
        {
            return OperationResult<TaskItem>.Success(task);
        }

        task.Titulo = TaskRules.NormalizeTitulo(dto.Titulo);
        task.Descricao = TaskRules.NormalizeDescricao(dto.Descricao);
        task.Status = dto.Status;
        task.PomodorosEstimados = TaskRules.ClampEstimados(dto.PomodorosEstimados);
        task.PomodorosCompletados = TaskRules.ClampCompletados(dto.PomodorosCompletados);
        task.AtualizadaEm = dto.AtualizadaEm;

        await db.SaveChangesAsync();
        return OperationResult<TaskItem>.Success(task);
    }

    public async Task<bool> DeleteAsync(string userId, Guid id)
    {
        var task = await GetAsync(userId, id);
        if (task is null) return false;

        db.Tasks.Remove(task);
        await db.SaveChangesAsync();
        return true;
    }
}
