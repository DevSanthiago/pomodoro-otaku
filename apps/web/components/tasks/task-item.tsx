"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/stores/task-store";
import { MAX_POMODOROS_ESTIMADOS, isConcluida, type Task } from "@/lib/task";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const toggleDone = useTaskStore((s) => s.toggleDone);
  const edit = useTaskStore((s) => s.edit);
  const remove = useTaskStore((s) => s.remove);

  const [editando, setEditando] = useState(false);
  const [titulo, setTitulo] = useState(task.titulo);
  const [descricao, setDescricao] = useState(task.descricao ?? "");
  const [estimados, setEstimados] = useState(task.pomodorosEstimados);

  const concluida = isConcluida(task);

  function iniciarEdicao() {
    setTitulo(task.titulo);
    setDescricao(task.descricao ?? "");
    setEstimados(task.pomodorosEstimados);
    setEditando(true);
  }

  async function salvarEdicao() {
    if (!titulo.trim()) return;
    await edit(task.id, {
      titulo,
      descricao,
      pomodorosEstimados: estimados,
    });
    setEditando(false);
  }

  if (editando) {
    return (
      <li className="flex flex-col gap-3 rounded-lg border border-border p-3">
        <Input
          value={titulo}
          onChange={(event) => setTitulo(event.target.value)}
          aria-label="Editar título"
        />
        <Input
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
          placeholder="Descrição (opcional)"
          aria-label="Editar descrição"
        />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            🍅 estimados
            <Input
              type="number"
              min={0}
              max={MAX_POMODOROS_ESTIMADOS}
              value={estimados}
              onChange={(event) => setEstimados(event.target.valueAsNumber)}
              aria-label="Editar pomodoros estimados"
              className="w-16"
            />
          </label>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setEditando(false)}>
              <X />
              Cancelar
            </Button>
            <Button size="sm" onClick={salvarEdicao}>
              <Check />
              Salvar
            </Button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-start gap-3 rounded-lg border border-border p-3">
      <Checkbox
        checked={concluida}
        onCheckedChange={() => toggleDone(task.id)}
        aria-label={concluida ? "Marcar como pendente" : "Marcar como concluída"}
        className="mt-0.5"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            "font-medium break-words",
            concluida && "text-muted-foreground line-through",
          )}
        >
          {task.titulo}
        </span>
        {task.descricao && (
          <span className="text-sm text-muted-foreground break-words">
            {task.descricao}
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          🍅 {task.pomodorosCompletados}/{task.pomodorosEstimados}
        </span>
      </div>
      <div className="flex gap-1">
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={iniciarEdicao}
          aria-label="Editar tarefa"
        >
          <Pencil />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => remove(task.id)}
          aria-label="Excluir tarefa"
        >
          <Trash2 />
        </Button>
      </div>
    </li>
  );
}
